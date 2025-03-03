import { In, IsNull } from "typeorm";
import database from "../database";
import { NotFoundError } from "rumor-utils/errors";
import {
  Event,
  User,
  TicketType,
  EventAnnouncement,
  Guest,
} from "rumor-utils/shared/entities";
import {
  EventStatusEnum,
  GuestStatus,
} from "rumor-utils/shared/events/interfaces/event.interface";
import { toEventAnnouncementRecipients } from "rumor-utils/shared/events/mappers/event-announcement.mapper";
export class EventAnnouncementService {
  public static dbConnection = database;

  public static async getAnnouncementGuestList(payload): Promise<any> {
    let { eventId, ticketType, addedBy, take, skip, findByName } = payload;

    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) throw new NotFoundError("Event not found");

    let guestQueryParams: any = {
      event: { id: eventId },
      deletedAt: IsNull(),
      status: GuestStatus.CONFIRMED,
    };

    if (ticketType) {
      ticketType = Array.isArray(ticketType) ? ticketType : [ticketType];
      guestQueryParams.ticketType = { id: In(ticketType) };
    }

    if (addedBy) {
      addedBy = Array.isArray(addedBy) ? addedBy : [addedBy];
      guestQueryParams.addedBy = { id: In(addedBy) };
    }

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    let query = database
      .getRepository(Guest)
      .createQueryBuilder("guest")
      .leftJoinAndSelect("guest.user", "user")
      .leftJoinAndSelect("guest.ticketType", "ticketType")
      .leftJoinAndSelect("guest.addedBy", "addedBy")
      .where(guestQueryParams);

      if (findByName) {
        const searchTerm = `%${findByName.toLowerCase()}%`;
        query.andWhere(
          `(LOWER(user.firstName) LIKE :searchTerm OR 
                LOWER(user.lastName) LIKE :searchTerm OR 
                LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :searchTerm)`,
          { searchTerm }
        );
      }

    const totalCount = await query.getCount();
    const guests = await query.skip(skip).take(take).getMany();

    return {
      totalCount,
      result: guests,
    };
  }

  public static async postAnnouncement(payload) {
    let {
      eventId,
      createdBy,
      recipients,
      announcement,
      attachments,
      ticketType,
      addedBy,
    } = payload;

    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });
    if (!event) throw new NotFoundError("Event not found");

    const creator = await database
      .getRepository(User)
      .findOne({ where: { id: createdBy } });
    if (!creator) throw new NotFoundError("Creator not found");

    const recipientUsers =
      recipients && recipients.length > 0
        ? await database
            .getRepository(Guest)
            .find({ where: { id: In(recipients) } })
        : [];
    const addedByUsers = addedBy
      ? await database.getRepository(User).find({ where: { id: In(addedBy) } })
      : [];
    const ticketTypes = ticketType
      ? await database
          .getRepository(TicketType)
          .find({ where: { id: In(ticketType) } })
      : [];

    const eventAnnouncement = new EventAnnouncement();
    eventAnnouncement.event = event;
    eventAnnouncement.user = creator;
    eventAnnouncement.announcement = announcement;
    eventAnnouncement.attachments = attachments;
    eventAnnouncement.recipients = recipientUsers;
    eventAnnouncement.addedBy = addedByUsers;
    eventAnnouncement.ticketType = ticketTypes;

    return await database
      .getRepository(EventAnnouncement)
      .save(eventAnnouncement);
  }

  public static async getAnnouncements(payload) {
    let { eventId, take, skip } = payload;

    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) throw new NotFoundError("Event not found");

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    let query = database
      .getRepository(EventAnnouncement)
      .createQueryBuilder("announcement")
      .leftJoinAndSelect("announcement.user", "user")
      .leftJoinAndSelect("announcement.event", "event")
      .leftJoinAndSelect("announcement.addedBy", "addedBy")
      .leftJoinAndSelect("announcement.ticketType", "ticketType")
      .where("announcement.event_id = :eventId", { eventId })
      .andWhere("announcement.deletedAt IS NULL")
      .orderBy("announcement.createdAt", "DESC");

    const totalCount = await query.getCount();

    const announcements = await query.skip(skip).take(take).getMany();

    return {
      totalCount,
      result: announcements,
    };
  }

  public static async getAnnouncement(payload) {
    const { id, eventId } = payload;
    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
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
    const eventAnnouncement = await database
      .getRepository(EventAnnouncement)
      .findOne({
        where: { id, event: { id: eventId } },
      });
    if (!eventAnnouncement)
      throw new NotFoundError("Announcement or Event not found");

    return await database
      .getRepository(EventAnnouncement)
      .save({ id, announcement, attachments });
  }

  public static async deleteAnnouncement(payload) {
    const { id, eventId } = payload;
    const eventAnnouncement = await database
      .getRepository(EventAnnouncement)
      .findOne({
        where: { id, event: { id: eventId } },
      });
    if (!eventAnnouncement)
      throw new NotFoundError("Announcement or Event not found");

    return await database.getRepository(EventAnnouncement).softDelete({ id });
  }

  public static async getRecipientList(payload): Promise<any> {
    let { eventId, announcementId, take, skip, findByName } = payload;

    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) throw new NotFoundError("Event not found");

    const announcement = await database
      .getRepository(EventAnnouncement)
      .findOne({
        where: {
          id: announcementId,
          event: { id: eventId },
          deletedAt: IsNull(),
        },
        relations: ["recipients"],
      });

    if (!announcement) throw new NotFoundError("Announcement not found");

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    const recipientIds = announcement.recipients
      ? announcement.recipients.map((r) => r.id)
      : [];

    // Create query 
    //TO BE DONE - ADD Filter for recipients where the condition of announcement matches i.e ticketType and added By

    let query = database
      .getRepository(Guest)
      .createQueryBuilder("guest")
      .leftJoinAndSelect("guest.user", "user")
      .leftJoinAndSelect("guest.ticketType", "ticketType")
      .where("guest.event_id = :eventId", { eventId })
      .andWhere("guest.deletedAt IS NULL")
      .andWhere("guest.status = :status", { status: GuestStatus.CONFIRMED });

    if (recipientIds.length > 0) {
      query.andWhere("guest.id IN (:...recipientIds)", { recipientIds });
    }

    if (findByName) {
      const searchTerm = `%${findByName.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(user.firstName) LIKE :searchTerm OR 
              LOWER(user.lastName) LIKE :searchTerm OR 
              LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :searchTerm)`,
        { searchTerm }
      );
    }

    const totalCount = await query.getCount();

    const recipients = await query.skip(skip).take(take).getMany();

    return {
      totalCount,
      result: toEventAnnouncementRecipients(recipients),
    };
  }
}
