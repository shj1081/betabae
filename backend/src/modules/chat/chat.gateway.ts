import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { Server, Socket } from 'socket.io';
import { MessageResponseDto } from 'src/dto/chat/message.response.dto';
import { RedisService } from 'src/infra/redis/redis.service';
import { LlmService } from '../llm/llm.service';
import { ChatService } from './chat.service';

/// Socket.io에서 사용하는 Socket 인터페이스 확장
interface AuthenticatedSocket extends Socket {
  userId?: number;
  activeRooms?: Set<number>; // Track which conversation rooms the user is actively viewing
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly llmService: LlmService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // 클라이언트에서 전달한 session_id 조회
      const sessionId = parse(client.request.headers.cookie || '').session_id;
      
      if (!sessionId) {
        console.log('No session_id in cookies; disconnecting');
        client.disconnect();
        return;
      }

      // Redis에서 세션 조회
      const sessionKey = `session:${sessionId}`;
      const sessionData = await this.redisService.get(sessionKey);
      if (!sessionData) {
        console.log('Session not found in Redis; disconnecting');
        client.disconnect();
        return;
      }

      // 유저 정보 파싱
      const userData = JSON.parse(sessionData) as { id: string; email: string };
      client.userId = Number(userData.id);
      client.activeRooms = new Set(); // Initialize empty set of active rooms

      // 유저 전용 socket room join
      client.join(`user:${userData.id}`);
      console.log(`Client connected: ${client.id}, user: ${userData.id}`);
      
