import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UpdateFileRequest } from '../grpc/files/files.pb';

export class UpdateFileDto implements UpdateFileRequest {
  @IsNotEmpty()
  file: Buffer;

  @IsNotEmpty()
  @IsString()
  fileKeyId: string;

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
