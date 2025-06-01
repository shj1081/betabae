import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  BetaBaeCreateRequestDto,
  BetaBaeUpdateRequestDto,
} from 'src/modules/llm/dto/betabae-clone.dto';
import { BetaBaeMessageRequest, LlmCloneService } from 'src/modules/llm/llm-clone.service';
import { AuthenticatedRequest } from 'src/modules/types/authenticated-request.interface';

@Controller('llm-clone')
export class LlmCloneController {
  constructor(private readonly llmCloneService: LlmCloneService) {}

  @Post('create')
  async createBetaBae(@Req() req: AuthenticatedRequest, @Body() body: BetaBaeCreateRequestDto) {
    await this.llmCloneService.createBetaBae(req.user.id, body);
  }

  @Post('delete')
  async deleteBetaBae(@Req() req: AuthenticatedRequest) {
    await this.llmCloneService.deleteBetaBae(req.user.id);
  }

  @Post('update')
  async updateBetaBae(@Req() req: AuthenticatedRequest, @Body() body: BetaBaeUpdateRequestDto) {
    await this.llmCloneService.updateBetaBae(req.user.id, body);
  }

  @Post('response')
  async getBetaBaeResponse(@Req() req: AuthenticatedRequest, @Body() body: BetaBaeMessageRequest) {
    return await this.llmCloneService.getBetaBaeResponse(req.user.id, body);
  }
}
