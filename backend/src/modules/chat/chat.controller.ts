import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversationType } from '@prisma/client';
import { Request } from 'express';
import { ConversationListResponseDto } from 'src/dto/chat/conversation.response.dto';
import { MessageQueryDto } from 'src/dto/chat/message-query.dto';
import {
  SendFileMessageDto,
  SendImageMessageDto,
  SendMessageDto,
} from 'src/dto/chat/message.request.dto';
import { MessageListResponseDto, MessageResponseDto } from 'src/dto/chat/message.response.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Controller('chat/conversations')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Get()
  async getConversations(
    @Req() r: Request,
    @Query('type') type: string,
  ): Promise<ConversationListResponseDto> {
    let conversationType: ConversationType | undefined;

    if (type) {
      if (type.toLowerCase() === 'betabae') {
        conversationType = ConversationType.BETA_BAE;
      } else if (type.toLowerCase() === 'realbae') {
        conversationType = ConversationType.REAL_BAE;
      }
      // If 'all' or any other value, leave conversationType as undefined
    }

    const { conversations, totalUnreadCount } = await this.chatService.getConversations(
      Number(r['user'].id),
      conversationType,
    );
    return new ConversationListResponseDto(conversations, totalUnreadCount);
  }

  @Get(':cid/messages')
  async getMessages(
    @Req() r: Request,
    @Param('cid', ParseIntPipe) cid: number,
    @Query() query: MessageQueryDto,
  ): Promise<MessageListResponseDto> {
    const messages = await this.chatService.getMessages(
      Number(r['user'].id),
      cid,
      query.limit,
      query.before,
    );
    return new MessageListResponseDto(messages);
  }

  @Post(':cid/messages/text')
  async sendTextMessage(
    @Req() r: Request,
    @Param('cid', ParseIntPipe) cid: number,
    @Body() dto: SendMessageDto,
  ): Promise<{ ok: boolean; message: MessageResponseDto }> {
    // Create a message directly through the service
    const message = await this.chatService.createText(Number(r['user'].id), cid, dto.messageText);

    // Broadcast the message through the gateway
    await this.chatGateway.broadcast(cid, message);

    return { ok: true, message };
  }

  @Post(':cid/messages/image')
  @UseInterceptors(FileInterceptor('file'))
  async sendImageMessage(
    @Req() r: Request,
    @Param('cid', ParseIntPipe) cid: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SendImageMessageDto,
  ): Promise<{ ok: boolean; message: MessageResponseDto }> {
    if (!file) {
      throw new BadRequestException(new ErrorResponseDto('File is required'));
    }

    const message = await this.chatService.createImage(
      Number(r['user'].id),
      cid,
      file,
      dto.messageText,
    );

    await this.chatGateway.broadcast(cid, message);
    return { ok: true, message };
  }

  @Post(':cid/messages/file')
  @UseInterceptors(FileInterceptor('file'))
  async sendFileMessage(
    @Req() r: Request,
    @Param('cid', ParseIntPipe) cid: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SendFileMessageDto,
  ): Promise<{ ok: boolean; message: MessageResponseDto }> {
    if (!file) {
      throw new BadRequestException(new ErrorResponseDto('File is required'));
    }

    const message = await this.chatService.createFile(
      Number(r['user'].id),
      cid,
      file,
      dto.messageText,
    );

    await this.chatGateway.broadcast(cid, message);
    return { ok: true, message };
  }
}