      // Send initial chat list update when user connects
      // This ensures real-time updates start immediately upon login
      await this.sendChatListUpdate(client);
    } catch (error) {
      console.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clear active rooms when client disconnects
    client.activeRooms = new Set();
  }

  /**
   * Handle when a user enters a chat room screen
   * This is different from joining a conversation (membership)
   */
  @SubscribeMessage('enterChatRoomScreen')
  async enterChatRoomScreen(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    if (!client.userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const { conversationId } = data;
      const conversation =
        await this.chatService.getConversationEntity(conversationId);

      // Add to socket room for this conversation
      client.join(`conversation:${conversationId}`);
      
      // Track that this client is actively viewing this room
      if (!client.activeRooms) {
        client.activeRooms = new Set();
      }
      client.activeRooms.add(conversationId);
      
      // Mark all messages as read when entering the chat room screen
      await this.chatService.markMessagesAsRead(client.userId, conversationId);

      return {
        success: true,
        message: `Entered chat room screen for conversation ${conversationId} and marked messages as read`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to enter chat room screen',
      };
    }
  }

  /**
   * Handle when a user leaves a chat room screen (navigates away)
   * This is different from exiting a conversation (membership removal)
   */
  @SubscribeMessage('leaveChatRoomScreen')
  leaveChatRoomScreen(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const { conversationId } = data;
    
    // Remove from active rooms tracking
    if (client.activeRooms) {
      client.activeRooms.delete(conversationId);
    }
    
    // Note: We don't leave the socket room here to keep receiving updates
    // for unread count purposes
    
    return { success: true, message: 'Left chat room screen' };
  }
  
  /**
   * Handle when a user exits a conversation (membership removal)
   */
  @SubscribeMessage('exitConversation')
  async exitConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    if (!client.userId) {
      return { success: false, message: 'Unauthorized' };
    }
    
    const { conversationId } = data;
    
    try {
      // Remove from active rooms tracking
      if (client.activeRooms) {
        client.activeRooms.delete(conversationId);
      }
      
      // Leave the socket room
      client.leave(`conversation:${conversationId}`);
      
      // Here you would add logic to remove the user from the conversation membership
      // This would typically be handled by the ChatService
      
      return { success: true, message: 'Exited conversation successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to exit conversation',
      };
    }
  }

  @SubscribeMessage('sendMessage')
  async sendTextMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number; messageText: string },
  ) {
    if (!client.userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const { conversationId, messageText } = data;
      // conversation 조회
      const conversation =
        await this.chatService.getConversationEntity(conversationId);

      // 실시간 메시지 전송
      const message = await this.chatService.sendTextMessage(
        client.userId,
        conversationId,
        messageText,
      );

      await this.broadcastNewMessage(conversationId, message, client.userId);
      
      // Update chat list for all users in the conversation
      await this.updateChatListForConversation(conversationId);

      return { success: true, message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send message',
      };
    }
  }
  

  
  /**
   * Process and broadcast a new message to all clients in a conversation
   * This method is called by controllers to handle message sending
   */
  async processAndBroadcastMessage(userId: number, conversationId: number, messageText: string) {
    try {
      // Save the message to the database using the chat service
      const message = await this.chatService.sendTextMessage(
        userId,
        conversationId,
        messageText
      );
      
      // Broadcast the message to all clients
      await this.broadcastNewMessage(conversationId, message, userId);
      
      // Update chat list for all users in the conversation
      await this.updateChatListForConversation(conversationId);
      
      return { success: true, message };
    } catch (error) {
      console.error('Failed to process and broadcast message:', error);
      return { success: false, message: error.message || 'Failed to send message' };
    }
  }
  
  /**
   * Process a beta_bae message through the LLM service and broadcast it
   * This method is called by controllers to handle beta_bae messages
   */
  async processBetaBaeMessage(userId: number, conversationId: number, userMessageText: string) {
    try {
      // First send the user message
      await this.processAndBroadcastMessage(userId, conversationId, userMessageText);
      
      // Get response from LLM
      const botResponse = await this.llmService.getBotResponse(userMessageText);
      
      // Then send the bot response
      const botUserId = 0; // Use 0 or a designated bot user ID
      const message = await this.chatService.sendTextMessage(
        botUserId,
        conversationId,
        botResponse
      );
      
      // Broadcast the bot message
      await this.broadcastNewMessage(conversationId, message, botUserId);
      
      // Update chat list for all users
      await this.updateChatListForConversation(conversationId);
      
      return { success: true, message };
    } catch (error) {
      console.error('Failed to process beta_bae message:', error);
      throw error;
    }
  }

  /**
   * Broadcast a new message to all clients in a conversation
   * @private Internal method used by public gateway methods
   */
  private async broadcastNewMessage(conversationId: number, message: MessageResponseDto, senderId: number) {
    // Broadcast to all clients in the conversation room
    this.server
      .to(`conversation:${conversationId}`)
      .emit('newMessage', message);
    
    // Get conversation users
    const conversationData =
      await this.chatService.getConversationWithUsers(conversationId);
      
    if (!conversationData) return;
    
    // Find other users in the conversation
    const otherUserId =
      senderId === conversationData.requesterUserId
        ? conversationData.requestedUserId
        : conversationData.requesterUserId;
    
    // Get all connected sockets for this user
    const userSockets = await this.server.in(`user:${otherUserId}`).fetchSockets();
    const authenticatedSockets = userSockets as unknown as AuthenticatedSocket[];
    
    // For each connected socket of the recipient
    for (const socket of authenticatedSockets) {
      // If the user is not actively viewing this conversation
      if (!socket.activeRooms || !socket.activeRooms.has(conversationId)) {
        // Send notification with unread count
        socket.emit('messageNotification', {
          conversationId,
          message,
        });
      }
    }
  }
  
  /**
   * Mark messages as read in a conversation
   * This method is called by controllers when a user views messages
   */
  async markMessagesAsRead(userId: number, conversationId: number) {
    try {
      // Mark messages as read in the database
      await this.chatService.markMessagesAsRead(userId, conversationId);
      
      // Update chat list for the user to reflect read status
      const userSockets = await this.server.in(`user:${userId}`).fetchSockets();
      const authenticatedSockets = userSockets as unknown as AuthenticatedSocket[];
      
      for (const socket of authenticatedSockets) {
        await this.sendChatListUpdate(socket);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      return { success: false, message: error.message || 'Failed to mark messages as read' };
    }
  }

  /**
   * Send chat list update to a specific client
   * @private Internal method used by public gateway methods
   */
  private async sendChatListUpdate(client: AuthenticatedSocket) {
    if (!client.userId) return;
    
    try {
      const conversations = await this.chatService.getConversations(client.userId);
      client.emit('chatListUpdate', conversations);
    } catch (error) {
      console.error('Failed to send chat list update:', error);
    }
  }
  
  /**
   * Update chat list for all users in a conversation
   * @private Internal method used by public gateway methods
   */
  private async updateChatListForConversation(conversationId: number) {
    try {
      const conversationData = 
        await this.chatService.getConversationWithUsers(conversationId);
      
      if (!conversationData) return;
      
      // Update chat list for both users
      const userIds = [
        conversationData.requesterUserId,
        conversationData.requestedUserId
      ];
      
      for (const userId of userIds) {
        const userSockets = await this.server.in(`user:${userId}`).fetchSockets();
        const authenticatedSockets = userSockets as unknown as AuthenticatedSocket[];
        
        for (const socket of authenticatedSockets) {
          await this.sendChatListUpdate(socket);
        }
      }
    } catch (error) {
      console.error('Failed to update chat list for conversation:', error);
    }
  }
}
