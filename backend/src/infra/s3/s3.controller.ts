import {
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BasicResponseDto } from 'src/dto/common/basic.response.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { S3Service } from './s3.service';

// TODO: test controller for s3 (should be deleted before production)
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const location = await this.s3Service.uploadFile(file, 'test'); // save on test directory
      return new BasicResponseDto(location);
    } catch (error) {
      return new ErrorResponseDto(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  @Delete()
  async deleteFile(@Query('url') url: string) {
    try {
      await this.s3Service.deleteFile(url);
      return new BasicResponseDto('File deleted successfully');
    } catch (error) {
      return new ErrorResponseDto(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
