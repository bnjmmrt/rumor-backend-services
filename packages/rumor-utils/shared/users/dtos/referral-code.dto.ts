import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateReferralCodeRequest, ReferredUserRequest, UpdateReferralCodeRequest } from '../grpc/platform/platform.pb';

export class CreateReferralCodeRequestDto implements CreateReferralCodeRequest {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  usageLimit: number;

  @IsOptional()
  @IsString()
  expirationDate: string;
}

export class UpdateReferralCodeRequestDto implements UpdateReferralCodeRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  usageLimit: number;

  @IsOptional()
  @IsString()
  expirationDate: string;
}

export class ReferredUserRequestDto implements ReferredUserRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsString()
  @IsNotEmpty()
  referralCode: string;
}
