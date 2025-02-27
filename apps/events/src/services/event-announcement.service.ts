// import { CreateCollaboratorDto, RequestByIdDto, UpdateCollaboratorDto } from '../dtos';
import {
  CollaboratorResponse,
  CollaboratorsResponse,
  GetDefaultRoleConfigByRoleResponse,
} from "rumor-utils/shared/events/grpc/events/events.pb";
import { responses } from "../common/responses";
import { In, IsNull, Repository } from "typeorm";
import {
  Collaborator,
  Event,
  TicketType,
  User,
  DefaultRoleSettings,
  EventAnnouncement,
  Guest,
} from "rumor-utils/shared/entities";
import {
  EventStatusEnum,
  GuestStatus,
} from "rumor-utils/shared/events/interfaces/event.interface";
import database from "../database";
import { NotFoundError } from "rumor-utils/errors";

export class EventAnnouncementService {
  public static dbConnection = database;

  public static async getAnnouncementGuestList(payload) {
    let { eventId, announcementId, ticketType, addedBy } = payload;
    let event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
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
      where: {
        event: {
          id: payload.id,
          deletedAt: IsNull(),
        },
        deletedAt: IsNull(),
        addedBy: In(addedBy),
        status: GuestStatus.CONFIRMED,
      },
      relations: { user: true, ticketType: true },
    });

    return responses.data(
      guestList.map((item) => {
        return item; //Mapper function to return the id,name and image only
      })
    );
  }

  public static async postAnnouncement(payload) {
    let {
      eventId,
      createdBy = "e1c43ea3-1343-43a4-99fc-e02b7f8c4046",
      recepients,
      announcement,
      attachments,
      ticketType,
      addedBy,
    } = payload;
    let event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    let announcementCreator = await database.getRepository(User).findOne({
      where: {
        id: createdBy,
      },
    });

    if (!announcementCreator) {
      throw new NotFoundError("Creator not found");
    }

    console.log("🚀 ~ EventAnnouncementService ~ event ~ event:", event);

    let eventAnnouncement = new EventAnnouncement();
    eventAnnouncement.event = eventId as Event;
    eventAnnouncement.user = createdBy as User;
    eventAnnouncement.ticketType = ticketType;
    eventAnnouncement.addedBy = addedBy;
    eventAnnouncement.recipients = recepients;
    eventAnnouncement.attchments = attachments;
    eventAnnouncement.announcement = announcement;

    let savedAnnoucement = await database
      .getRepository(EventAnnouncement)
      .save(eventAnnouncement);

    return savedAnnoucement;
  }

  public static async updateAnnouncement(payload) {
    let { id, eventId, announcement, attachments } = payload;
    let event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    let eventAnnouncement = await database
      .getRepository(EventAnnouncement)
      .findOne({
        where: {
          id,
          deletedAt: IsNull(),
        },
      });

    if (!eventAnnouncement) {
      throw new NotFoundError("Announcement not found");
    }

    let updatedAnnouncement = await database
      .getRepository(EventAnnouncement)
      .save({
        id: eventAnnouncement.id,
        announcement,
        attachments,
      });
    return updatedAnnouncement;
  }
}
