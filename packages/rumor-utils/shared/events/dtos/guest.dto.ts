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
  FetchBulkGuestsRequest,
  BulkUploadGuestsRequest,
  ManageGuestsRequest,
} from '../grpc/events/events.pb';
import { Type } from 'class-transformer';
import { AnswersData, GuestStatus } from '../grpc/events/general.pb';

export class ManageGuestsRequestDto implements ManageGuestsRequest {
  @IsUUID()
  @IsNotEmpty()
  hostId: string;

  @IsBoolean()
  @IsOptional()
  isSelectedAll?: boolean;

  @IsBoolean()
  @IsOptional()
  bulkUploadStatus?: boolean;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsArray()
  @IsNotEmpty()
  inclusiveIds: string[];

  @IsArray()
  @IsNotEmpty()
  exclusiveIds: string[];

  @IsString()
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
  @IsNotEmpty()
  guestStatus: string;

  @IsString()
  @IsNotEmpty()
  currentStatus: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  query?: string;

  @IsBoolean()
  @IsOptional()
  sendNotification?: boolean;
}
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

  @IsString()
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
  @IsString()
  @IsOptional()
  hostId?: string;

  @IsArray()
  @IsNotEmpty()
  guests: string[];

  @IsString()
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

  @IsUUID()
  @IsNotEmpty()
  hostId: string;

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

export class AcceptEventInvitationRequestDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
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
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class InvitedGuestsRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvitedGuestRequestDto)
  @IsNotEmpty()
  guests: InvitedGuestRequestDto[];
}
export class BulkUploadGuestsRequestDto implements BulkUploadGuestsRequest {
  @IsUUID()
  @IsNotEmpty()
  hostId: string;

  @IsString()
  @IsOptional()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsBoolean()
  @IsOptional()
  isUploadUser?: boolean
}

export class FetchBulkGuestsRequestDto implements FetchBulkGuestsRequest {
  @IsString()
  @IsOptional()
  query?: string;

  @IsNumber()
  @IsNotEmpty()
  successUserCount: number;
}

export class InviteNewUserRequestDto implements InviteGuestRequest {
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
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
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

  @IsString()
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