import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from 'src/dto/auth/register.request.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';

import { PrismaService } from 'src/infra/prisma/prisma.service';
import { RedisService } from 'src/infra/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async registerAndLogin(dto: RegisterRequestDto) {
    // check if user already exists
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user)
      throw new BadRequestException(
        new ErrorResponseDto(`Email ${dto.email} already exists`),
      );

    // hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // create user with basic information only
    const createdUser = await this.prisma.user.create({
      data: {
        legal_name: dto.legal_name,
        email: dto.email,
        password_hash: hashedPassword,
      },
    });

    // auto login after register
    // Generate session
    const sessionId = uuidv4();
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify({ id: createdUser.id, email: dto.email }),
    );
    return { sessionId, userId: createdUser.id };
  }

  async login(email: string, password: string): Promise<{ sessionId: string, userId: number }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException(new ErrorResponseDto('User not found'));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(new ErrorResponseDto('Invalid password'));
    }
    // Generate session
    const sessionId = uuidv4();
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify({ id: user.id, email: user.email }),
    );
    return { sessionId, userId: user.id };
  }

  async logout(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;

    // Check if session exists before logout
    const session = await this.redis.get(sessionKey);
    if (!session) {
      throw new BadRequestException(
        new ErrorResponseDto('Session not found, invalid session'),
      );
    }

    // Session exists, proceed with logout
    await this.redis.del(sessionKey);
  }

  /**
   * Check if a user has profile, personality, and love language data
   * 
   * @param userId - The ID of the user to check
   * @returns Object with boolean flags indicating whether each type of data exists
   */
  async checkUserDataStatus(userId: number): Promise<{ hasProfile: boolean, hasPersonality: boolean, hasLoveLanguage: boolean }> {
    // Execute all findUnique calls in parallel
    const [profile, personality, loveLanguage] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { user_id: userId } }),
      this.prisma.userPersonality.findUnique({ where: { user_id: userId } }),
      this.prisma.userLoveLanguage.findUnique({ where: { user_id: userId } }),
    ]);
    return {
      hasProfile: !!profile,
      hasPersonality: !!personality,
      hasLoveLanguage: !!loveLanguage,
    };
  }
}
