import { BadRequestException, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { Server, Socket } from 'socket.io';
import { EnterRoomDto, LeaveRoomDto, SendTextDto } from 'src/dto/chat/chat-gateway.dto';
import { MessageResponseDto } from 'src/dto/chat/message.response.dto';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { RedisService } from 'src/infra/redis/redis.service';
import { LlmCloneService, MessageRequestContext } from '../llm/llm-clone.service';
import { ChatService } from './chat.service';

interface U extends Socket {
  userId?: number;
  active?: Set<number>;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: 'http://localhost:3001', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private chatSrv: ChatService,
    private redis: RedisService,
    private llm: LlmCloneService,
    private prisma: PrismaService,
  ) {}

  // connection handling

  /**
   * Handle client connection
   * @param client Client socket
   */
  async handleConnection(client: U) {
    const sid = parse(client.request.headers.cookie || '').session_id;
    if (!sid) return client.disconnect();

    const session = await this.redis.get(`session:${sid}`);
    if (!session) return client.disconnect();

    client.userId = JSON.parse(session).id;
    client.active = new Set();
    client.join(`user:${client.userId}`);

    // send initial chat list
    if (client.userId !== undefined) {
      const list = await this.chatSrv.getConversations(client.userId);
      client.emit('chatListUpdate', list);
    }
  }

  /**
   * Handle client disconnection
   * @param client Client socket
   */
  handleDisconnect(client: U) {
    client.active?.clear();
  }

  // event handling

  /**
   * Handle client entering a room
   * @param client Client socket
   * @param dto Enter room data
   */
  @SubscribeMessage('enter')
  async enterRoom(@ConnectedSocket() c: U, @MessageBody() dto: EnterRoomDto) {
    if (c.userId === undefined) return;

    await this.chatSrv.markRead(c.userId, dto.cid);
    c.join(`conv:${dto.cid}`);
    c.active?.add(dto.cid);

    // send updated chat list
    c.emit('chatListUpdate', await this.chatSrv.getConversations(c.userId));
  }

  /**
   * Handle client leaving a room
   * @param client Client socket
   * @param dto Leave room data
   */
  @SubscribeMessage('leave')
  async leaveRoom(@ConnectedSocket() c: U, @MessageBody() dto: LeaveRoomDto) {
    if (c.userId === undefined) return;

    // 화면에서 나갈 때 읽음 처리를 다시 한번 수행
    await this.chatSrv.markRead(c.userId, dto.cid);
    c.active?.delete(dto.cid);

    // 읽음 처리 후 채팅 목록 업데이트
    c.emit('chatListUpdate', await this.chatSrv.getConversations(c.userId));
  }

  /**
   * Handle client sending a text message
   * @param client Client socket
   * @param dto Text message data
   */
  @SubscribeMessage('text')
  async sendText(@ConnectedSocket() c: U, @MessageBody() dto: SendTextDto) {
    if (c.userId === undefined) return;

    const msg = await this.chatSrv.createText(c.userId, dto.cid, dto.text);
    await this.broadcast(dto.cid, msg);

    // Check if this is a BETA_BAE conversation and generate a response
    try {
      // Get conversation details to check type
      const conv = await this.prisma.conversation.findUnique({
        where: { id: dto.cid },
        select: { type: true },
      });

      // Check if this is a BETA_BAE conversation type
      if (conv && conv.type === 'BETA_BAE') {
        const raw = await this.redis.get(`messages:${dto.cid}`);
        if (!raw) {
          throw new BadRequestException('No conversation info found in Redis');
        }
        const conversationInfo: {
          partnerId: number;
          messages: { sender_id: number; message_text: string }[];
        } = JSON.parse(raw || '{}');

        if (!conversationInfo?.messages || !conversationInfo.partnerId) {
          throw new BadRequestException('Conversation info missing or malformed');
        }

        const messages: MessageRequestContext[] = conversationInfo.messages.map((msg) => ({
          role: msg.sender_id === 0 ? 'user' : 'partner',
          content: msg.message_text,
        }));

        const bot = await this.llm.getBetaBaeResponse(c.userId, {
          partnerId: conversationInfo.partnerId,
          messages,
        });

        const botMsg = await this.chatSrv.createText(0, dto.cid, bot);
        // const bot = '[Beta Bae] This feature is under development.';
        // const botMsg = await this.chatSrv.createText(0, dto.cid, bot);
        await this.broadcast(dto.cid, botMsg);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error handling BETA_BAE response: ${error.message}`, error.stack);
      } else {
        this.logger.error('Error handling BETA_BAE response: Unknown error');
      }
    }
  }

  /**
   * Broadcast message to all clients in a conversation
   * @param cid Conversation ID
   * @param msg Message to broadcast
   */
  public async broadcast(cid: number, msg: MessageResponseDto) {
    this.server.to(`conv:${cid}`).emit('newMessage', msg);

    // update chat list
    const { requesterUserId, requestedUserId } = await this.chatSrv.getConversationWithUsers(cid);
    await Promise.all(
      [requesterUserId, requestedUserId].map(async (uid) => {
        const list = await this.chatSrv.getConversations(uid);
        this.server.to(`user:${uid}`).emit('chatListUpdate', list);
      }),
    );
  }
}
