import { CreateCollaboratorDto, RequestByIdDto, UpdateCollaboratorDto } from 'rumor-utils/shared/events/dtos';
import { CollaboratorResponse, CollaboratorsResponse, GetDefaultRoleConfigByRoleResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { responses } from '../common/responses';
import { IsNull, Repository } from 'typeorm';
import { Collaborator, Event, TicketType, User, DefaultRoleSettings } from 'rumor-utils/shared/events/entities';
import { collaboratorRoleToEntity, toCollaborator } from 'rumor-utils/shared/events/mappers/collaborator.mapper';
import * as serviceMesh from 'rumor-utils/service-mesh'
import { GetDefaultRoleConfigByRoleRequestDto } from 'rumor-utils/shared/events/dtos/collaborator.dto';
import { Role } from 'rumor-utils/shared/events/grpc/events/general.pb';
import database from '../database'
import config from 'src/config';

export class CollaboratorService {
  public static dbConnection = database;

  public static async createCollaborator(payload: CreateCollaboratorDto): Promise<CollaboratorResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: {
          id: payload.eventId,
          deletedAt: IsNull(),
        },
      });

      if (!event) return responses.notFound('Event does not exists');
      const collaboratorExists = await this.dbConnection.getRepository(Collaborator).findOne({
        where: {
          user: { email: payload.email },
          event: {
            id: payload.eventId,
          },
          deletedAt: IsNull(),
        },
      });
      if (collaboratorExists) return responses.badRequest('Collaborator already exists');

      let userExists = await serviceMesh.getUserWithRolesByEmail(config.get('API_BASE_URL'), payload.email);
      if (!userExists) {
        await serviceMesh.createNonMemberUser(config.get('API_BASE_URL'),payload.email);
        userExists = await serviceMesh.getUserWithRolesByEmail(config.get('API_BASE_URL'),payload.email);
      }

      let hasHostRole: boolean = false;
      for (const item of userExists.roles) {
        if (item.name == collaboratorRoleToEntity[payload.role]) hasHostRole = true;
      }
      if (!hasHostRole) await serviceMesh.assignRoleToUser(config.get('API_BASE_URL'), userExists.id, collaboratorRoleToEntity[payload.role]);

      const role: Partial<Role> = await serviceMesh.getRoleByName(config.get('API_BASE_URL'), collaboratorRoleToEntity[payload.role]);
      const user: Partial<User> = { id: userExists.id };
      const collaborator = new Collaborator();
      collaborator.displayName = payload.displayName;
      collaborator.displayNameListEvent = payload.displayNameListEvent;
      collaborator.limitInvitations = payload.limitInvitations;
      collaborator.event = event;
      collaborator.role = { id: role.id };
      collaborator.user = user;

      collaborator.limitInvitationsNumber = payload.limitInvitationsNumber;
      const ticketTypeExists = await this.dbConnection.getRepository(TicketType).findOne({ where: { id: payload.ticketTypeId } });
      if (ticketTypeExists) collaborator.ticketType = { id: payload.ticketTypeId };

      collaborator.editEventDetailsSettings = payload.editEventDetailsSettings;
      collaborator.inviteGuestsToEvent = payload.inviteGuestsToEvent;
      collaborator.addGuestsToDrafts = payload.addGuestsToDrafts;
      collaborator.chatWithAllGuests = payload.chatWithAllGuests;
      collaborator.chatWithGuestsByCollaborator = payload.chatWithGuestsByCollaborator;
      collaborator.viewFullGuestList = payload.viewFullGuestList;
      collaborator.manageInAppRsvpRequests = payload.manageInAppRsvpRequests;
      collaborator.manageDedicatedSignUpForm = payload.manageDedicatedSignUpForm;
      collaborator.postAnnouncementsToAllGuests = payload.postAnnouncementsToAllGuests;
      collaborator.postAnnouncementsByCollaborator = payload.postAnnouncementsByCollaborator;
      collaborator.checkInGuests = payload.checkInGuests;
      collaborator.generateEventReports = payload.generateEventReports;
      const result = await this.dbConnection.getRepository(Collaborator).save(collaborator);

      const newCollaborator = await this.dbConnection.getRepository(Collaborator).findOne({
        where: { id: result.id },
        relations: { user: true, role: true, ticketType: true },
      });

      return responses.data(toCollaborator(newCollaborator));
    } catch (error) {
      return responses.badRequest('Error creating a new collaborator');
    }
  }

  public static async updateCollaborator(payload: UpdateCollaboratorDto): Promise<CollaboratorResponse> {
    try {
      const collaborator = await this.dbConnection.getRepository(Collaborator).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
        relations: ['user', 'role'],
      });

      if (!collaborator) return responses.notFound('Collaborator not found');

      const event = await this.dbConnection.getRepository(Event).findOne({
        where: {
          id: payload.eventId,
          deletedAt: IsNull(),
        },
      });

      if (!event) return responses.notFound('Event does not exists');

      let userExists;
      if (payload.email) {
        userExists = await serviceMesh.getUserWithRolesByEmail(config.get('API_BASE_URL'), payload.email);
        if (!userExists) {
          await serviceMesh.createNonMemberUser(config.get('API_BASE_URL'), payload.email);
          userExists = await serviceMesh.getUserWithRolesByEmail(config.get('API_BASE_URL'), payload.email);
        }
      }

      const user: Partial<User> = { id: userExists.id };
      const role: Partial<Role> = await serviceMesh.getRoleByName(config.get('API_BASE_URL'), collaboratorRoleToEntity[payload.role]);

      collaborator.displayName = payload.displayName;
      collaborator.displayNameListEvent = payload.displayNameListEvent;
      collaborator.limitInvitations = payload.limitInvitations;
      collaborator.event = event;
      collaborator.role = { id: role.id };
      collaborator.user = payload.email ? user : collaborator.user;
      collaborator.editEventDetailsSettings = payload.editEventDetailsSettings;
      collaborator.inviteGuestsToEvent = payload.inviteGuestsToEvent;
      collaborator.addGuestsToDrafts = payload.addGuestsToDrafts;
      collaborator.chatWithAllGuests = payload.chatWithAllGuests;
      collaborator.chatWithGuestsByCollaborator = payload.chatWithGuestsByCollaborator;
      collaborator.viewFullGuestList = payload.viewFullGuestList;
      collaborator.manageInAppRsvpRequests = payload.manageInAppRsvpRequests;
      collaborator.manageDedicatedSignUpForm = payload.manageDedicatedSignUpForm;
      collaborator.postAnnouncementsToAllGuests = payload.postAnnouncementsToAllGuests;
      collaborator.postAnnouncementsByCollaborator = payload.postAnnouncementsByCollaborator;
      collaborator.checkInGuests = payload.checkInGuests;
      collaborator.generateEventReports = payload.generateEventReports;

      collaborator.limitInvitationsNumber = payload.limitInvitationsNumber;
      const ticketTypeExists = await this.dbConnection.getRepository(TicketType).findOne({ where: { id: payload.ticketTypeId } });
      if (ticketTypeExists) collaborator.ticketType = { id: payload.ticketTypeId };

      const result = await this.dbConnection.getRepository(Collaborator).save(collaborator);

      const newCollaborator = await this.dbConnection.getRepository(Collaborator).findOne({
        where: { id: result.id },
        relations: { user: true, role: true, ticketType: true },
      });

      return responses.data(toCollaborator(newCollaborator));
    } catch (error) {
      return responses.badRequest('Error updating collaborator');
    }
  }

  public static async deleteCollaborator(payload: RequestByIdDto): Promise<CollaboratorResponse> {
    try {
      const collaborator = await this.dbConnection.getRepository(Collaborator).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
        relations: { user: true, role: true },
      });
      if (!collaborator) return responses.notFound('Collaborator not found');
      await collaborator.softRemove();
      return responses.data(toCollaborator(collaborator));
    } catch (error) {
      return responses.badRequest('Error deleting collaborator');
    }
  }

  public static async getCollaborator(payload: RequestByIdDto): Promise<CollaboratorResponse> {
    try {
      const collaborator = await this.dbConnection.getRepository(Collaborator).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
        relations: { user: true, role: true, ticketType: true },
      });
      if (!collaborator) return responses.notFound('Collaborator does not exist');
      return responses.data(toCollaborator(collaborator));
    } catch (error) {
      return responses.badRequest('Error getting collaborator');
    }
  }

  public static async getCollaborators(payload: RequestByIdDto): Promise<CollaboratorsResponse> {
    try {
      const collaborators = await this.dbConnection.getRepository(Collaborator).find({
        where: {
          event: {
            id: payload.id,
            deletedAt: IsNull(),
          },
          deletedAt: IsNull(),
        },
        relations: { user: true, role: true, ticketType: true },
      });
      return responses.data(
        collaborators.map((item) => {
          return toCollaborator(item);
        }),
      );
    } catch (error) {
      return responses.badRequest('Error getting collaborators');
    }
  }

  public static async getDefaultRoleConfigByRole(payload: GetDefaultRoleConfigByRoleRequestDto): Promise<GetDefaultRoleConfigByRoleResponse> {
    try {
      let response;
      if (payload.roleId) {
        response = await this.dbConnection.getRepository(DefaultRoleSettings).findOne({
          where: {
            role: { id: payload.roleId },
          },
          relations: { role: true },
        });
      } else if (payload.roleName) {
        response = await this.dbConnection.getRepository(DefaultRoleSettings).findOne({
          where: {
            role: { name: payload.roleName },
          },
          relations: { role: true },
        });
      }
      if (!response) {
        return responses.badRequest('Error at get default config');
      }

      return responses.data({
        editEventDetailsSettings: response.editEventDetailsSettings,
        inviteGuestsToEvent: response.inviteGuestsToEvent,
        addGuestsToDrafts: response.addGuestsToDrafts,
        chatWithAllGuests: response.chatWithAllGuests,
        chatWithGuestsByCollaborator: response.chatWithGuestsByCollaborator,
        viewFullGuestList: response.viewFullGuestList,
        manageInAppRsvpRequests: response.manageInAppRsvpRequests,
        manageDedicatedSignUpForm: response.manageDedicatedSignUpForm,
        postAnnouncementsToAllGuests: response.postAnnouncementsToAllGuests,
        postAnnouncementsByCollaborator: response.postAnnouncementsByCollaborator,
        checkInGuests: response.checkInGuests,
        generateEventReports: response.generateEventReports,
        roleName: response?.role?.name || '',
        roleId: response?.role?.id || '',
      });
    } catch (error) {
      return responses.badRequest('Error getting collaborators');
    }
  }
}
