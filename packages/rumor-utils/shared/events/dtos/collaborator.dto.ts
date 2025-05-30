import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CreateCollaboratorRequest,
  GetDefaultRoleConfigByRoleRequest,
  UpdateCollaboratorRequest,
} from '../grpc/events/events.pb';
import { RoleCollaboratorEnum } from '../grpc/events/general.pb';
import { Type } from 'class-transformer';
import { CollaboratorRoles } from '../interfaces/event.interface';

export class CollaboratorTicketDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(-1)
  limitInvitationsNumber: number;

  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  action?: string;
}

export class CreateCollaboratorDto implements CreateCollaboratorRequest {
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  eventId?: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsNotEmpty()
  @IsBoolean()
  displayNameListEvent: boolean;

  @IsNotEmpty()
  @IsBoolean()
  limitInvitations: boolean;

  @IsEnum(CollaboratorRoles)
  @IsNotEmpty()
  role: CollaboratorRoles;

  @IsNotEmpty()
  @IsBoolean()
  editEventDetailsSettings: boolean;

  @IsNotEmpty()
  @IsBoolean()
  inviteGuestsToEvent: boolean;

  @IsNotEmpty()
  @IsBoolean()
  addGuestsToDrafts: boolean;

  @IsNotEmpty()
  @IsBoolean()
  chatWithAllGuests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  chatWithGuestsByCollaborator: boolean;

  @IsNotEmpty()
  @IsBoolean()
  viewFullGuestList: boolean;

  @IsNotEmpty()
  @IsBoolean()
  manageInAppRsvpRequests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  manageDedicatedSignUpForm: boolean;

  @IsNotEmpty()
  @IsBoolean()
  postAnnouncementsToAllGuests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  postAnnouncementsByCollaborator: boolean;

  @IsNotEmpty()
  @IsBoolean()
  checkInGuests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  generateEventReports: boolean;

  @IsOptional()
  @IsNumber()
  limitInvitationsNumber?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollaboratorTicketDto)
  @IsOptional()
  tickets: CollaboratorTicketDto[];
}

export class UpdateCollaboratorDto implements UpdateCollaboratorRequest {
  @IsOptional()
  @IsUUID()
  id: string;

  // @IsString()
  // @IsOptional()
  // name?: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsBoolean()
  @IsOptional()
  displayNameListEvent: boolean;

  @IsNotEmpty()
  @IsBoolean()
  limitInvitations: boolean;

  @IsEnum(CollaboratorRoles)
  @IsNotEmpty()
  role: CollaboratorRoles;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsNotEmpty()
  @IsBoolean()
  editEventDetailsSettings: boolean;

  @IsNotEmpty()
  @IsBoolean()
  inviteGuestsToEvent: boolean;

  @IsNotEmpty()
  @IsBoolean()
  addGuestsToDrafts: boolean;

  @IsNotEmpty()
  @IsBoolean()
  chatWithAllGuests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  chatWithGuestsByCollaborator: boolean;

  @IsNotEmpty()
  @IsBoolean()
  viewFullGuestList: boolean;

  @IsNotEmpty()
  @IsBoolean()
  manageInAppRsvpRequests: boolean;

  @IsOptional()
  @IsBoolean()
  manageDedicatedSignUpForm: boolean;

  @IsNotEmpty()
  @IsBoolean()
  postAnnouncementsToAllGuests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  postAnnouncementsByCollaborator: boolean;

  @IsNotEmpty()
  @IsBoolean()
  checkInGuests: boolean;

  @IsNotEmpty()
  @IsBoolean()
  generateEventReports: boolean;

  @IsOptional()
  @IsNumber()
  limitInvitationsNumber?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollaboratorTicketDto)
  tickets: CollaboratorTicketDto[];

  @IsString()
  @IsOptional()
  action: string;
}

export class GetDefaultRoleConfigByRoleRequestDto implements GetDefaultRoleConfigByRoleRequest {
  @IsOptional()
  @IsString()
  roleId?: string;

  @IsString()
  @IsOptional()
  roleName?: string;
}

export class TicketReassignToDto {
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;
}
