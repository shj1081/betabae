import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { BasicResponseDto } from 'src/dto/common/basic.response.dto';
import { UpdateCredentialDto } from 'src/dto/user/credential.request.dto';
import { LoveLanguageSurveyScoreRequestDto } from 'src/dto/user/lovelanguage-survey-score.request.dto';
import { UserLoveLanguageDto } from 'src/dto/user/lovelanguage.request.dto';
import { UserLoveLanguageResponseDto } from 'src/dto/user/lovelanguage.response.dto';
import { PersonalitySurveyScoreRequestDto } from 'src/dto/user/personality-survey-score.request.dto';
import { UserPersonalityDto } from 'src/dto/user/personality.request.dto';
import { UserPersonalityResponseDto } from 'src/dto/user/personality.response.dto';
import { UserProfileDto } from 'src/dto/user/profile.request.dto';
import { UserProfileResponseDto } from 'src/dto/user/profile.response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get the profile information of the current user.
   *
   * @param req - The request object containing user information.
   * @returns The profile data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  async getUserProfile(@Req() req: Request) {
    const userId = Number(req['user'].id);
    const userData = await this.userService.getUserProfile(userId);

    return new UserProfileResponseDto(userData.user, userData.profile);
  }

  /**
   * Update or create the profile information of the current user.
   *
   * @param req - The request object containing user information.
   * @param dto - The profile data transfer object.
   * @returns The updated profile data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the dto is invalid.
   */
  @UseGuards(AuthGuard)
  @Put('profile')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateOrCreateUserProfile(
    @Req() req: Request,
    @Body() dto: UserProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const userId = Number(req['user'].id);
    const updatedUser = await this.userService.updateOrCreateUserProfile(
      userId,
      dto,
      profileImage,
    );

    return new UserProfileResponseDto(updatedUser.user, updatedUser.profile);
  }

  /**
   * Get the personality information of the current user.
   *
   * @param req - The request object containing user information.
   * @returns The personality data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   */
  @UseGuards(AuthGuard)
  @Get('personality')
  async getUserPersonality(@Req() req: Request) {
    const userId = Number(req['user'].id);
    const personality = await this.userService.getUserPersonality(userId);

    return new UserPersonalityResponseDto(personality);
  }

  /**
   * Update or create the personality information of the current user.
   *
   * @param req - The request object containing user information.
   * @param dto - The personality data transfer object.
   * @returns The updated personality data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the dto is invalid.
   */
  @UseGuards(AuthGuard)
  @Put('personality')
  async updateOrCreateUserPersonality(
    @Req() req: Request,
    @Body() dto: UserPersonalityDto,
  ) {
    const userId = Number(req['user'].id);
    const updatedPersonality =
      await this.userService.updateOrCreateUserPersonality(userId, dto);

    return new UserPersonalityResponseDto(updatedPersonality);
  }

  /**
   * Update the credential information of the current user, such as the password.
   *
   * @param req - The request object containing user information.
   * @param dto - The credential update data transfer object.
   * @returns BasicResponseDto indicating success.
   * @throws UnauthorizedException if the current password is incorrect.
   * @throws NotFoundException if the user is not found.
   */
  @UseGuards(AuthGuard)
  @Put('credential')
  async updateUserCredential(
    @Req() req: Request,
    @Body() dto: UpdateCredentialDto,
  ) {
    const userId = Number(req['user'].id);
    await this.userService.updateUserCredential(userId, dto);

    return new BasicResponseDto('User credential updated successfully');
  }

  /**
   * Get the love language information of the current user.
   *
   * @param req - The request object containing user information.
   * @returns The love language data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   */
  @UseGuards(AuthGuard)
  @Get('lovelanguage')
  async getUserLoveLanguage(@Req() req: Request) {
    const userId = Number(req['user'].id);
    const loveLanguage = await this.userService.getUserLoveLanguage(userId);

    return new UserLoveLanguageResponseDto(loveLanguage);
  }

  /**
   * Update or create the love language information of the current user.
   *
   * @param req - The request object containing user information.
   * @param dto - The love language data transfer object.
   * @returns The updated love language data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the dto is invalid.
   */
  @UseGuards(AuthGuard)
  @Put('lovelanguage')
  async updateOrCreateUserLoveLanguage(
    @Req() req: Request,
    @Body() dto: UserLoveLanguageDto,
  ) {
    const userId = Number(req['user'].id);
    const updatedLoveLanguage =
      await this.userService.updateOrCreateUserLoveLanguage(userId, dto);

    return new UserLoveLanguageResponseDto(updatedLoveLanguage);
  }

  /**
   * Calculate and update the personality traits of the current user based on survey answers.
   *
   * @param dto - The personality survey score data transfer object.
   * @returns The updated personality data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the dto is invalid.
   */
  @UseGuards(AuthGuard)
  @Post('personality/score')
  async scorePersonalitySurvey(
    @Req() req: Request,
    @Body() dto: PersonalitySurveyScoreRequestDto,
  ) {
    const userId = Number(req['user'].id);
    const result = await this.userService.scorePersonalitySurvey(userId, dto);
    return new UserPersonalityResponseDto(result);
  }

  /**
   * Calculate and update the love language of the current user based on survey answers.
   *
   * @param dto - The love language survey score data transfer object.
   * @returns The updated love language data of the user in the response body.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the dto is invalid.
   */
  @UseGuards(AuthGuard)
  @Post('lovelanguage/score')
  async scoreLoveLanguageSurvey(
    @Req() req: Request,
    @Body() dto: LoveLanguageSurveyScoreRequestDto,
  ) {
    const userId = Number(req['user'].id);
    const result = await this.userService.scoreLoveLanguageSurvey(userId, dto);
    return new UserLoveLanguageResponseDto(result);
  }
}
