import { In, IsNull } from "typeorm";
import database from "../database";
import { NotFoundError } from "rumor-utils/errors";
import { isArray } from "lodash";
import {
  Event,
  User,
  TicketType,
  EventAnnouncement,
  Guest,
} from "rumor-utils/shared/entities";
import { EventStatusEnum, GuestStatus } from "rumor-utils/shared/events/interfaces/event.interface";
import { toEventAnnouncementRecipients } from 'rumor-utils/shared/events/mappers/event-announcement.mapper';
export class EventAnnouncementService {
  public static dbConnection = database;

  public static async getAnnouncementGuestList(payload):Promise<any> {
    let { eventId, ticketType, addedBy } = payload;

    const event = await database.getRepository(Event).findOne({
      where: { id: eventId, status: EventStatusEnum.APPROVED_STATUS, isPublished: true, deletedAt: IsNull() },
    });

    if (!event) throw new NotFoundError("Event not found");

    let guestQueryParams: any = {
      event: { id: eventId },
      deletedAt: IsNull(),
      status: GuestStatus.CONFIRMED
    };

    if(ticketType){
      ticketType = isArray(ticketType) ? ticketType : [ticketType]
      guestQueryParams.ticketType = { id: In(ticketType) };
    }

    if(addedBy){
      addedBy = isArray(addedBy) ? addedBy : [addedBy];
      guestQueryParams.addedBy = { id: In(addedBy) };
    }

    return await database.getRepository(Guest).find({
      where: guestQueryParams,
      relations: ["user", "ticketType", "addedBy"],
    });
  }

  public static async postAnnouncement(payload) {
    let { eventId, createdBy, recipients, announcement, attachments, ticketType, addedBy } = payload;
    
    const event = await database.getRepository(Event).findOne({
      where: { id: eventId, status: EventStatusEnum.APPROVED_STATUS, isPublished: true, deletedAt: IsNull() },
    });
    if (!event) throw new NotFoundError("Event not found");

    const creator = await database.getRepository(User).findOne({ where: { id: createdBy } });
    if (!creator) throw new NotFoundError("Creator not found");

    const recipientUsers = recipients && recipients.length > 0 ? await database.getRepository(Guest).find({ where: { id: In(recipients) } }) : [];
    const addedByUsers = addedBy ? await database.getRepository(User).find({ where: { id: In(addedBy) } }) : [];
    const ticketTypes = ticketType ? await database.getRepository(TicketType).find({ where: { id: In(ticketType) } }) : [];

    const eventAnnouncement = new EventAnnouncement();
    eventAnnouncement.event = event;
    eventAnnouncement.user = creator;
    eventAnnouncement.announcement = announcement;
    eventAnnouncement.attachments = attachments;
    eventAnnouncement.recipients = recipientUsers;
    eventAnnouncement.addedBy = addedByUsers;
    eventAnnouncement.ticketType = ticketTypes;

    return await database.getRepository(EventAnnouncement).save(eventAnnouncement);
  }

  public static async getAnnouncements(payload) {
    const { eventId } = payload;
    const event = await database.getRepository(Event).findOne({
      where: { id: eventId, status: EventStatusEnum.APPROVED_STATUS, isPublished: true, deletedAt: IsNull() },
    });
    if (!event) throw new NotFoundError("Event not found");

    return await database.getRepository(EventAnnouncement).find({
      where: { event: { id: eventId }, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
      relations: ["user", "event", "addedBy", "ticketType"],
    });
  }

  public static async getAnnouncement(payload) {
    const { id, eventId } = payload;
    const event = await database.getRepository(Event).findOne({
      where: { id: eventId, status: EventStatusEnum.APPROVED_STATUS, isPublished: true, deletedAt: IsNull() },
    });
    if (!event) throw new NotFoundError("Event not found");

    return await database.getRepository(EventAnnouncement).findOne({
      where: { id, event: { id: eventId }, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
      relations: ["user", "event", "addedBy", "ticketType"],
    });
  }

  public static async updateAnnouncement(payload) {
    const { id, eventId, announcement, attachments } = payload;
    const eventAnnouncement = await database.getRepository(EventAnnouncement).findOne({
      where: { id, event: { id: eventId } },
    });
    if (!eventAnnouncement) throw new NotFoundError("Announcement or Event not found");

    return await database.getRepository(EventAnnouncement).save({ id, announcement, attachments });
  }

  public static async deleteAnnouncement(payload) {
    const { id, eventId } = payload;
    const eventAnnouncement = await database.getRepository(EventAnnouncement).findOne({
      where: { id, event: { id: eventId } },
    });
    if (!eventAnnouncement) throw new NotFoundError("Announcement or Event not found");

    return await database.getRepository(EventAnnouncement).softDelete({ id });
  }

  public static async getRecipientList(payload):Promise<any> {
    const { eventId, announcementId } = payload;
    const event = await database.getRepository(Event).findOne({
      where: { id: eventId, status: EventStatusEnum.APPROVED_STATUS, isPublished: true, deletedAt: IsNull() },
    });
    if (!event) throw new NotFoundError("Event not found");

    const announcement = await database.getRepository(EventAnnouncement).findOne({
      where: { id: announcementId, event: { id: eventId }, deletedAt: IsNull() },
      relations: ["recipients"],
    });
    if (!announcement) throw new NotFoundError("Announcement not found");

    const recipientList = await database.getRepository(Guest).find({
      where: {
        event: { id: eventId },
        deletedAt: IsNull(),
        id: In(announcement.recipients.map(r => r.id)),
        status: GuestStatus.CONFIRMED,
      },
      relations: ["user", "ticketType"],
    });

    return toEventAnnouncementRecipients(recipientList)
  }
}
