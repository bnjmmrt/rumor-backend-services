import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import {
  AddEventToFeaturedSectionRequest,
  AddressValidationRequest,
  CreateEventRequest,
  CreateEventTypeRequest,
  UpdateEventAgeLimitRequest,
  UpdateEventLocationRequest,
  UpdateEventRequest,
  UpdateEventTypeRequest,
  UpdateTicketRequest,
  ValidateTicketForGuestRequest,
} from '../grpc/events/events.pb';
import { IsPublishDateValid } from '../validators/pupublish-date-valid.constraint';
import { EventStatusEnum } from '../interfaces/event.interface';
import { EventAgeLimit, EventLocation, EventStatus, QueryRequest, TicketStatus } from '../grpc/events/general.pb';

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
  @IsOptional()
  description?: string;
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startDate must be in the format MM/DD/YYYY HH:mm' })
  startDate?: string;
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endDate must be in the format MM/DD/YYYY HH:mm' })
  endDate?: string;
  @IsInt()
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
  imageFlyer?: string;
  @IsString()
  @IsOptional()
  imageCover?: string;
  @IsString()
  @IsOptional()
  eventTypeId?: string;
  @IsString()
  @IsOptional()
  locationId?: string;
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
  @IsOptional()
  ownerId?: string;
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'publishDate must be in the format MM/DD/YYYY HH:mm' })
  @IsPublishDateValid({ message: 'Publish date cannot be after the start date.' })
  publishDate?: string;

  @IsEnum(EventStatusEnum)
  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
  @IsNumber()
  @IsOptional()
  capacity?: number;
}

export class UpdateEventRequestDto implements UpdateEventRequest {
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
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startDate must be in the format MM/DD/YYYY HH:mm' })
  startDate?: string;
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endDate must be in the format MM/DD/YYYY HH:mm' })
  endDate?: string;
  @IsInt()
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
  imageFlyer?: string;
  @IsString()
  @IsOptional()
  imageCover?: string;
  @IsString()
  @IsOptional()
  eventTypeId?: string;
  @IsString()
  @IsOptional()
  locationId?: string;
  @IsString()
  @IsOptional()
  furtherInstructions?: string;
  @IsString()
  @IsOptional()
  admissionTypeId?: string;
  @IsBoolean()
  @IsOptional()
  showLocation?: boolean;

  @IsEnum(EventStatusEnum)
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'publishDate must be in the format MM/DD/YYYY HH:mm' })
  @IsPublishDateValid({ message: 'Publish date cannot be after the start date.' })
  publishDate?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
  @IsNumber()
  @IsOptional()
  capacity?: number;
}

export class AddressValidationDto implements AddressValidationRequest {
  @IsString()
  address: string;
}

export class EventLocationDto implements EventLocation {
  @IsString()
  @IsOptional()
  placeId?: string;
  @IsString()
  @IsOptional()
  location?: string;
  @IsString()
  @IsOptional()
  regionCode?: string;
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
