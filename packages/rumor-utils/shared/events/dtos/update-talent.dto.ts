import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UpdateTalentRequest } from '../grpc/events/events.pb';

export class UpdateTalentRequestDto implements UpdateTalentRequest {
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  socialNetwork?: string;

  @IsNotEmpty()
  @IsString()
  imageKeyUrl: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsString()
  @IsNotEmpty()
  action: string;
}
