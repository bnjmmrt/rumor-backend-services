import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  ArrayNotEmpty,
} from 'class-validator';
import {
  AddEventToFeaturedSectionRequest,
  AddressValidationRequest,
  CancelEventAndNotifyRequest,
  CreateEventRequest,
  CreateEventTypeRequest,
  UpdateEventAgeLimitRequest,
  UpdateEventLocationRequest,
  UpdateEventRequest,
  UpdateEventTypeRequest,
  UpdateTicketRequest,
  ValidateTicketForGuestRequest,
  ToggleGuestCheckStatusRequest,
} from '../grpc/events/events.pb';
import { IsPublishDateValid } from '../validators/pupublish-date-valid.constraint';
import { EventStatusEnum } from '../interfaces/event.interface';
import {
  EventAgeLimit,
  EventLocation,
  EventStatus,
  QueryRequest,
  TicketStatus,
} from '../grpc/events/general.pb';
import { Type } from 'class-transformer';
import { CreateTicketTypeRequestDto, UpdateTicketTypeRequestDto } from './ticket-type.dto';
import { CreateQuizQuestionRequestDto, UpdateQuizQuestionRequestDto } from './quiz-question.dto';
import { CreateTalentRequestDto } from './create-talent.dto';
import { CreateCollaboratorDto, UpdateCollaboratorDto } from './collaborator.dto';
import { UpdateTalentRequestDto } from './update-talent.dto';

export class EventLocationDto implements EventLocation {
  @IsString()
  @IsNotEmpty()
  placeId?: string;
  @IsString()
  @IsNotEmpty()
  location: string;
  @IsString()
  @IsOptional()
  regionCode?: string;
  @IsString()
  @IsNotEmpty()
  city: string;
  @IsNumber()
  @IsNotEmpty()
  latitude: number;
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}

export class CreateEventTypeRequestDto implements CreateEventTypeRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class QueryRequestDto implements QueryRequest {
  @IsOptional()
  @IsString()
  query?: string;
}

export class UpdateEventTypeRequestDto implements UpdateEventTypeRequest {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

//Event DTOs
export class CreateEventRequestDto implements CreateEventRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
  @IsString()
  @IsNotEmpty()
  startDate: string;
  @IsString()
  @IsNotEmpty()
  endDate: string;
  @IsInt()
  @Min(0)
  @IsOptional()
  limitOnePlus?: number;
  @IsUUID()
  @IsNotEmpty()
  ageLimitId: string;
  @IsString()
  @IsOptional()
  rsvpDeadline?: string;
  @IsBoolean()
  useQr: boolean;
  @IsString()
  @IsNotEmpty()
  imageFlyer: string;
  @IsString()
  @IsOptional()
  imageCover?: string;
  @IsString()
  @IsNotEmpty()
  eventTypeId: string;
  @IsObject()
  @ValidateNested()
  @Type(() => EventLocationDto)
  eventLocation: EventLocationDto;
  @IsString()
  @IsOptional()
  furtherInstructions?: string;
  @IsString()
  @IsOptional()
  admissionTypeId?: string;
  @IsBoolean()
  @IsOptional()
  showLocation?: boolean;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
  @IsString()
  @IsOptional()
  // @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'publishDate must be in the format MM/DD/YYYY HH:mm' })
  @IsPublishDateValid({ message: 'Publish date cannot be after the start date.' })
  publishDate?: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsBoolean()
  @IsNotEmpty()
  isPrivate: boolean;
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeRequestDto)
  ticketTypes: CreateTicketTypeRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTalentRequestDto)
  @IsOptional()
  talents: CreateTalentRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCollaboratorDto)
  @IsOptional()
  collaborators: CreateCollaboratorDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionRequestDto)
  @IsOptional()
  quizQuestions: CreateQuizQuestionRequestDto[];

  @IsString()
  @IsNotEmpty()
  timeZone: string;
}

