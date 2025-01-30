import { Collaborator } from '../database/entities';
import { RoleCollaboratorEnum } from '../grpc/events/general.pb';
import { CollaboratorRoles } from '../interfaces/event.interface';

export const toCollaborator = (data: Collaborator) => {
  return {
    name: data?.user?.firstName + ' ' + data?.user?.lastName,
    email: data?.user?.email,
    displayName: data.displayName,
    displayNameListEvent: data.displayNameListEvent,
    limitInvitations: data.limitInvitations,
    event: data.event,
    id: data.id,
    role: {
      name: data.role.name,
      id: data.role.id,
    },
    editEventDetailsSettings: data.editEventDetailsSettings,
    inviteGuestsToEvent: data.inviteGuestsToEvent,
    addGuestsToDrafts: data.addGuestsToDrafts,
    chatWithAllGuests: data.chatWithAllGuests,
    chatWithGuestsByCollaborator: data.chatWithGuestsByCollaborator,
    viewFullGuestList: data.viewFullGuestList,
    manageInAppRsvpRequests: data.manageInAppRsvpRequests,
    manageDedicatedSignUpForm: data.manageDedicatedSignUpForm,
    postAnnouncementsToAllGuests: data.postAnnouncementsToAllGuests,
    postAnnouncementsByCollaborator: data.postAnnouncementsByCollaborator,
    checkInGuests: data.checkInGuests,
    generateEventReports: data.generateEventReports,
    limitInvitationsNumber: data.limitInvitationsNumber || 0,
    ticketType: data.ticketType
      ? {
          id: data.ticketType.id || '',
          name: data.ticketType.name || '',
          description: data.ticketType.description || '',
          capacity: data.ticketType.capacity || 0,
          enabled: data.ticketType.enabled,
        }
      : undefined,
  };
};

export const collaboratorRoleToEntity: { [s in RoleCollaboratorEnum]: CollaboratorRoles } = {
  [RoleCollaboratorEnum.CO_HOST]: CollaboratorRoles.CO_HOST,
  [RoleCollaboratorEnum.PROMOTER]: CollaboratorRoles.PROMOTER,
  [RoleCollaboratorEnum.CONTRIBUTOR]: CollaboratorRoles.CONTRIBUTOR,
  [RoleCollaboratorEnum.CHECK_IN]: CollaboratorRoles.CHECK_IN,
  [RoleCollaboratorEnum.UNRECOGNIZED]: CollaboratorRoles.CO_HOST,
};
