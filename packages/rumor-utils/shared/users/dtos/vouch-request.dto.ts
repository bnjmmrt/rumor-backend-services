import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateVouchRequestRequest, UpdateVouchRequestRequest } from '../grpc/platform/platform.pb';

export class CreateVouchRequestDto implements CreateVouchRequestRequest {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsNotEmpty()
  @IsUUID()
  requesterId: string;
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}

export class UpdateVouchRequestDto implements UpdateVouchRequestRequest {
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
