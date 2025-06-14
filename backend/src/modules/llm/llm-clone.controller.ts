import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  BetaBaeCreateRequestDto,
  BetaBaeUpdateRequestDto,
} from 'src/modules/llm/dto/betabae-clone.dto';
import {
  RealBaeThoughtRequestDto,
  RealBaeThoughtResponseDto,
} from 'src/modules/llm/dto/realbae-thought.dto';
import { BetaBaeMessageRequest, LlmCloneService } from 'src/modules/llm/llm-clone.service';
import { AuthenticatedRequest } from 'src/modules/types/authenticated-request.interface';

@Controller('llm-clone')
export class LlmCloneController {
  constructor(private readonly llmCloneService: LlmCloneService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async createBetaBae(@Req() req: AuthenticatedRequest, @Body() body: BetaBaeCreateRequestDto) {
    await this.llmCloneService.createBetaBae(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Post('delete')
  async deleteBetaBae(@Req() req: AuthenticatedRequest) {
    await this.llmCloneService.deleteBetaBae(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('update')
  async updateBetaBae(@Req() req: AuthenticatedRequest, @Body() body: BetaBaeUpdateRequestDto) {
    await this.llmCloneService.updateBetaBae(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Post('response')
  async getBetaBaeResponse(@Req() req: AuthenticatedRequest, @Body() body: BetaBaeMessageRequest) {
    return await this.llmCloneService.getBetaBaeResponse(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Post('real-bae-thought')
  async getRealBaeThoughtResponse(
    @Req() req: AuthenticatedRequest,
    @Body() body: RealBaeThoughtRequestDto,
  ): Promise<RealBaeThoughtResponseDto> {
    return await this.llmCloneService.getRealBaeThoughtResponse(req.user.id, body);
  }

  // Testing purpose APIs
  @Post('test-create')
  async testCreateBetaBae(@Body() body: BetaBaeCreateRequestDto & { userId: number }) {
    await this.llmCloneService.createBetaBae(body.userId, body);
  }

  @Post('test-delete')
  async testDeleteBetaBae(@Body() body: { userId: number }) {
    await this.llmCloneService.deleteBetaBae(body.userId);
  }

  @Post('test-update')
  async testUpdateBetaBae(@Body() body: BetaBaeUpdateRequestDto & { userId: number }) {
    await this.llmCloneService.updateBetaBae(body.userId, body);
  }

  @Post('test-response')
  async testGetBetaBaeResponse(@Body() body: BetaBaeMessageRequest & { userId: number }) {
    return await this.llmCloneService.getBetaBaeResponse(body.userId, body);
  }

  @Post('test-real-bae-thought')
  async testGetRealBaeThoughtResponse(
    @Body()
    body: {
      userId: number;
      messageText: string;
      contextText: string;
      matchId: number;
    },
  ): Promise<string> {
    return await this.llmCloneService.getTestRealBaeThoughtResponse(
      body.messageText,
      body.userId,
      body.contextText,
      body.matchId,
    );
  }
}
