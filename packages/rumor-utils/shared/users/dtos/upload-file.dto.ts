import { UploadFileRequest } from '../grpc/files/files.pb';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadFileDto implements UploadFileRequest {
  @IsNotEmpty()
  file: Buffer;

  @IsOptional()
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  contentType: string;

  @IsOptional()
  size: number;
}
