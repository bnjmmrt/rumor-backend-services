import database from '../database';
import { Notification } from 'rumor-utils/shared/notifications/entities/notification.entity';
import { NotFoundError } from 'rumor-utils/errors';
import { Event } from 'rumor-utils/shared/events/entities';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { In } from 'typeorm';
import getNotificationDetails from '../server/helpers/notificationMatrix';
import firebaseNotificationsService from '../utils/firebase-notifications/firebase-notifications.service';
import {
  toNotificationslisting,
  toNotification,
} from 'rumor-utils/shared/notifications/mappers/notification.mapper';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';

class NotificationService {
  public dbConnection = database;

  async sendNotification(
    notificationType: string,
    recipients: string | string[],
    linkedUserId?: string,
    linkedEventId?: string,
    linkedHostId?: string,
  ) {
    try {
      const recipientList = Array.isArray(recipients) ? recipients : [recipients];

      // Fetch notification template
      const notificationTemplate = getNotificationDetails(notificationType);
      if (!notificationTemplate) {
        throw new Error(`Invalid notification type: ${notificationType}`);
      }

      // Fetch linked entities in a single query each
      const linkedUser: User = linkedUserId
        ? await User.getRepository().findOne({ where: { id: linkedUserId } })
        : null;

      const linkedEvent: Event = linkedEventId
        ? await Event.getRepository().findOne({ where: { id: linkedEventId } })
        : null;
      
      const linkedHost: User = linkedHostId
        ? await User.getRepository().findOne({ where: { id: linkedHostId } })
        : null;

      if (notificationTemplate.hasOwnProperty('linkedUser') && !linkedUser) {
        throw new NotFoundError('Linked user not found');
      }
      if (notificationTemplate.hasOwnProperty('linkedEvent') && !linkedEvent) {
        throw new NotFoundError('Linked event not found');
      }
      if (notificationTemplate.hasOwnProperty('linkedHost') && !linkedHost) {
        throw new NotFoundError('Linked host not found');
      }

    
      const notificationsToSave: Notification[] = [];
      const pushNotifications: {
        tokens: string[];
        body: string;
        title: string;
        image: string;
        data?: object;
      }[] = [];

      // Bulk fetch recipient users, preferences, and push tokens
      const recipientsData = await this.dbConnection
        .getRepository(User)
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userSettings', 'userSettings')
        .leftJoinAndSelect('user.pushNotificationToken', 'pushNotificationToken')
        .where('user.id IN (:...recipientList)', { recipientList })
        .getMany();

      for (const recipientUser of recipientsData) {
        if (!recipientUser) continue;

        const body: any = notificationTemplate.body
          ? {
              eventId: linkedEvent ? linkedEvent.id : '',
              userId: linkedUser ? linkedUser.id : '',
              action: notificationTemplate.action || '',
              role: notificationTemplate.role || '',
            }
          : {};
        const notificationImage = eval(notificationTemplate.image);

        let linkedUserName = linkedUser ? `${linkedUser.firstName} ${linkedUser.lastName}`
          : '';
        let recipientName = recipientUser.firstName
          ? `${recipientUser.firstName} ${recipientUser.lastName}`
          : '';
        if (notificationType === NotificationType.EVENT_CANCELLED) {
          recipientName = recipientUser?.firstName ? recipientUser.firstName : '';
        }

        let companyName = () => {
          if(linkedHost && linkedHost?.additionalHostInformation?.companyName){
            return linkedHost?.additionalHostInformation?.companyName 
          }
          else {
            return linkedUser?.additionalHostInformation?.companyName
              ? linkedUser?.additionalHostInformation?.companyName
              : `${linkedUser.firstName} ${linkedUser.lastName}`
          }
        }

        // Generate personalized messages
        const replaceTemplateValues = (message: string) =>
          message
            .replace('[Event Start Time]', (linkedEvent?.startDate || '').toString())
            .replace('[Recipient Name]', recipientName)
            .replace('[Linked User Name]', linkedUserName)
            .replace('[Linked Company Name]', companyName())
            .replace('[Event Name]', linkedEvent?.name || '')
            .replace('[Event City Name]', linkedEvent?.location?.city || '')

        const appMessage = replaceTemplateValues(notificationTemplate.appMessage || '');
        const pushMessage = replaceTemplateValues(notificationTemplate.pushMessage || '');

        // Prepare notification for saving
        const notification = new Notification();
        notification.title = 'Rumor';
        notification.message = appMessage;
        notification.body = body;
        notification.notificationType = notificationType;
        notification.linkedUser = linkedUser;
        notification.linkedEvent = linkedEvent;
        notification.notificationModule = notificationTemplate.notificationModule;
        notification.recipients = [recipientUser];
        notification.notificationImage = notificationTemplate.image;
        notification.role = notificationTemplate.role;

        if (notificationTemplate.appNotification) {
          notificationsToSave.push(notification);
        }

        const userPushPreference = recipientUser.userSettings
          ? recipientUser.userSettings.enableAppNotifications
          : true;

        console.log(
          '🚀 ~ NotificationService ~ recipientUser?.pushNotificationToken?.length:',
          recipientUser?.pushNotificationToken?.length,
        );
        console.log('🚀 ~ NotificationService ~ userPushPreference:', userPushPreference);
        console.log(
          '🚀 ~ NotificationService ~ notificationTemplate.pushNotification:',
          notificationTemplate.pushNotification,
        );

        // Handle push notification if enabled and user has tokens
        if (
          notificationTemplate.pushNotification &&
          userPushPreference &&
          recipientUser?.pushNotificationToken?.length > 0
        ) {
          const tokens = recipientUser.pushNotificationToken
            .map(data => data.notificationToken)
            .filter(Boolean);

          if (tokens.length > 0) {
            pushNotifications.push({
              tokens,
              body: pushMessage,
              title: 'The Rumor',
              image: notificationImage
                ? notificationImage
                : 'https://host.therumor.com/images/app/rumor_icon.svg',
              data: { ...body, notificationType },
            });
          }
        }
      }

      // Batch insert notifications
      if (notificationsToSave.length > 0) {
        await this.dbConnection.getRepository(Notification).save(notificationsToSave);
      }

      // Send push notifications in bulk, ensuring different messages per recipient
      if (pushNotifications.length > 0) {
        for (const push of pushNotifications) {
          await firebaseNotificationsService.sendPushNotification({
            ...push,
          });
        }
      }

      return { success: true, message: 'Notifications sent successfully.' };
    } catch (error) {
      console.log('🚀 ~ NotificationService ~ error:', error);
    }
  }

