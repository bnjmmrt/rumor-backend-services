import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { GetSignedUploadUrlRequest } from '../grpc/files/files.pb';

export class GetSignedUploadUrlRequestDto implements GetSignedUploadUrlRequest {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  contentType: string;

  @IsOptional()
  size: number;

  @IsOptional()
  @IsString()
  extension: string;
}
