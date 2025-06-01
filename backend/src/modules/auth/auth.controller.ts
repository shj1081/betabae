import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginResponseDto } from 'src/dto/auth/login-response.dto';
import { LoginRequestDto } from 'src/dto/auth/login.request.dto';
import { RegisterRequestDto } from 'src/dto/auth/register.request.dto';
import { BasicResponseDto } from 'src/dto/common/basic.response.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user registration by validating credentials and creating a session.
   *
   * After registration, a session ID is generated and stored in a cookie.
   *
   * @param dto - Data transfer object containing email and password for registration
   * @param res - Response object to set cookies
   * @returns A response indicating successful registration with user email
   */
  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionId, userId } = await this.authService.registerAndLogin(dto);

    // auto login after register
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only in production
      sameSite: 'lax',
      path: '/',
    });

    // Check if user has profile, personality, and love language data
    const { hasProfile, hasPersonality, hasLoveLanguage } = await this.authService.checkUserDataStatus(userId);

    // use login response dto bcs auto login after register
    return new LoginResponseDto(dto.email, hasProfile, hasLoveLanguage, hasPersonality);
  }

  /**
   * Handles user login by validating credentials and creating a session.
   *
   * If a session already exists, an exception is thrown.
   * On successful login, a session ID is generated and stored in a cookie.
   *
   * @param dto - Data transfer object containing email and password for login
   * @param req - Request object to access cookies
   * @param res - Response object to set cookies
   * @returns A response indicating successful login with user email
   * @throws BadRequestException if user is already logged in
   */
  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // session의 경우 ttl이 infinite이라고 가정
    // check if user is already logged in
    const currentSessionId = req.cookies.session_id as string | undefined;
    if (currentSessionId) {
      throw new BadRequestException(
        new ErrorResponseDto(`User session ${currentSessionId} already exists`),
      );
    }

    const { sessionId, userId } = await this.authService.login(dto.email, dto.password);

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only in production
      sameSite: 'lax',
      path: '/',
    });

    // Check if user has profile, personality, and love language data
    const { hasProfile, hasPersonality, hasLoveLanguage } = await this.authService.checkUserDataStatus(userId);

    return new LoginResponseDto(dto.email, hasProfile, hasLoveLanguage, hasPersonality);
  }

  /**
   * Logs out the current user by clearing the session cookie and removing the session from storage.
   *
   * @param req - Request object to access cookies to get the session ID.
   * @param res - Response object to clear the session cookie.
   * @returns A response indicating successful logout.
   * @throws BadRequestException if there is no session ID found in cookies.
   */
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies.session_id as string | undefined;
    if (!sessionId) {
      throw new BadRequestException(new ErrorResponseDto('Session not found'));
    }

    await this.authService.logout(sessionId);
    res.clearCookie('session_id');
    return new BasicResponseDto('Logout successful');
  }
}
