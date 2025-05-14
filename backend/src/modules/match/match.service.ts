import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { MatchResponseDto } from 'src/dto/match/match.response.dto';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async createMatch(
    requesterId: number,
    requestedId: number,
  ): Promise<MatchResponseDto> {
    // Check if users exist
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw new NotFoundException(
        new ErrorResponseDto(`Requester with ID ${requesterId} not found`),
      );
    }

    // if the requested user is the same as the requester, throw an error
    if (requesterId === requestedId) {
      throw new BadRequestException(
        new ErrorResponseDto('Requester and requested user cannot be the same'),
      );
    }

    const requested = await this.prisma.user.findUnique({
      where: { id: requestedId },
    });

    if (!requested) {
      throw new NotFoundException(
        new ErrorResponseDto(`Requested user with ID ${requestedId} not found`),
      );
    }

    // Check if a match already exists between these users
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        OR: [
          {
            requester_id: requesterId,
            requested_id: requestedId,
          },
          {
            requester_id: requestedId,
            requested_id: requesterId,
          },
        ],
      },
    });

    if (existingMatch) {
      throw new BadRequestException(
        new ErrorResponseDto('A match already exists between these users'),
      );
    }

    // Create the match
    const match = await this.prisma.match.create({
      data: {
        requester_id: requesterId,
        requested_id: requestedId,
        status: MatchStatus.PENDING,
        requester_consent: true, // Requester consents by default
        requested_consent: false, // Requested user hasn't consented yet
      },
      include: {
        requester: {
          select: {
            id: true,
            legal_name: true,
          },
        },
        requested: {
          select: {
            id: true,
            legal_name: true,
          },
        },
      },
    });

    return this.mapMatchToDto(match);
  }

  async acceptMatch(
    userId: number,
    matchId: number,
  ): Promise<MatchResponseDto> {
    const match = await this.getMatchById(matchId);

    // Ensure the user is the requested user in the match
    if (match.requested_id !== userId) {
      throw new BadRequestException(
        new ErrorResponseDto('Only the requested user can accept this match'),
      );
    }

    // Ensure match is in PENDING status
    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(
        new ErrorResponseDto(`Match is already ${match.status.toLowerCase()}`),
      );
    }

    // Update match status to ACCEPTED
    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.ACCEPTED,
        requested_consent: true,
      },
      include: {
        requester: {
          select: {
            id: true,
            legal_name: true,
          },
        },
        requested: {
          select: {
            id: true,
            legal_name: true,
          },
        },
      },
    });

    // Create separate BETA_BAE conversations for each user
    // One for the requester
    await this.prisma.conversation.create({
      data: {
        match_id: matchId,
        type: 'BETA_BAE',
        user_specific_id: updatedMatch.requester_id, // Specify this is for the requester
      },
    });

    // One for the requested user
    await this.prisma.conversation.create({
      data: {
        match_id: matchId,
        type: 'BETA_BAE',
        user_specific_id: updatedMatch.requested_id, // Specify this is for the requested user
      },
    });

    return this.mapMatchToDto(updatedMatch);
  }

  async rejectMatch(
    userId: number,
    matchId: number,
  ): Promise<MatchResponseDto> {
    const match = await this.getMatchById(matchId);

    // Ensure the user is the requested user in the match
    if (match.requested_id !== userId) {
      throw new BadRequestException(
        new ErrorResponseDto('Only the requested user can reject this match'),
      );
    }

    // Ensure match is in PENDING status
    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(
        new ErrorResponseDto(`Match is already ${match.status.toLowerCase()}`),
      );
    }

    // Update match status to REJECTED
    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.REJECTED,
      },
      include: {
        requester: {
          select: {
            id: true,
            legal_name: true,
          },
        },
        requested: {
          select: {
            id: true,
            legal_name: true,
          },
        },
      },
    });

    return this.mapMatchToDto(updatedMatch);
  }

  async getReceivedMatches(userId: number): Promise<MatchResponseDto[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        requested_id: userId,
        status: MatchStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            legal_name: true,
          },
        },
        requested: {
          select: {
            id: true,
            legal_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return matches.map((match) => this.mapMatchToDto(match));
  }

  async getAllMatches(userId: number): Promise<MatchResponseDto[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ requester_id: userId }, { requested_id: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            legal_name: true,
          },
        },
        requested: {
          select: {
            id: true,
            legal_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return matches.map((match) => this.mapMatchToDto(match));
  }

  private async getMatchById(matchId: number) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(
        new ErrorResponseDto(`Match with ID ${matchId} not found`),
      );
    }

    return match;
  }

  async consentToMatch(
    userId: number,
    matchId: number,
  ): Promise<MatchResponseDto> {
    const match = await this.getMatchById(matchId);

    // Ensure the user is part of the match
    if (match.requester_id !== userId && match.requested_id !== userId) {
      throw new BadRequestException(
        new ErrorResponseDto('User is not part of this match'),
      );
    }

    // Ensure match is in ACCEPTED status
    if (match.status !== MatchStatus.ACCEPTED) {
      throw new BadRequestException(
        new ErrorResponseDto('Match must be accepted before consenting to direct conversation'),
      );
    }

    // Update the appropriate consent field based on the user's role
    const isRequester = match.requester_id === userId;
    const updateData: any = {};
    
    if (isRequester) {
      updateData.requester_consent = true;
    } else {
      updateData.requested_consent = true;
    }

    // Update the match with the consent
    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            legal_name: true,
          },
        },
        requested: {
          select: {
            id: true,
            legal_name: true,
          },
        },
      },
    });

    // If both users have consented, create a REAL_BAE conversation
    if (updatedMatch.requester_consent && updatedMatch.requested_consent) {
      await this.prisma.conversation.create({
        data: {
          match_id: matchId,
          type: 'REAL_BAE',
          user_specific_id: null, // Shared conversation between both users
        },
      });
    }

    return this.mapMatchToDto(updatedMatch);
  }

  private mapMatchToDto(match: any): MatchResponseDto {
    return plainToInstance(
      MatchResponseDto,
      {
        id: match.id,
        requester: match.requester,
        requested: match.requested,
        status: match.status,
        requesterConsent: match.requester_consent,
        requestedConsent: match.requested_consent,
        createdAt: match.created_at,
        updatedAt: match.updated_at,
      },
      { excludeExtraneousValues: true },
    );
  }
}
