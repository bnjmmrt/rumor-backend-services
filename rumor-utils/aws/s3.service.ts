import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { humanFileSize } from './common';
import { FilePayload } from './interfaces';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    this.bucketName = process.env.BUCKET_DOCUMENTS_NAME;
  }

  private handleError(error: unknown, action: string): never {
    this.logger.error(`Error ${action} file:`, error);
    throw new Error(`Error ${action} file`);
  }

  public async uploadFile(payload: FilePayload): Promise<PutObjectCommandOutput> {
    const { file, type, filename, size, contentType, fileKeyId } = payload;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKeyId,
      Body: file,
      ContentType: contentType,
      Metadata: {
        type,
        filename: filename.replace(/[^a-zA-Z0-9 .]/g, ''),
        size: humanFileSize(size),
        contentType,
      },
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      this.handleError(error, 'saving');
    }
  }

  public async removeFile(fileKeyId: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKeyId,
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      this.handleError(error, 'deleting');
    }
  }

  public async getFile(fileKeyId: string): Promise<HeadObjectCommandOutput> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: fileKeyId,
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      this.handleError(error, 'getting');
    }
  }

  public async updateFile(payload: FilePayload): Promise<PutObjectCommandOutput> {
    const { file, type, filename, size, contentType, fileKeyId } = payload;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKeyId,
      Body: file,
      ContentType: contentType,
      Metadata: {
        type,
        filename: filename.replace(/[^a-zA-Z0-9 .]/g, ''),
        size: humanFileSize(size),
        contentType,
      },
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      this.handleError(error, 'updating');
    }
  }

  public async getFileUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    const getObjectParams = { Bucket: this.bucketName, Key: fileKey };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const urlOptions = { expiresIn };

    try {
      return await getSignedUrl(this.s3Client, getObjectCommand, urlOptions);
    } catch (error) {
      this.handleError(error, 'getting signed URL');
    }
  }
}
