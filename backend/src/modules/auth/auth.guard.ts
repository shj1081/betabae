import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { RedisService } from 'src/infra/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies.session_id as string | undefined;

    if (!sessionId) {
      throw new UnauthorizedException(
        new ErrorResponseDto('Session not found'),
      );
    }

    const sessionKey = `session:${sessionId}`;
    const sessionData = await this.redisService.get(sessionKey);

    if (!sessionData) {
      throw new UnauthorizedException(new ErrorResponseDto('Invalid session'));
    }

    // Store user data in request object for easy access (redis value always stored as string)
    request['user'] = JSON.parse(sessionData) as { id: string; email: string };
    return true;
  }
}
