import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CreateTicketTypeRequest, UpdateTicketTypeRequest } from '../grpc/events/events.pb';
import { TicketReassignToDto } from './collaborator.dto';

export class CreateTicketTypeRequestDto implements CreateTicketTypeRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}

export class UpdateTicketTypeRequestDto implements UpdateTicketTypeRequest {
  @IsOptional()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
   @Min(0)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  reassignTo?: TicketReassignToDto;
}