  async getAllNotifications(
    recipientId: string,
    role: string,
    take = 10,
    skip = 0,
  ): Promise<{ totalCount: number; result: Partial<Notification>[] }> {
    const queryBuilder = this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .innerJoin('notification.recipients', 'recipient', 'recipient.id = :recipientId', {
        recipientId,
      })
      .leftJoinAndSelect('notification.linkedUser', 'linkedUser')
      .leftJoinAndSelect('notification.linkedEvent', 'linkedEvent')
      .orderBy('notification.createdAt', 'DESC');

    if (role) {
      role = role === 'non_member' ? 'member' : role;
      queryBuilder.andWhere('notification.role = :role', { role });
    }

    const totalCount = await queryBuilder.getCount();

    const notifications = await queryBuilder.take(take).skip(skip).getMany();

    return { totalCount, result: toNotificationslisting(notifications) };
  }

  async getNotificationDetail(notificationId: string): Promise<any> {
    // Fetch the notification
    const notification = await this.dbConnection.getRepository(Notification).findOne({
      where: { id: notificationId },
      relations: ['linkedUser', 'linkedEvent', 'recipients'], // Load relations if needed
    });

    // If notification is not found, throw an error
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // If isSeen is false, update it to true
    if (!notification.isSeen) {
      await this.dbConnection.getRepository(Notification).update(notificationId, { isSeen: true });
    }

    return toNotification(notification);
  }

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const result = await this.dbConnection.getRepository(Notification).delete(notificationId);

