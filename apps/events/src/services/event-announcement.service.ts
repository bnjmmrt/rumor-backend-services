// import { CreateCollaboratorDto, RequestByIdDto, UpdateCollaboratorDto } from '../dtos';
import { CollaboratorResponse, CollaboratorsResponse, GetDefaultRoleConfigByRoleResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { responses } from '../common/responses';
import { In, IsNull, Repository } from 'typeorm';
import { Collaborator, Event, TicketType, User, DefaultRoleSettings, EventAnnouncement, Guest } from 'rumor-utils/shared/entities';
import { EventStatusEnum, GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';
import database from '../database'
import { NotFoundError } from 'rumor-utils/errors'

export class EventAnnouncementService {
  public static dbConnection = database;

  public static async getAnnouncementGuestList(payload){
    let { eventId, announcementId, ticketType, addedBy } = payload
    let event = await database.getRepository(Event).findOne({ where: {
        id: eventId, 
        status: EventStatusEnum.APPROVED_STATUS, 
        isPublished: true,
        deletedAt: IsNull()
    }})

    if(!event){
      throw new NotFoundError('Event not found')
    }

    // if(announcementId){
    //   let announcement = await database.getRepository(EventAnnouncement).findOne({ where: {
    //       id: announcementId, 
    //       event: event,
    //       deletedAt: IsNull()
    //   }})

    //   if(!announcement){
    //     throw new NotFoundError('Announcement not found')
    //   }
    // }

    let guestList = await database.getRepository(Guest).find({
        where:{
            event: {
                id: payload.id,
                deletedAt: IsNull(),
              },
              deletedAt: IsNull(),
              addedBy: In(addedBy),
              status: GuestStatus.CONFIRMED
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
    let { eventId, createdBy, recepients, announcement, attachments, ticketType, addedBy } = payload
    let event = await database.getRepository(Event).findOne({ where: {
        id: eventId, 
        status: EventStatusEnum.APPROVED_STATUS, 
        isPublished: true,
        deletedAt: IsNull()
    }})

    if(!event){
      throw new NotFoundError('Event not found');
    }

    let eventAnnouncement = new EventAnnouncement();
    announcement.event = eventId;
    announcement.createdBy = createdBy;
    announcement.ticketType = ticketType;
    announcement.addedBy = addedBy;
    announcement.recepients = recepients;
    announcement.attachments = attachments;

    let savedAnnoucement = await database.getRepository(EventAnnouncement).save(eventAnnouncement);

    return savedAnnoucement;
  }

  public static async updateAnnouncement(){

  }
}
