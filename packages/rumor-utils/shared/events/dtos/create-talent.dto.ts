import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateTalentRequest } from '../grpc/events/events.pb';

export class CreateTalentRequestDto implements CreateTalentRequest {
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
  @IsUUID()
  eventId?: string;
}
