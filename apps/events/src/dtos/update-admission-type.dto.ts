import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UpdateAdmissionTypeRequest } from '../grpc/events/events.pb';

export class UpdateAdmissionTypeRequestDto implements UpdateAdmissionTypeRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
