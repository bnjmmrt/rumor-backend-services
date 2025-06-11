import { In, IsNull, Brackets } from 'typeorm';
import database from '../database';
import { NotFoundError, ForbiddenError } from 'rumor-utils/errors';
import { Event, User, TicketType, EventAnnouncement, Guest } from 'rumor-utils/shared/entities';
import { EventStatusEnum, GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';
import { toEventAnnouncementRecipients } from 'rumor-utils/shared/events/mappers/event-announcement.mapper';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { sendEventAnnouncement } from '../utils/emails.utils';
import { sendSmsNotification } from '../utils/sms.utils';

export class EventAnnouncementService {
  public static dbConnection = database;

  public static async getAnnouncementGuestList(payload): Promise<any> {
    let { eventId, ticketType, addedBy, take, skip, findByName } = payload;

    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        // status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
    });

    if (!event) throw new NotFoundError('Event not found');

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    // Build base filters for subquery
    const subQuery = database
      .getRepository(Guest)
      .createQueryBuilder('pg')
      .select('pg.user.id', 'userId')
      .leftJoin('pg.user', 'pu')
      .where('pg.event = :eventId', { eventId })
      .andWhere('pg.deletedAt IS NULL')
      .andWhere('pg.status = :status', { status: GuestStatus.CONFIRMED })
      .andWhere(
        "((pu.email IS NOT NULL AND pu.email != '') OR (pu.phoneNumber IS NOT NULL AND pu.phoneNumber != ''))",
      );

    if (ticketType) {
      ticketType = Array.isArray(ticketType) ? ticketType : [ticketType];
      subQuery.andWhere('pg.ticketType.id IN (:...ticketType)', { ticketType });
    }

    if (addedBy) {
      addedBy = Array.isArray(addedBy) ? addedBy : [addedBy];
      subQuery.andWhere('pg.addedBy.id IN (:...addedBy)', { addedBy });
    }

    if (findByName) {
      const searchTerm = `%${findByName.toLowerCase()}%`;
      subQuery.leftJoin('pg.user', 'u').andWhere(
        `(LOWER(u.firstName) LIKE :searchTerm OR 
            LOWER(u.lastName) LIKE :searchTerm OR 
            LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE :searchTerm)`,
        { searchTerm },
      );
    }

    // Main query combining primary and secondary guests
    const query = database
      .getRepository(Guest)
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .where('guest.event = :eventId', { eventId })
      .andWhere('guest.deletedAt IS NULL')
      .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
      .andWhere(
        "((user.email IS NOT NULL AND user.email != '') OR (user.phoneNumber IS NOT NULL AND user.phoneNumber != ''))",
      )
      .andWhere(
        new Brackets(qb => {
          qb.where(`guest.user.id IN (${subQuery.getQuery()})`).orWhere(
            `guest.addedBy.id IN (${subQuery.getQuery()})`,
          );
        }),
      )
      .setParameters(subQuery.getParameters());

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
        status: In([EventStatusEnum.APPROVED_STATUS, EventStatusEnum.PAST_STATUS]),
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
      const link = event.branchLink || 'https://app.therumor.com/app';

      let recipientsData: Guest[] = [];

      if (recipients.length === 0) {
        const subQuery = database
          .getRepository(Guest)
          .createQueryBuilder('pg')
          .select('pg.user.id', 'userId')
          .leftJoin('pg.user', 'pu')
          .where('pg.event = :eventId', { eventId })
          .andWhere('pg.deletedAt IS NULL')
          .andWhere('pg.status = :status', { status: GuestStatus.CONFIRMED })
          .andWhere(
            "((pu.email IS NOT NULL AND pu.email != '') OR (pu.phoneNumber IS NOT NULL AND pu.phoneNumber != ''))",
          );

        if (ticketType?.length) {
          subQuery.andWhere('pg.ticketType.id IN (:...ticketType)', { ticketType });
        }

        if (addedBy?.length) {
          subQuery.andWhere('pg.addedBy.id IN (:...addedBy)', { addedBy });
        }

        recipientsData = await database
          .getRepository(Guest)
          .createQueryBuilder('guest')
          .leftJoinAndSelect('guest.user', 'user')
          .where('guest.event = :eventId', { eventId })
          .andWhere('guest.deletedAt IS NULL')
          .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
          .andWhere(
            "((user.email IS NOT NULL AND user.email != '') OR (user.phoneNumber IS NOT NULL AND user.phoneNumber != ''))",
          )
          .andWhere(
            new Brackets(qb => {
              qb.where(`guest.user.id IN (${subQuery.getQuery()})`).orWhere(
                `guest.addedBy.id IN (${subQuery.getQuery()})`,
              );
            }),
          )
          .setParameters(subQuery.getParameters())
          .getMany();
      } else {
        // If recipients are already provided, fallback to your existing logic
        recipientsData = await database.getRepository(Guest).find({
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

        // Filter out guests without valid contact info
        recipientsData = recipientsData.filter(
          guest =>
            guest.user &&
            ((guest.user.email && guest.user.email !== '') ||
              (guest.user.phoneNumber && guest.user.phoneNumber !== '')),
        );
      }

      if (recipientsData.length > 0) {
        const recipientsIds = recipientsData.map(guest => guest.user?.id).filter(id => !!id);
        serviceMesh
          .notificationService()
          .sendNotification(NotificationType.EVENT_ANNOUNCEMENT, recipientsIds, eventId, createdBy);

        recipientsData.map(data => {
          if (data.user.email) {
            sendEventAnnouncement(
              data.user.firstName,
              event.owner.firstName,
              event.name,
              event.id,
              data.user.email,
              event.branchLink,
              announcement,
              attachments || undefined,
            );
          }
          if (data?.user?.phoneNumber) {
            const textMessage = `Hi ${data.user.firstName},\n\n${event?.owner?.additionalHostInformation?.companyName || 'Host'} just sent an announcement for ${event?.name || 'Event'}.\n\n${announcement}\n\nClick here to view it in the Rumor app:\n\n${link}.`;
            sendSmsNotification({ phoneNumber: data.user.phoneNumber, textMessage });
          }
        });
      }
    } catch (error) {
      console.log('🚀 ~ EventAnnouncementService ~ postAnnouncement ~ error:', error);
    }

    return await database.getRepository(EventAnnouncement).save(eventAnnouncement);
  }

  public static async getAnnouncements(payload) {
    let { eventId, take, skip, userId, role } = payload;

    if (!userId) throw new NotFoundError('Requesting User not found');

    // Check if the event exists
    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        //status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
      relations: ['owner'],
    });

    if (!event) throw new NotFoundError('Event not found');

    // Role-based access control
    if (role === 'host') {
      if (event.owner?.id !== userId) {
        throw new ForbiddenError('You are not authorized to view announcements for this event');
      }
    } else if (role === 'member' || role === 'non_member') {
      // Check if the user is a guest (either directly or as +1)
      const isGuest = await database
        .getRepository(Guest)
        .createQueryBuilder('guest')
        .where('guest.event.id = :eventId', { eventId })
        .andWhere('guest.deletedAt IS NULL')
        .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
        .andWhere(
          new Brackets(qb => {
            qb.where('guest.user.id = :userId').orWhere('guest.addedBy.id = :userId');
          }),
        )
        .setParameter('userId', userId)
        .getCount();

      if (!isGuest) {
        throw new ForbiddenError('You are not authorized to view announcements for this event');
      }
    }

    take = take ? parseInt(take) : 20;
    skip = skip ? parseInt(skip) : 0;

    const query = database
      .getRepository(EventAnnouncement)
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.user', 'user')
      .leftJoinAndSelect('announcement.event', 'event')
      .leftJoinAndSelect('announcement.addedBy', 'addedBy')
      .leftJoinAndSelect('announcement.ticketType', 'ticketType')
      .leftJoinAndSelect('announcement.recipients', 'recipients')
      .where('announcement.event.id = :eventId', { eventId })
      .andWhere('announcement.deletedAt IS NULL')
      .orderBy('announcement.createdAt', 'DESC');

    const announcements = await query.skip(skip).take(take).getMany();
    const totalCount = await query.getCount();

    for (let announcement of announcements) {
      let recipientCount = 0;

      const recipientsExist = announcement.recipients?.length > 0;

      if (recipientsExist) {
        // Count only recipients with valid contact info
        recipientCount = announcement.recipients.filter(recipient => {
          return (
            recipient.user &&
            ((recipient.user.email && recipient.user.email !== '') ||
              (recipient.user.phoneNumber && recipient.user.phoneNumber !== ''))
          );
        }).length;
      } else {
        const ticketTypeIds = announcement.ticketType?.map(t => t.id) || [];
        const addedByIds = announcement.addedBy?.map(a => a.id) || [];

        // Build subquery to find user IDs of primary guests
        const subQuery = database
          .getRepository(Guest)
          .createQueryBuilder('pg')
          .select('pg.user.id')
          .leftJoin('pg.user', 'pu')
          .where('pg.event.id = :eventId', { eventId })
          .andWhere('pg.deletedAt IS NULL')
          .andWhere('pg.status = :status', { status: GuestStatus.CONFIRMED })
          .andWhere(
            "((pu.email IS NOT NULL AND pu.email != '') OR (pu.phoneNumber IS NOT NULL AND pu.phoneNumber != ''))",
          );

        if (ticketTypeIds.length > 0) {
          subQuery.andWhere('pg.ticketType.id IN (:...ticketTypeIds)', { ticketTypeIds });
        }

        if (addedByIds.length > 0) {
          subQuery.andWhere('pg.addedBy.id IN (:...addedByIds)', { addedByIds });
        }

        // Main recipient count query (primary + secondary guests)
        const countQuery = database
          .getRepository(Guest)
          .createQueryBuilder('guest')
          .leftJoinAndSelect('guest.user', 'user')
          .where('guest.event.id = :eventId', { eventId })
          .andWhere(
            "((user.email IS NOT NULL AND user.email != '') OR (user.phoneNumber IS NOT NULL AND user.phoneNumber != ''))",
          )
          .andWhere('guest.deletedAt IS NULL')
          .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
          .andWhere(
            new Brackets(qb => {
              qb.where(`guest.user.id IN (${subQuery.getQuery()})`).orWhere(
                `guest.addedBy.id IN (${subQuery.getQuery()})`,
              );
            }),
          )
          .setParameters(subQuery.getParameters());

        recipientCount = await countQuery.getCount();
      }

      Object.assign(announcement, { recipientCount });
    }

    return {
      totalCount,
      result: announcements,
    };
  }

  public static async getAnnouncement(payload) {
    const { id, eventId, role, userId } = payload;

    if (!userId) throw new NotFoundError('Requesting User not found');

    const event = await database.getRepository(Event).findOne({
      where: {
        id: eventId,
        //status: EventStatusEnum.APPROVED_STATUS,
        isPublished: true,
        deletedAt: IsNull(),
      },
      relations: ['owner'],
    });

    if (!event) throw new NotFoundError('Event not found');

    // Role-based access control
    if (role === 'host') {
      if (event.owner?.id !== userId) {
        throw new ForbiddenError('You are not authorized to view this announcement');
      }
    } else if (role === 'member' || role === 'non_member') {
      const isGuest = await database
        .getRepository(Guest)
        .createQueryBuilder('guest')
        .where('guest.event.id = :eventId', { eventId })
        .andWhere('guest.deletedAt IS NULL')
        .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
        .andWhere(
          new Brackets(qb => {
            qb.where('guest.user.id = :userId').orWhere('guest.addedBy.id = :userId');
          }),
        )
        .setParameter('userId', userId)
        .getCount();

      if (!isGuest) {
        throw new ForbiddenError('You are not authorized to view this announcement');
      }
    }

    const announcement = await database.getRepository(EventAnnouncement).findOne({
      where: {
        id,
        event: { id: eventId },
        deletedAt: IsNull(),
      },
      relations: ['user', 'event', 'addedBy', 'ticketType', 'recipients'],
    });

    if (!announcement) throw new NotFoundError('Announcement not found');

    const recipientsExist = announcement.recipients?.length > 0;
    const ticketTypeIds = announcement.ticketType?.map(t => t.id) || [];
    const addedByIds = announcement.addedBy?.map(a => a.id) || [];

    let recipientCount = 0;

    if (recipientsExist) {
      // Count only recipients with valid contact info
      recipientCount = announcement.recipients.filter(recipient => {
        return (
          recipient.user &&
          ((recipient.user.email && recipient.user.email !== '') ||
            (recipient.user.phoneNumber && recipient.user.phoneNumber !== ''))
        );
      }).length;
    } else {
      const subQuery = database
        .getRepository(Guest)
        .createQueryBuilder('pg')
        .select('pg.user.id')
        .leftJoin('pg.user', 'pu')
        .where('pg.event = :eventId', { eventId })
        .andWhere('pg.deletedAt IS NULL')
        .andWhere('pg.status = :status', { status: GuestStatus.CONFIRMED })
        .andWhere(
          "((pu.email IS NOT NULL AND pu.email != '') OR (pu.phoneNumber IS NOT NULL AND pu.phoneNumber != ''))",
        );

      if (ticketTypeIds.length > 0) {
        subQuery.andWhere('pg.ticketType.id IN (:...ticketTypeIds)', { ticketTypeIds });
      }

      if (addedByIds.length > 0) {
        subQuery.andWhere('pg.addedBy.id IN (:...addedByIds)', { addedByIds });
      }

      recipientCount = await database
        .getRepository(Guest)
        .createQueryBuilder('guest')
        .leftJoin('guest.user', 'user')
        .where('guest.event = :eventId', { eventId })
        .andWhere('guest.deletedAt IS NULL')
        .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
        .andWhere(
          "((user.email IS NOT NULL AND user.email != '') OR (user.phoneNumber IS NOT NULL AND user.phoneNumber != ''))",
        )
        .andWhere(
          new Brackets(qb => {
            qb.where(`guest.user.id IN (${subQuery.getQuery()})`).orWhere(
              `guest.addedBy.id IN (${subQuery.getQuery()})`,
            );
          }),
        )
        .setParameters(subQuery.getParameters())
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
        //status: EventStatusEnum.APPROVED_STATUS,
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

    const recipientIds = announcement.recipients?.map(r => r.id) || [];
    const ticketTypeIds = announcement.ticketType?.map(t => t.id) || [];
    const addedByIds = announcement.addedBy?.map(a => a.id) || [];

    const guestRepo = database.getRepository(Guest);

    let query = guestRepo
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .where('guest.event.id = :eventId', { eventId })
      .andWhere('guest.deletedAt IS NULL')
      .andWhere('guest.status = :status', { status: GuestStatus.CONFIRMED })
      .andWhere(
        "((user.email IS NOT NULL AND user.email != '') OR (user.phoneNumber IS NOT NULL AND user.phoneNumber != ''))",
      );

    if (findByName) {
      const searchTerm = `%${findByName.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(user.firstName) LIKE :searchTerm OR 
          LOWER(user.lastName) LIKE :searchTerm OR 
          LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :searchTerm)`,
        { searchTerm },
      );
    }

    if (recipientIds.length === 0) {
      // Subquery to get user IDs of primary guests based on ticketType & addedBy
      const subQuery = guestRepo
        .createQueryBuilder('pg')
        .select('pg.user.id')
        .leftJoin('pg.user', 'pu')
        .where('pg.event = :eventId', { eventId })
        .andWhere('pg.deletedAt IS NULL')
        .andWhere('pg.status = :status', { status: GuestStatus.CONFIRMED })
        .andWhere(
          "((pu.email IS NOT NULL AND pu.email != '') OR (pu.phoneNumber IS NOT NULL AND pu.phoneNumber != ''))",
        );

      if (ticketTypeIds.length > 0) {
        subQuery.andWhere('pg.ticketType.id IN (:...ticketTypeIds)', { ticketTypeIds });
      }

      if (addedByIds.length > 0) {
        subQuery.andWhere('pg.addedBy.id IN (:...addedByIds)', { addedByIds });
      }

      // Combine primary and secondary guest logic
      query
        .andWhere(
          new Brackets(qb => {
            qb.where(`guest.user.id IN (${subQuery.getQuery()})`).orWhere(
              `guest.addedBy.id IN (${subQuery.getQuery()})`,
            );
          }),
        )
        .setParameters(subQuery.getParameters());
    } else {
      query.andWhere('guest.id IN (:...recipientIds)', { recipientIds });
    }

    const totalCount = await query.getCount();

    const recipients = await query.skip(skip).take(take).getMany();

    return {
      totalCount,
      result: toEventAnnouncementRecipients(recipients),
    };
  }
}
