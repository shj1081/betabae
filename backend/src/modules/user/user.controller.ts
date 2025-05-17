import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { AuthenticatedRequest } from 'src/modules/types/authenticated-request.interface';
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
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    const userData = await this.userService.getUserProfile(req.user.id);

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
    @Req() req: AuthenticatedRequest,
    @Body() dto: UserProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const updatedUser = await this.userService.updateOrCreateUserProfile(
      req.user.id,
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
  async getUserPersonality(@Req() req: AuthenticatedRequest) {
    const personality = await this.userService.getUserPersonality(req.user.id);

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
    @Req() req: AuthenticatedRequest,
    @Body() dto: UserPersonalityDto,
  ) {
    const updatedPersonality = await this.userService.updateOrCreateUserPersonality(
      req.user.id,
      dto,
    );

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
  async updateUserCredential(@Req() req: AuthenticatedRequest, @Body() dto: UpdateCredentialDto) {
    await this.userService.updateUserCredential(req.user.id, dto);

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
  async getUserLoveLanguage(@Req() req: AuthenticatedRequest) {
    const loveLanguage = await this.userService.getUserLoveLanguage(req.user.id);

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
    @Req() req: AuthenticatedRequest,
    @Body() dto: UserLoveLanguageDto,
  ) {
    const updatedLoveLanguage = await this.userService.updateOrCreateUserLoveLanguage(
      req.user.id,
      dto,
    );

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
    @Req() req: AuthenticatedRequest,
    @Body() dto: PersonalitySurveyScoreRequestDto,
  ) {
    const result = await this.userService.scorePersonalitySurvey(req.user.id, dto);
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
    @Req() req: AuthenticatedRequest,
    @Body() dto: LoveLanguageSurveyScoreRequestDto,
  ) {
    const result = await this.userService.scoreLoveLanguageSurvey(req.user.id, dto);
    return new UserLoveLanguageResponseDto(result);
  }

  /**
   * Get comprehensive user information including profile, personality, and love language data
   * 
   * @param id - The ID of the user to fetch information for
   * @returns Combined user information including profile, personality, and love language data
   * @throws NotFoundException if the user, personality, or love language data is not found
   */
  @UseGuards(AuthGuard)
  @Get('info/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserInfo(id);
  }
}
