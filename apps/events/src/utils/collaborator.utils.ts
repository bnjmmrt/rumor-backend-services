import { Collaborator, TicketType, Event } from "packages/rumor-utils/shared/entities";
import { CreateCollaboratorDto, UpdateCollaboratorDto } from "packages/rumor-utils/shared/events/dtos";
import { CollaboratorTicket } from "packages/rumor-utils/shared/events/grpc/events/general.pb";

interface RoleEntity {
  id: string;
  name: string;
}
export const createCollaboratorEntity = (
  userId: string,
  event: Event,
  roleEntity: RoleEntity,
  collaboratorDto: CreateCollaboratorDto | UpdateCollaboratorDto,
  ticketType?: TicketType,
  ticket?: CollaboratorTicket,
): Collaborator => {
  const collaborator = new Collaborator();
  collaborator.displayName = collaboratorDto.displayName;
  collaborator.displayNameListEvent = collaboratorDto.displayNameListEvent;
  collaborator.limitInvitations = collaboratorDto.limitInvitations;
  collaborator.event = event;
  collaborator.role = { id: roleEntity.id };
  collaborator.user = { id: userId };
  collaborator.ticketType = ticketType || null;
  collaborator.limitInvitationsNumber = ticket?.limitInvitationsNumber || 0;

  collaborator.editEventDetailsSettings = collaboratorDto.editEventDetailsSettings;
  collaborator.inviteGuestsToEvent = collaboratorDto.inviteGuestsToEvent;
  collaborator.addGuestsToDrafts = collaboratorDto.addGuestsToDrafts;
  collaborator.chatWithAllGuests = collaboratorDto.chatWithAllGuests;
  collaborator.chatWithGuestsByCollaborator = collaboratorDto.chatWithGuestsByCollaborator;
  collaborator.viewFullGuestList = collaboratorDto.viewFullGuestList;
  collaborator.manageInAppRsvpRequests = collaboratorDto.manageInAppRsvpRequests;
  collaborator.manageDedicatedSignUpForm = collaboratorDto.manageDedicatedSignUpForm;
  collaborator.postAnnouncementsToAllGuests = collaboratorDto.postAnnouncementsToAllGuests;
  collaborator.postAnnouncementsByCollaborator = collaboratorDto.postAnnouncementsByCollaborator;
  collaborator.checkInGuests = collaboratorDto.checkInGuests;
  collaborator.generateEventReports = collaboratorDto.generateEventReports;

  return collaborator;
};
