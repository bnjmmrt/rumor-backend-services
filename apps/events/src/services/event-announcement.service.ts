import { In, IsNull } from 'typeorm';
import database from '../database';
import { NotFoundError } from 'rumor-utils/errors';
import { Event, User, TicketType, EventAnnouncement, Guest } from 'rumor-utils/shared/entities';
import { EventStatusEnum, GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';
import { toEventAnnouncementRecipients } from 'rumor-utils/shared/events/mappers/event-announcement.mapper';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { sendEventAnnouncement } from '../utils/emails.utils';
import { sendSmsTextMessage } from '../utils/sms.utils';

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

    if (!event) throw new NotFoundError('Event not found');

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
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .where(guestQueryParams);

    if (findByName) {
      const searchTerm = `%${findByName.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(user.firstName) LIKE :searchTerm OR 
                LOWER(user.lastName) LIKE :searchTerm OR 
                LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :searchTerm)`,
        { searchTerm },
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
    let { eventId, createdBy, recipients, announcement, attachments, ticketType, addedBy } =
      payload;
    if (ticketType.length === 0) throw new NotFoundError('Ticket Type');
    if (addedBy.length === 0) throw new NotFoundError('Added By');
    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
      relations: { owner: true },
    });
    if (!event) throw new NotFoundError('Event');

    const creator = await database.getRepository(User).findOne({ where: { id: createdBy } });
    if (!creator) throw new NotFoundError('Creator not found');

    const recipientUsers =
      recipients && recipients.length > 0
        ? await database.getRepository(Guest).find({ where: { id: In(recipients) } })
        : [];
    const addedByUsers = addedBy
      ? await database.getRepository(User).find({ where: { id: In(addedBy) } })
      : [];
    const ticketTypes = ticketType
      ? await database.getRepository(TicketType).find({ where: { id: In(ticketType) } })
      : [];

    const eventAnnouncement = new EventAnnouncement();
    eventAnnouncement.event = event;
    eventAnnouncement.user = creator;
    eventAnnouncement.announcement = announcement;
    eventAnnouncement.attachments = attachments;
    eventAnnouncement.recipients = recipientUsers;
    eventAnnouncement.addedBy = addedByUsers;
    eventAnnouncement.ticketType = ticketTypes;

    /**
     * Sending Notification & Email
     * Check for recipient array
     * if empty that means we have to fetch the guest list (to fetch) using below method
     * and send email to all those guest.user.id and also set the guest.user.id in the recupeints array for notification
     *
     * if the recipient array is not empty then send the email and notification to that person only
     * in this case we don't need to fetch the guest.user becuase the FE team is already sending the userIds in the recipients array
     *
     */
    try {
      if (recipients.length > 0) {
        serviceMesh
          .notificationService()
          .sendNotification(NotificationType.EVENT_ANNOUNCEMENT, recipients, eventId, createdBy);
        const fetchUserEmails = await database
          .getRepository(User)
          .find({ where: { id: In(recipients) } });
        fetchUserEmails.map(data => {
          if (data.email) {
            sendEventAnnouncement(
              data.firstName,
              event.owner.firstName,
              event.name,
              event.id,
              data.email,
            );
          }
          if (data?.phoneNumber) {
            let textMessage = `${event?.owner?.additionalHostInformation?.companyName || 'Host'} just posted a new event announcement for [Event]. Click to view. `;
            sendSmsTextMessage({ phoneNumber: data.phoneNumber, textMessage });
          }
        });
      } else {
        const recipientsData = await database.getRepository(Guest).find({
          where: {
            event: { id: eventId },
            ticketType: In(ticketType),
            addedBy: In(addedBy),
            status: GuestStatus.CONFIRMED,
          },
          relations: {
            user: true,
          },
        });

        if (recipientsData.length > 0) {
          const recipientsIds = recipientsData.map(guest => guest.user?.id).filter(id => !!id);
          serviceMesh
            .notificationService()
            .sendNotification(
              NotificationType.EVENT_ANNOUNCEMENT,
              recipientsIds,
              eventId,
              createdBy,
            );
          const fetchUsers = await database
            .getRepository(User)
            .find({ where: { id: In(recipientsIds) } });
          fetchUsers.map(data => {
            if (data.email) {
              sendEventAnnouncement(
                data.firstName,
                event.owner.firstName,
                event.name,
                event.id,
                data.email,
              );
            }
            if (data?.phoneNumber) {
              let textMessage = `${event?.owner?.additionalHostInformation?.companyName || 'Host'} just posted a new event announcement for [Event]. Click to view. `;
              sendSmsTextMessage({ phoneNumber: data.phoneNumber, textMessage });
            }
          });
        }
      }
    } catch (error) {
      console.log('🚀 ~ EventAnnouncementService ~ postAnnouncement ~ error:', error);
    }

    return await database.getRepository(EventAnnouncement).save(eventAnnouncement);
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

    if (!event) throw new NotFoundError('Event not found');

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    let query = database
      .getRepository(EventAnnouncement)
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.user', 'user')
      .leftJoinAndSelect('announcement.event', 'event')
      .leftJoinAndSelect('announcement.addedBy', 'addedBy')
      .leftJoinAndSelect('announcement.ticketType', 'ticketType')
      .leftJoin('announcement.recipients', 'recipients')
      .where('announcement.event_id = :eventId', { eventId })
      .andWhere('announcement.deletedAt IS NULL')
      .orderBy('announcement.createdAt', 'DESC')
      .addSelect('COUNT(recipients.id)', 'recipientCount')
      .groupBy(
        'announcement.id, announcement.createdAt, user.id, event.id, addedBy.id, ticketType.id',
      );

    const totalCount = await query.getCount();

    let announcements = await query.skip(skip).take(take).getRawAndEntities();

    for (let i = 0; i < announcements.entities.length; i++) {
      let announcement = announcements.entities[i];
      let recipientCount = parseInt(announcements.raw[i].recipientCount) || 0;

      if (recipientCount === 0) {
        const ticketTypeIds = announcement.ticketType?.map(t => t.id) || [];
        const addedByIds = announcement.addedBy?.map(a => a.id) || [];

        recipientCount = await database
          .getRepository(Guest)
          .createQueryBuilder('guest')
          .where('guest.event_id = :eventId', { eventId })
          .andWhere(
            ticketTypeIds.length > 0 ? 'guest.ticket_type_id IN (:...ticketTypeIds)' : '1=1',
            { ticketTypeIds },
          )
          .andWhere(addedByIds.length > 0 ? 'guest.added_by_id IN (:...addedByIds)' : '1=1', {
            addedByIds,
          })
          .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
          .getCount();
      }
      Object.assign(announcement, { recipientCount });
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

    if (!event) throw new NotFoundError('Event not found');

    // Fetch the announcement along with relations
    const announcement = await database.getRepository(EventAnnouncement).findOne({
      where: { id, event: { id: eventId }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['user', 'event', 'addedBy', 'ticketType', 'recipients'],
    });

    if (!announcement) throw new NotFoundError('Announcement not found');

    // Get the recipient count
    let recipientCount = announcement.recipients?.length || 0;

    if (recipientCount === 0) {
      const ticketTypeIds = announcement.ticketType?.map(t => t.id) || [];
      const addedByIds = announcement.addedBy?.map(a => a.id) || [];

      recipientCount = await database
        .getRepository(Guest)
        .createQueryBuilder('guest')
        .where('guest.event_id = :eventId', { eventId })
        .andWhere(
          ticketTypeIds.length > 0 ? 'guest.ticket_type_id IN (:...ticketTypeIds)' : '1=1',
          { ticketTypeIds },
        )
        .andWhere(addedByIds.length > 0 ? 'guest.added_by_id IN (:...addedByIds)' : '1=1', {
          addedByIds,
        })
        .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
        .getCount();
    }

    return {
      ...announcement,
      recipientCount,
    };
  }

  public static async updateAnnouncement(payload) {
    const { id, eventId, announcement, attachments } = payload;
    const eventAnnouncement = await database.getRepository(EventAnnouncement).findOne({
      where: { id, event: { id: eventId } },
    });
    if (!eventAnnouncement) throw new NotFoundError('Announcement or Event not found');

    return await database.getRepository(EventAnnouncement).save({ id, announcement, attachments });
  }

  public static async deleteAnnouncement(payload) {
    const { id, eventId } = payload;
    const eventAnnouncement = await database.getRepository(EventAnnouncement).findOne({
      where: { id, event: { id: eventId } },
    });
    if (!eventAnnouncement) throw new NotFoundError('Announcement or Event not found');

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

    if (!event) throw new NotFoundError('Event not found');

    const announcement: any = await database.getRepository(EventAnnouncement).findOne({
      where: {
        id: announcementId,
        event: { id: eventId },
        deletedAt: IsNull(),
      },
      relations: ['recipients', 'ticketType', 'addedBy'],
    });

    if (!announcement) throw new NotFoundError('Announcement not found');

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    let recipientIds = announcement.recipients?.map(r => r.id) || [];
    let ticketTypeIds = announcement.ticketType?.map(t => t.id) || [];
    let addedByIds = announcement.addedBy?.map(a => a.id) || [];

    let query = database
      .getRepository(Guest)
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .where('guest.event_id = :eventId', { eventId })
      .andWhere('guest.deletedAt IS NULL')
      .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED });

    if (recipientIds.length === 0) {
      if (ticketTypeIds.length > 0) {
        query.andWhere('guest.ticket_type_id IN (:...ticketTypeIds)', {
          ticketTypeIds,
        });
      }
      if (addedByIds.length > 0) {
        query.andWhere('guest.added_by_id IN (:...addedByIds)', { addedByIds });
      }
    } else {
      query.andWhere('guest.id IN (:...recipientIds)', { recipientIds });
    }

    if (findByName) {
      const searchTerm = `%${findByName.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(user.firstName) LIKE :searchTerm OR 
              LOWER(user.lastName) LIKE :searchTerm OR 
              LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :searchTerm)`,
        { searchTerm },
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
