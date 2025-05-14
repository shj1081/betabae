import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CreateMatchRequestDto } from 'src/dto/match/match.request.dto';
import { MatchListResponseDto, MatchResponseDto } from 'src/dto/match/match.response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { MatchService } from './match.service';
import { AuthenticatedRequest } from 'src/modules/types/authenticated-request.interface';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * Creates a match request from the current user to the requested user
   * @param req the request object, which contains the user's id in the session
   * @param dto the requested user's id
   * @returns a BasicResponseDto containing the created match
   */
  @UseGuards(AuthGuard)
  @Post()
  async createMatch(@Req() req: AuthenticatedRequest, @Body() dto: CreateMatchRequestDto) {
    const match = await this.matchService.createMatch(req.user.id, dto.requestedId);

    return new MatchResponseDto(match);
  }

  /**
   * Accepts a match request from the current user to the user who requested the match
   * @param req the request object, which contains the user's id in the session
   * @param matchId the id of the match to accept
   * @returns a BasicResponseDto containing the accepted match
   */
  @UseGuards(AuthGuard)
  @Post(':id/accept')
  async acceptMatch(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) matchId: number) {
    const match = await this.matchService.acceptMatch(req.user.id, matchId);

    return new MatchResponseDto(match);
  }

  /**
   * Rejects a match request from the current user to the user who requested the match
   * @param req the request object, which contains the user's id in the session
   * @param matchId the id of the match to reject
   * @returns a BasicResponseDto containing the rejected match
   */
  @UseGuards(AuthGuard)
  @Post(':id/reject')
  async rejectMatch(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) matchId: number) {
    const match = await this.matchService.rejectMatch(req.user.id, matchId);

    return new MatchResponseDto(match);
  }

  /**
   * Retrieves all match requests sent to the current user
   * @param req the request object, which contains the user's id in the session
   * @returns a BasicResponseDto containing the received match requests
   */
  @UseGuards(AuthGuard)
  @Get('received')
  async getReceivedMatches(@Req() req: AuthenticatedRequest) {
    const matches = await this.matchService.getReceivedMatches(req.user.id);

    return new MatchListResponseDto(matches);
  }

  /**
   * Retrieves all match requests associated with the current user
   * @param req the request object, which contains the user's id in the session
   * @returns a BasicResponseDto containing all matches
   */
  @UseGuards(AuthGuard)
  @Get()
  async getAllMatches(@Req() req: AuthenticatedRequest) {
    const matches = await this.matchService.getAllMatches(req.user.id);

    return new MatchListResponseDto(matches);
  }
}
