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
        .leftJoin("announcement.recipients", "recipients") 
        .where("announcement.event_id = :eventId", { eventId })
        .andWhere("announcement.deletedAt IS NULL")
        .orderBy("announcement.createdAt", "DESC")
        .addSelect("COUNT(recipients.id)", "recipientCount") 
        .groupBy("announcement.id, user.id, event.id, addedBy.id, ticketType.id");

    const totalCount = await query.getCount();

    let announcements = await query.skip(skip).take(take).getRawAndEntities();

    for (let i = 0; i < announcements.entities.length; i++) {
        let announcement:any = announcements.entities[i];
        let recipientCount = parseInt(announcements.raw[i].recipientCount) || 0;

        if (recipientCount === 0) {
            recipientCount = await database
                .getRepository(Guest)
                .createQueryBuilder("guest")
                .where("guest.event_id = :eventId", { eventId })
                .andWhere("guest.ticket_type_id = :ticketTypeId", { ticketTypeId: announcement.ticketType?.id })
                .andWhere("guest.added_by_id = :addedById", { addedById: announcement.addedBy?.id })
                .andWhere("guest.status = :status", { status: GuestStatus.CONFIRMED })
                .getCount();
        }

        announcement.recipientCount = recipientCount;
    }

    return {
        totalCount,
        result: announcements.entities,
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

    // Fetch the announcement along with relations
    const announcement:any = await database.getRepository(EventAnnouncement).findOne({
        where: { id, event: { id: eventId }, deletedAt: IsNull() },
        order: { createdAt: "DESC" },
        relations: ["user", "event", "addedBy", "ticketType", "recipients"],
    });

    if (!announcement) throw new NotFoundError("Announcement not found");

    // Get the recipient count
    let recipientCount = announcement.recipients?.length || 0;

    if (recipientCount === 0) {
        // If no recipients, count the total confirmed guests matching ticketType & addedBy
        recipientCount = await database.getRepository(Guest)
            .createQueryBuilder("guest")
            .where("guest.event_id = :eventId", { eventId })
            .andWhere("guest.ticket_type_id = :ticketTypeId", { ticketTypeId: announcement.ticketType?.id })
            .andWhere("guest.added_by_id = :addedById", { addedById: announcement.addedBy?.id })
            .andWhere("guest.status = :status", { status: GuestStatus.CONFIRMED })
            .getCount();
    }

    return {
        ...announcement,
        recipientCount,
    };
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

    const announcement:any = await database.getRepository(EventAnnouncement).findOne({
        where: {
            id: announcementId,
            event: { id: eventId },
            deletedAt: IsNull(),
        },
        relations: ["recipients", "ticketType", "addedBy"],
    });

    if (!announcement) throw new NotFoundError("Announcement not found");

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    let recipientIds = announcement.recipients?.map((r) => r.id) || [];

    let query = database
        .getRepository(Guest)
        .createQueryBuilder("guest")
        .leftJoinAndSelect("guest.user", "user")
        .leftJoinAndSelect("guest.ticketType", "ticketType")
        .where("guest.event_id = :eventId", { eventId })
        .andWhere("guest.deletedAt IS NULL")
        .andWhere("guest.status = :status", { status: GuestStatus.CONFIRMED });

    // If there are no recipients, fetch based on ticketType & addedBy
    if (recipientIds.length === 0) {
        query.andWhere("guest.ticket_type_id = :ticketTypeId", { ticketTypeId: announcement.ticketType?.id })
            .andWhere("guest.added_by_id = :addedById", { addedById: announcement.addedBy?.id });
    } else {
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
