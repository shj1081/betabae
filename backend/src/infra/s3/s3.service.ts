import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly isLocal: boolean;

  constructor() {
    this.isLocal = process.env.NODE_ENV === 'development';
    console.log('[S3 Service] ', this.isLocal ? 'minio' : 'aws s3');

    this.s3 = new S3({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
      ...(this.isLocal
        ? {
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            tls: false,
          }
        : {}),
    });
  }

  async uploadFile(file: Express.Multer.File, context: string) {
    const key = `${context}/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // acl setup but for dev, just use bucket policy to public-read
    });

    const result = await this.s3.send(command);

    if (!result) {
      throw new InternalServerErrorException(
        new ErrorResponseDto(
          'File upload failed',
        ),
      );
    }

    // local minio and aws s3 url format is different
    if (this.isLocal) {
      return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
    }
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
  }

  // delete file from s3
  async deleteFile(fileUrl: string) {
    let key: string;
    if (this.isLocal) {
      key = fileUrl.split(`${process.env.S3_BUCKET_NAME}/`)[1];
    } else {
      key = fileUrl.split('.amazonaws.com/')[1];
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: key,
    });

    const result = await this.s3.send(command);

    if (!result) {
      throw new InternalServerErrorException(
        new ErrorResponseDto(
          'File delete failed',
        ),
      );
    }
  }
}
