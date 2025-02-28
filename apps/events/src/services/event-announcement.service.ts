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
import { isArray } from "lodash";

export class EventAnnouncementService {
  public static dbConnection = database;

  // This is to find all possible guests for an announcement and used before creating an announcement
  public static async getAnnouncementGuestList(payload) {
    let { eventId, ticketType, addedBy } = payload;

    ticketType = isArray(ticketType) ? ticketType : [ticketType];
    addedBy = isArray(addedBy) ? addedBy : [addedBy];

    let event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      }
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    let guestList = await database.getRepository(Guest).find({
      where: {
        event: {
          id: eventId,
          deletedAt: IsNull(),
        },
        deletedAt: IsNull(),
        addedBy: In(addedBy),
        status: GuestStatus.CONFIRMED,
        ticketType: In(ticketType)
      },
      relations: { user: true, ticketType: true },
    });

    return guestList;
  }

  public static async postAnnouncement(payload) {
    let {
      eventId,
      createdBy = "e1c43ea3-1343-43a4-99fc-e02b7f8c4046",
      recipients,
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
    eventAnnouncement.event = { id: eventId } as Event;
    eventAnnouncement.user = { id : createdBy } as User;
    eventAnnouncement.ticketType = ticketType;
    eventAnnouncement.addedBy = addedBy;
    eventAnnouncement.recipients = recipients;
    eventAnnouncement.attchments = attachments;
    eventAnnouncement.announcement = announcement;

    let savedAnnoucement = await database
      .getRepository(EventAnnouncement)
      .save(eventAnnouncement);

    return savedAnnoucement;
  }

  public static async getAnnouncements(payload) {
    let { eventId } = payload;

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

    let announcements = await database
      .getRepository(EventAnnouncement)
      .find({
        where: {
          event: { id: eventId },
          deletedAt: IsNull(),
        },
        order:{
          createdAt: 'DESC'
        }
      });

    return announcements;
  }

  public static async updateAnnouncement(payload) {
    let { id, eventId, announcement, attachments } = payload;
    console.log("🚀 ~ EventAnnouncementService ~ updateAnnouncement ~ id:", id)

    let eventAnnouncement = await database
      .getRepository(EventAnnouncement)
      .findOne({
        where: {
          id,
          event: { id: eventId },
        },
      });

      console.log("🚀 ~ EventAnnouncementService ~ updateAnnouncement ~ eventAnnouncement:", eventAnnouncement)


    if (!eventAnnouncement) {
      throw new NotFoundError("Announcement or Event not found");
    }

    let updatedAnnouncement = await database
      .getRepository(EventAnnouncement)
      .save({
        id,
        announcement,
        attachments,
      });
    return updatedAnnouncement;
  }

  public static async deleteAnnouncement(payload) {
    let { id, eventId } = payload;

    let eventAnnouncement = await database
      .getRepository(EventAnnouncement)
      .findOne({
        where: {
          id,
          event: { id: eventId },
        },
      });

    if (!eventAnnouncement) {
      throw new NotFoundError("Announcement or Event not found");
    }

    let deletedAnnouncement = await database
      .getRepository(EventAnnouncement)
      .save({
        id,
        deletedAt: new Date(),
      });

    return deletedAnnouncement;
  }

  public static async getRecipientList(payload) {
    let { eventId, announcementId } = payload;

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

    let announcement = await database.getRepository(EventAnnouncement).findOne({
      where: {
        id: announcementId,
        event: { id: eventId },
        deletedAt: IsNull(),
      },
    });

    if (!announcement) {
      throw new NotFoundError("Announcement not found");
    }

    let recipientList = await database.getRepository(Guest).find({
      where: {
        event: { id: eventId },
        deletedAt: IsNull(),
        addedBy: In(announcement.recipients),
        status: GuestStatus.CONFIRMED,
      },
      relations: { user: true, ticketType: true },
    });

    return recipientList;
  }

}