export class UpdateEventRequestDto implements UpdateEventRequest {
  // @IsNotEmpty()
  // @IsString()
  // @IsUUID()
  // id: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  // @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startDate must be in the format MM/DD/YYYY HH:mm' })
  startDate?: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  // @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endDate must be in the format MM/DD/YYYY HH:mm' })
  endDate?: string;
  @IsInt()
  @Min(0)
  @IsOptional()
  limitOnePlus?: number;
  @IsUUID()
  @IsOptional()
  ageLimitId?: string;
  @IsString()
  @IsOptional()
  rsvpDeadline?: string;
  @IsBoolean()
  @IsOptional()
  useQr?: boolean;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  imageFlyer?: string;
  @IsString()
  @IsOptional()
  imageCover?: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  eventTypeId?: string;
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EventLocationDto)
  eventLocation?: EventLocationDto;
  @IsString()
  @IsOptional()
  furtherInstructions?: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  admissionTypeId?: string;
  @IsBoolean()
  @IsOptional()
  showLocation?: boolean;

  @IsEnum(EventStatusEnum)
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  status?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;
  @IsString()
  @IsOptional()
  // @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'publishDate must be in the format MM/DD/YYYY HH:mm' })
  @IsPublishDateValid({ message: 'Publish date cannot be after the start date.' })
  publishDate?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketTypeRequestDto)
  ticketTypes: UpdateTicketTypeRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTalentRequestDto)
  @IsOptional()
  talents: UpdateTalentRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCollaboratorDto)
  @IsOptional()
  collaborators: UpdateCollaboratorDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuizQuestionRequestDto)
  @IsOptional()
  quizQuestions: UpdateQuizQuestionRequestDto[];

  @IsOptional()
  @IsString()
  timeZone?: string;

  // @IsOptional()
  // @IsString()
  // action?: string;
}

export class AddressValidationDto implements AddressValidationRequest {
  @IsString()
  address: string;
}

export class UpdateEventLocationRequestDto implements UpdateEventLocationRequest {
  @IsString()
  @IsOptional()
  placeId?: string;
  @IsString()
  @IsOptional()
  location?: string;
  @IsString()
  @IsOptional()
  regionCode?: string;
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class EventAgeLimitDto implements EventAgeLimit {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsNumber()
  @IsNotEmpty()
  minAge: number;
  @IsNumber()
  @IsNotEmpty()
  maxAge: number;
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;
}

export class UpdateEventAgeLimitRequestDto implements UpdateEventAgeLimitRequest {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsNumber()
  @IsOptional()
  minAge?: number;
  @IsNumber()
  @IsOptional()
  maxAge?: number;
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class ManualEventStatusUpdateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: string;
}

export class ValidateTicketForGuestRequestDto implements ValidateTicketForGuestRequest {
  @IsString()
  @IsNotEmpty()
  ticketToken: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export class ToggleGuestCheckStatusRequestDto implements ToggleGuestCheckStatusRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsBoolean()
  @IsNotEmpty()
  checkIn: boolean;
}

export class UpdateTicketRequestDto implements UpdateTicketRequest {
  @IsUUID()
  @IsNotEmpty()
  guestId: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  ticketStatus?: TicketStatus;
}

export class AddEventToFeaturedSectionDto implements AddEventToFeaturedSectionRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
  @IsUUID()
  @IsOptional()
  featuredSectionId?: string;
}

export class ListHostEventsDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  query: string;
}

export class CancelEventAndNotifyRequestDto implements CancelEventAndNotifyRequest {
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  customMessage: string;
}

export class EventResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsInt()
  @IsOptional()
  limitOnePlus?: number;

  @IsOptional()
  rsvpDeadline?: Date;

  @IsBoolean()
  @IsOptional()
  showLocation?: boolean;

  @IsBoolean()
  useQr: boolean;

  @IsString()
  @IsOptional()
  imageFlyer?: string;

  @IsString()
  @IsOptional()
  imageCover?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  publishDate?: Date;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  deletedAt?: Date;
}
