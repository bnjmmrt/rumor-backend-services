import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateReferralRequestRequest, UpdateReferralRequestRequest } from '../grpc/platform/platform.pb';

export class CreateReferralRequestDto implements CreateReferralRequestRequest {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsNotEmpty()
  @IsUUID()
  requesterId: string;
}

export class UpdateReferralRequestDto implements UpdateReferralRequestRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsNotEmpty()
  @IsBoolean()
  isApproved: boolean;
}
