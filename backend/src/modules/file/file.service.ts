import { BadRequestException, Injectable } from '@nestjs/common';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';

import { UploadFileResponseDto } from '../../dto/file/upload-file.response.dto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { S3Service } from '../../infra/s3/s3.service';

// REVIEW: s3와 DB 삽입 삭제가 한 transaction으로 이뤄져야하는데, 구현이 어려움 (순서와 에러 핸들링을 통해 무결성 보장?)
@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getFile(fileId: number): Promise<string> {
    const media = await this.prisma.media.findUnique({
      where: { id: fileId },
    });

    if (!media) {
      throw new BadRequestException(new ErrorResponseDto('File not found'));
    }

    return media.file_url;
  }

  async uploadFile(
    file: Express.Multer.File,
    context: string,
  ): Promise<UploadFileResponseDto> {
    if (!file) {
      throw new BadRequestException(new ErrorResponseDto('File is required'));
    }
    if (!context) {
      throw new BadRequestException(
        new ErrorResponseDto('Context is required'),
      );
    }

    // S3 -> DB 순서로 진행하여 무결성 보장
    const fileUrl = await this.s3Service.uploadFile(file, context);

    const media = await this.prisma.media.create({
      data: {
        file_url: fileUrl,
        file_type: file.mimetype,
        context,
      },
    });

    return {
      id: media.id,
      url: media.file_url,
      type: media.file_type,
    };
  }

  async deleteFile(fileId: number): Promise<void> {
    const media = await this.prisma.media.findUnique({
      where: { id: fileId },
    });

    if (!media) {
      throw new BadRequestException(new ErrorResponseDto('File not found'));
    }

    // DB -> S3 순서로 진행하여 무결성 보장
    await this.prisma.media.delete({
      where: { id: fileId },
    });
    await this.s3Service.deleteFile(media.file_url);
  }
}
