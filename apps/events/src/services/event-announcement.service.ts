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
}
