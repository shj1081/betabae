import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversationType } from '@prisma/client';
import { Request } from 'express';
import { SendMessageDto } from 'src/dto/chat/message.request.dto';
import { BasicResponseDto } from 'src/dto/common/basic.response.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';

import { ChatAnalysisRequestDto } from 'src/dto/chat/chat-analysis.request.dto';
import { ChatAnalysisResponseDto } from 'src/dto/chat/chat-analysis.response.dto';
import { ConversationListResponseDto } from 'src/dto/chat/conversation.response.dto';
import { MessageListResponseDto } from 'src/dto/chat/message.response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ChatAnalysisService } from './chat-analysis.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Controller('chat/conversations')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatAnalysisService: ChatAnalysisService,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Get a list of conversations for the given user. This endpoint is called when the user navigates to the chat page.
   * @param req The request object.
   * @returns A BasicResponseDto containing a list of conversations.
   */
  @Get()
  async getConversations(@Req() req: Request) {
    const userId = Number(req['user'].id);
    const result = await this.chatService.getConversations(userId);
    return new ConversationListResponseDto(
      result.conversations,
      result.totalUnreadCount,
    );
  }

  /**
   * Get messages for a specific conversation. This endpoint is called when the user navigates to a specific conversation.
   * @param req The request object.
   * @param conversationId The ID of the conversation to retrieve messages for.
   * @param limit The maximum number of messages to retrieve.
   * @param before The ID of the message to retrieve messages before.
   * @returns A BasicResponseDto containing the messages.
   */
  @Get(':conversationId/messages')
  async getMessages(
    @Req() req: Request,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('limit') limit?: number,
    @Query('before') before?: number,
  ) {
    const userId = Number(req['user'].id);
    const messages = await this.chatService.getMessages(
      userId,
      conversationId,
      limit ? Number(limit) : undefined,
      before ? Number(before) : undefined,
    );

    // 읽음처리
    await this.chatGateway.markMessagesAsRead(userId, conversationId);

    return new MessageListResponseDto(messages);
  }

  /**
   * Send a text message to a specific conversation. This endpoint is called when the user sends a text message.
   *
   * @param req The request object.
   * @param conversationId The ID of the conversation to send the message to.
   * @param dto The SendMessageDto containing the message text.
   * @returns A BasicResponseDto with a success message.
   */
  @Post(':conversationId/messages/text')
  async sendTextMessage(
    @Req() req: Request,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() dto: SendMessageDto,
  ) {
    const userId = Number(req['user'].id);
    
    // Get conversation to check type
    const conversation = await this.chatService.getConversationEntity(conversationId);
    
    if (conversation.type === ConversationType.BETA_BAE) {
      // For beta_bae conversations, delegate to the gateway
      // The gateway will handle both user message and bot response
      await this.chatGateway.processBetaBaeMessage(
        userId,
        conversationId,
        dto.messageText
      );
      
      return new BasicResponseDto('Message processed successfully');
    } else {
      // For regular conversations, delegate to the gateway
      // The gateway will handle saving the message and broadcasting it
      await this.chatGateway.processAndBroadcastMessage(
        userId,
        conversationId,
        dto.messageText
      );
      
      return new BasicResponseDto('Message processed successfully');
    }
  }

  /**
   * Send an image message to a specific conversation. This endpoint is called when the user sends an image message.
   * TODO: should be revised!!!!
   *
   * @param req The request object containing user information.
   * @param conversationId The ID of the conversation to send the message to.
   * @param messageText Optional text accompanying the image.
   * @param file The image file to be sent.
   * @returns A BasicResponseDto containing the message details.
   * @throws BadRequestException if the file is not found in the request.
   */
  @Post(':conversationId/messages/image')
  @UseInterceptors(FileInterceptor('file'))
  async sendImageMessage(
    @Req() req: Request,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body('messageText') messageText: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = Number(req['user'].id);

    if (!file) {
      throw new BadRequestException(
        new ErrorResponseDto('File not found in the request'),
      );
    }

    await this.chatService.sendImageMessage(
      userId,
      conversationId,
      file,
      messageText,
    );

    return new BasicResponseDto('Image message sent successfully');
  }

  /**
   * Analyze chat messages for a given messageId and its context.
   * @param req The request object.
   * @param dto The ChatAnalysisRequestDto containing the messageId.
   * @returns A BasicResponseDto containing the analysis result.
   */
  @Post('analysis')
  async analyzeChat(@Req() req: Request, @Body() dto: ChatAnalysisRequestDto) {
    const userId = Number(req['user'].id);
    const result = await this.chatAnalysisService.analyzeChat(dto, userId);
    return new ChatAnalysisResponseDto(result.analysis, result.llmRawResponse);
  }
}