    if (result.affected === 0) {
      throw new NotFoundError('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async findAllNotifications(
    recipientId: string,
    take = 10,
    skip = 0,
    notificationByModule?: string,
    notificationByType?: string,
  ): Promise<{ totalCount: number; result: Partial<Notification>[] }> {
    const queryBuilder = this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .innerJoin('notification.recipients', 'recipient', 'recipient.id = :recipientId', {
        recipientId,
      })
      .leftJoinAndSelect('notification.linkedUser', 'linkedUser')
      .leftJoinAndSelect('notification.linkedEvent', 'linkedEvent')
      .orderBy('notification.createdAt', 'DESC');

    // Apply filters if provided
    if (notificationByModule) {
      queryBuilder.andWhere('notification.notificationModule = :notificationByModule', {
        notificationByModule,
      });
    }

    if (notificationByType) {
      queryBuilder.andWhere('notification.notificationType = :notificationByType', {
        notificationByType,
      });
    }

    // Get total count before pagination
    const totalCount = await queryBuilder.getCount();

    // Apply pagination
    const notifications = await queryBuilder.take(take).skip(skip).getMany();

    return { totalCount, result: toNotificationslisting(notifications) };
  }

  async getNotificationSummary(
    recipientId: string,
    role: string,
  ): Promise<{
    totalNotifications: number;
    notificationsByModule: Record<string, number>;
    notificationsByType: Record<string, number>;
  }> {
    const queryBuilder = this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.isSeen = false')
      .innerJoin('notification.recipients', 'recipient', 'recipient.id = :recipientId', {
        recipientId,
      });

    if (role) {
      role = role === 'non_member' ? 'member' : role;
      queryBuilder.andWhere('notification.role = :role', { role });
    }

    // Get total notifications count
    const totalNotifications = await queryBuilder.getCount();

    // Get count grouped by notificationModule
    const notificationsByModule = await queryBuilder
      .select('notification.notificationModule, COUNT(*) AS count')
      .groupBy('notification.notificationModule')
      .getRawMany();

    // Get count grouped by notificationType
    const notificationsByType = await queryBuilder
      .select('notification.notificationType, COUNT(*) AS count')
      .groupBy('notification.notificationType')
      .getRawMany();

    // Format response
    return {
      totalNotifications,
      notificationsByModule: notificationsByModule.reduce(
        (acc, row) => {
          acc[row.notificationModule] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      notificationsByType: notificationsByType.reduce(
        (acc, row) => {
          acc[row.notificationType] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async deleteMultipleNotifications(
    recipientId: string,
    notificationIds: string[],
  ): Promise<{ deletedCount: number }> {
    if (!notificationIds || notificationIds.length === 0) {
      throw new Error('No notification IDs provided.');
    }

    const result = await this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('id IN (:...notificationIds)', { notificationIds })
      .andWhere(
        'id IN (SELECT nr.notification_id FROM notification_recipients nr WHERE nr.user_id = :recipientId)',
        { recipientId },
      )
      .execute();

    return { deletedCount: result.affected || 0 };
  }

  async createNotification(
    title: string,
    message: string,
    body: object,
    notificationType: string,
    notificationModule: string,
    recipientIds: string[],
    linkedUserId?: string,
    linkedEventId?: string,
  ): Promise<Notification> {
    return await this.dbConnection.connection.transaction(async transactionalEntityManager => {
      const notificationRepository = transactionalEntityManager.getRepository(Notification);
      const userRepository = transactionalEntityManager.getRepository(User);
      const eventRepository = transactionalEntityManager.getRepository(Event);

      const newNotification = notificationRepository.create({
        title,
        message,
        body,
        notificationType,
        notificationModule,
        linkedUser: linkedUserId
          ? await userRepository.findOne({ where: { id: linkedUserId } })
          : null,
        linkedEvent: linkedEventId
          ? await eventRepository.findOne({ where: { id: linkedEventId } })
          : null,
      });

      const savedNotification = await notificationRepository.save(newNotification);

      if (recipientIds.length > 0) {
        const recipients = await userRepository.find({
          where: { id: In(recipientIds) },
        });
        savedNotification.recipients = recipients;
        await notificationRepository.save(savedNotification);
      }

      return savedNotification;
    });
  }
}

const notificationSerice = new NotificationService();
export default notificationSerice;
