// import { CreateCollaboratorDto, RequestByIdDto, UpdateCollaboratorDto } from '../dtos';
import { CollaboratorResponse, CollaboratorsResponse, GetDefaultRoleConfigByRoleResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { responses } from '../common/responses';
import { IsNull, Repository } from 'typeorm';
import { Collaborator, Event, TicketType, User, DefaultRoleSettings, EventAnnouncement, Guest } from 'rumor-utils/shared/entities';
import { EventStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import database from '../database'

export class EventAnnouncementService {
  public static dbConnection = database;

  public static async getAnnouncementGuestList(payload){
    let { eventId, user } = payload
    let event = await database.getRepository(Event).findOne({ where: {
        id: eventId, 
        status: EventStatusEnum.APPROVED_STATUS, 
        isPublished: true,
        deletedAt: IsNull()
    }})

    if(!event){
        // throw Entity not found common error
    }

    let guestList = await database.getRepository(Guest).find({
        where:{
            event: {
                id: payload.id,
                deletedAt: IsNull(),
              },
              deletedAt: IsNull(),
              addedBy: user.id
            },
            relations: { user: true, ticketType: true }
        })

        return responses.data(
            guestList.map((item) => {
              return (item); //Mapper function to return the id,name and image only
            }),
        );

  }

  public static async postAnnouncement(payload){
    let { eventId, user, recepients, announcement, attchments, ticket } = payload
    let event = await database.getRepository(Event).findOne({ where: {
        id: eventId, 
        status: EventStatusEnum.APPROVED_STATUS, 
        isPublished: true,
        deletedAt: IsNull()
    }})

    if(!event){
        // throw Entity not found common error
    }


    await database.getRepository(EventAnnouncement).create({

    })





  }

  public static async updateAnnouncement(){

  }



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

      let userExists = await this.authClient.getUserWithRolesByEmail(payload.email);
      if (!userExists) {
        await this.authClient.createNonMemberUser(payload.email);
        userExists = await this.authClient.getUserWithRolesByEmail(payload.email);
      }

      let hasHostRole: boolean = false;
      for (const item of userExists.roles) {
        if (item.name == collaboratorRoleToEntity[payload.role]) hasHostRole = true;
      }
      if (!hasHostRole) await this.authClient.assignRoleToUser(userExists.id, collaboratorRoleToEntity[payload.role]);

      const role: Partial<Role> = await this.authClient.getRoleByName(collaboratorRoleToEntity[payload.role]);
      const user: Partial<User> = { id: userExists.id };
      const collaborator = new Collaborator();
      collaborator.displayName = payload.displayName;
      collaborator.displayNameListEvent = payload.displayNameListEvent;
      collaborator.limitInvitations = payload.limitInvitations;
      collaborator.event = event;
      collaborator.role = { id: role.id };
      collaborator.user = user;

      collaborator.limitInvitationsNumber = payload.limitInvitationsNumber;
      const ticketTypeExists = await this.ticketTypeRepository.findOne({ where: { id: payload.ticketTypeId } });
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
      this.logger.error(`Error creating collaborator: ${error}`);
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
        userExists = await this.authClient.getUserWithRolesByEmail(payload.email);
        if (!userExists) {
          await this.authClient.createNonMemberUser(payload.email);
          userExists = await this.authClient.getUserWithRolesByEmail(payload.email);
        }
      }

      const user: Partial<User> = { id: userExists.id };
      const role: Partial<Role> = await this.authClient.getRoleByName(collaboratorRoleToEntity[payload.role]);

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
      const ticketTypeExists = await this.ticketTypeRepository.findOne({ where: { id: payload.ticketTypeId } });
      if (ticketTypeExists) collaborator.ticketType = { id: payload.ticketTypeId };

      const result = await this.dbConnection.getRepository(Collaborator).save(collaborator);

      const newCollaborator = await this.dbConnection.getRepository(Collaborator).findOne({
        where: { id: result.id },
        relations: { user: true, role: true, ticketType: true },
      });

      return responses.data(toCollaborator(newCollaborator));
    } catch (error) {
      this.logger.error(`Error updating collaborator: ${error}`);
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
      this.logger.error(`Error deleting collaborator: ${error}`);
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
      this.logger.error(`Error getting collaborator: ${error}`);
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
      this.logger.error(`Error getting collaborators: ${error}`);
      return responses.badRequest('Error getting collaborators');
    }
  }

  public static async getDefaultRoleConfigByRole(payload: GetDefaultRoleConfigByRoleRequestDto): Promise<GetDefaultRoleConfigByRoleResponse> {
    try {
      let response;
      if (payload.roleId) {
        response = await this.defaultRoleSettingsRepository.findOne({
          where: {
            role: { id: payload.roleId },
          },
          relations: { role: true },
        });
      } else if (payload.roleName) {
        response = await this.defaultRoleSettingsRepository.findOne({
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
      this.logger.error(`Error getting collaborators: ${error}`);
      return responses.badRequest('Error getting collaborators');
    }
  }
}
