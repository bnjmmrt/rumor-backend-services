import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, IsEnum } from 'class-validator';
import {
  AddGuestsRequest,
  GuestsRequest,
  ListEventGuestsRequest,
  ListUsersEventInviteesRequest,
  UpdateGuestsRequest,
  RequestBecomeGuestRequest,
  CancelEventInvitationRequest,
  DeclineEventInvitationRequest,
  InviteGuestRequest,
  GuestsQueryRequest,
  ManageBulkGuestsRequest,
} from '../../../events/src/grpc/events/events.pb';
import { Type } from 'class-transformer';
import { AnswersData, GuestStatus } from '../../../events/src/grpc/events/general.pb';

export class AddGuestsRequestDto implements AddGuestsRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  hostId: string;

  @IsArray()
  @IsNotEmpty()
  users: string[];

  @IsUUID()
  @IsOptional()
  ticketTypeId?: string;

  @IsNumber()
  @IsOptional()
  maxAdditionalGuests?: number;

  @IsString()
  @IsOptional()
  inviteMessage?: string;

  @IsString()
  @IsOptional()
  privateGuestNote?: string;

  @IsString()
  @IsOptional()
  guestStatus?: string;

  @IsBoolean()
  @IsOptional()
  sendInvite?: boolean;
}

export class UpdateGuestsRequestDto implements UpdateGuestsRequest {
  @IsArray()
  @IsNotEmpty()
  guests: string[];

  @IsUUID()
  @IsOptional()
  ticketTypeId?: string;

  @IsNumber()
  @IsOptional()
  maxAdditionalGuests?: number;

  @IsString()
  @IsOptional()
  inviteMessage?: string;

  @IsString()
  @IsOptional()
  privateGuestNote?: string;

  @IsString()
  @IsOptional()
  guestStatus?: string;

  @IsBoolean()
  @IsOptional()
  sendInvite?: boolean;
}

export class GuestsRequestDto implements GuestsRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @IsNotEmpty()
  guests: string[];
}

export class GuestsQueryRequestDto implements GuestsQueryRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  query?: string;
}

export class ListUsersInviteesDto implements ListUsersEventInviteesRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  query?: string;
}

export class ListEventGuestsDto implements ListEventGuestsRequest {
  @IsString()
  @IsOptional()
  query?: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class RequestBecomeGuestRequestDto implements RequestBecomeGuestRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsInt()
  @IsOptional()
  additionalGuests?: number;

  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswersDataDto)
  answers: AnswersDataDto[];
}

export class AnswersDataDto implements AnswersData {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsOptional()
  answer?: string;
}

export class UpdateRequestBecomeGuestRequestDto implements RequestBecomeGuestRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsInt()
  @IsOptional()
  additionalGuests?: number;

  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswersDataDto)
  answers: AnswersDataDto[];
}

export class CancelEventInvitationRequestDto implements CancelEventInvitationRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class DeclineEventInvitationRequestDto implements DeclineEventInvitationRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class InvitedGuestRequestDto implements InviteGuestRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;
}
export class ManageBulkGuestsRequestDto implements ManageBulkGuestsRequest {
  @IsArray()
  @IsNotEmpty()
  guestIds: {
    guestId: string;
    privateNotes?: string;
  }[];

  @IsEnum(GuestStatus)
  @IsNotEmpty()
  status: GuestStatus;

  @IsUUID()
  @IsOptional()
  ticketTypeId: string;

  @IsString()
  @IsOptional()
  inviteMessage?: string;

  @IsNumber()
  @IsOptional()
  maxAdditionalGuests?: number;

  @IsString()
  @IsOptional()
  reason: string;

  @IsBoolean()
  @IsOptional()
  isSpam: boolean;
}

export class ListUsersEventInviteesRequestDto implements ListUsersEventInviteesRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}
