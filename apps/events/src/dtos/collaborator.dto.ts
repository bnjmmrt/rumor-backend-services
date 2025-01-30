import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCollaboratorRequest, GetDefaultRoleConfigByRoleRequest, UpdateCollaboratorRequest } from '../grpc/events/events.pb';
import { RoleCollaboratorEnum } from '../grpc/events/general.pb';

export class CreateCollaboratorDto implements CreateCollaboratorRequest {
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsBoolean()
  displayNameListEvent: boolean;

  @IsNotEmpty()
  @IsBoolean()
  limitInvitations: boolean;

  @IsEnum(RoleCollaboratorEnum)
  @IsNotEmpty()
  role: RoleCollaboratorEnum;

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

  @IsOptional()
  @IsString()
  ticketTypeId?: string;
}

export class UpdateCollaboratorDto implements UpdateCollaboratorRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  displayName: string;

  @IsBoolean()
  @IsOptional()
  displayNameListEvent: boolean;

  @IsBoolean()
  @IsOptional()
  limitInvitations: boolean;

  @IsEnum(RoleCollaboratorEnum)
  @IsOptional()
  role: RoleCollaboratorEnum;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsBoolean()
  editEventDetailsSettings: boolean;

  @IsOptional()
  @IsBoolean()
  inviteGuestsToEvent: boolean;

  @IsOptional()
  @IsBoolean()
  addGuestsToDrafts: boolean;

  @IsOptional()
  @IsBoolean()
  chatWithAllGuests: boolean;

  @IsOptional()
  @IsBoolean()
  chatWithGuestsByCollaborator: boolean;

  @IsOptional()
  @IsBoolean()
  viewFullGuestList: boolean;

  @IsOptional()
  @IsBoolean()
  manageInAppRsvpRequests: boolean;

  @IsOptional()
  @IsBoolean()
  manageDedicatedSignUpForm: boolean;

  @IsOptional()
  @IsBoolean()
  postAnnouncementsToAllGuests: boolean;

  @IsOptional()
  @IsBoolean()
  postAnnouncementsByCollaborator: boolean;

  @IsOptional()
  @IsBoolean()
  checkInGuests: boolean;

  @IsOptional()
  @IsBoolean()
  generateEventReports: boolean;

  @IsOptional()
  @IsNumber()
  limitInvitationsNumber?: number;

  @IsOptional()
  @IsString()
  ticketTypeId?: string;
}

export class GetDefaultRoleConfigByRoleRequestDto implements GetDefaultRoleConfigByRoleRequest {
  @IsOptional()
  @IsString()
  roleId?: string;

  @IsString()
  @IsOptional()
  roleName?: string;
}
