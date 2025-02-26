import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { HostSocialMedia, UpdateHostProfileRequest } from '../grpc/auth/auth.pb';

export class UpdateHostProfileRequestDto implements UpdateHostProfileRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsOptional()
  companyName?: string;
  @IsString()
  @IsOptional()
  companyLogo?: string;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
  @IsString()
  @IsOptional()
  bio?: string;
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  @IsNumber()
  @IsOptional()
  eventsPerYear?: number;
  @IsString()
  @IsOptional()
  website?: string;
  @IsString()
  @IsOptional()
  referredBy?: string;
  @IsOptional()
  socialMedia?: HostSocialMedia;
}
