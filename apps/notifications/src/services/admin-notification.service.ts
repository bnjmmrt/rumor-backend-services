import database from '../database';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import firebaseNotificationsService from '../utils/firebase-notifications/firebase-notifications.service';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { AdminNotification } from 'rumor-utils/shared/notifications/entities/admin-notification.entity';
import { toAdminNotification } from 'rumor-utils/shared/notifications/mappers/notification.mapper';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import { NotificationDeliveryChannel } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import {
  AdminNotificationResponse,
  NotificationStatus,
} from 'rumor-utils/shared/notifications/interfaces/notification.interface';
import { CreateAdminNotificationRequestDto } from 'rumor-utils/shared/notifications/dtos/notification.dto';
import {
  SchedulerJobType,
  SchedulerTriggerPayload,
} from 'rumor-utils/shared/schedulers/interfaces/scheduler.interface';
import { PushNotificationPayload } from '../utils/firebase-notifications/firebase-notifications.interface';
import TwilioService from '../utils/twilio/sms';
import { isValidPhoneNumber } from 'rumor-utils/utils/file-utils';

export class AdminNotificationService {
  private dbConnection = database;

  public async createAdminNotification(
    payload: CreateAdminNotificationRequestDto,
  ): Promise<AdminNotificationResponse> {
    const adminNotification = new AdminNotification();
    adminNotification.title = payload.title;
    adminNotification.message = payload.message;
    adminNotification.recipients = payload.recipients;
    adminNotification.channels = payload.channels;
    adminNotification.deliveryType = payload.deliveryType;
    adminNotification.status = NotificationStatus.CREATED;

    if (payload.scheduledDate) {
      adminNotification.scheduledDate = new Date(payload.scheduledDate);
    }

    const notification = await this.dbConnection
      .getRepository(AdminNotification)
      .save(adminNotification);

    try {
      const data: SchedulerTriggerPayload = {
        type: SchedulerJobType.ADMIN_NOTIFICATION,
        data: {
          id: notification.id,
          scheduledDate: notification.scheduledDate,
        },
      };

      serviceMesh.schedulerService().triggerSchedulerJob(data);
    } catch (e) {
      console.log(`Admin notificacion scheduler failed for id #${notification.id}`, e);
    }

    return toAdminNotification(notification);
  }

  public async sendAdminNotification(notificationId: string): Promise<void> {
    const adminNotification = await this.dbConnection.getRepository(AdminNotification).findOne({
      where: { id: notificationId },
    });

    if (!adminNotification) {
      console.log('Notification not found');
      return;
    }

    //MEMBERS => member, NON_MEMBERS => non_member, HOSTS => host
    const recipientList = adminNotification.recipients.map(r => r.toLowerCase().replace(/s$/, ''));

    if (adminNotification.channels.includes(NotificationDeliveryChannel.PUSH)) {
      this.sendPushNotification(adminNotification, recipientList);
    }

    if (adminNotification.channels.includes(NotificationDeliveryChannel.SMS)) {
      this.sendSMSNotification(adminNotification, recipientList);
    }

    adminNotification.status = NotificationStatus.SENT;
    await this.dbConnection.getRepository(AdminNotification).save(adminNotification);
  }

  private async sendPushNotification(
    notification: AdminNotification,
    recipientList: string[],
  ): Promise<void> {
    const CHUNK_SIZE = 200;

    const recipients = await this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .leftJoin('user.pushNotificationToken', 'pushToken')
      .select('user.id, role.name, pushToken.notificationToken')
      .where('role.name IN (:...recipientList)', { recipientList })
      .andWhere('pushToken.notificationToken IS NOT NULL')
      .getRawMany();

    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const recipientsChunk = recipients.slice(i, i + CHUNK_SIZE);

      const payload = {
        tokens: recipientsChunk.map(r => r.notification_token),
        body: notification.message,
        title: notification.title || 'Rumor',
        image: 'https://host.therumor.com/images/app/rumor_icon.svg',
        data: {
          notificationId: notification.id,
          notificationType: NotificationType.MANUAL_ADMIN_NOTIFICATION,
          notificationModule: 'admin',
        },
      } as PushNotificationPayload;

      await firebaseNotificationsService.sendPushNotification(payload);
    }
  }

  private async sendSMSNotification(
    notification: AdminNotification,
    recipientList: string[],
  ): Promise<void> {
    const CHUNK_SIZE = 1000;

    const recipients = await this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .select('user.id, user.phoneNumber, role.name')
      .where('role.name IN (:...recipientList)', { recipientList })
      .andWhere('user.phoneNumber IS NOT NULL')
      .andWhere(
        `user.phoneNumber NOT IN (
          SELECT phone_number FROM sms_recipients 
          WHERE has_received_compliance_message = true AND replied_stop = true
        )`,
      )
      .getRawMany();

    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const recipientsChunk = recipients.slice(i, i + CHUNK_SIZE);

      await TwilioService.sendBulkTextMessage(
        notification.message,
        recipientsChunk
          .filter(r => isValidPhoneNumber(r.phone_number))
          .map(r =>
            JSON.stringify({
              binding_type: 'sms',
              address: r.phone_number,
            }),
          ),
      );
    }
  }
}

const notificationService = new AdminNotificationService();
export default notificationService;
