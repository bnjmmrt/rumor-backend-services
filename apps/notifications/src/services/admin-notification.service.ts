import { CreateAdminNotificationRequestDto } from 'rumor-utils/shared/notifications/dtos/notification.dto';
import database from '../database';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { AdminNotification } from 'rumor-utils/shared/notifications/entities/admin-notification.entity';
import { toAdminNotification } from 'rumor-utils/shared/notifications/mappers/notification.mapper';
import {
  AdminNotificationResponse,
  AdminNotificationType,
} from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import {
  SchedulerJobType,
  SchedulerTriggerPayload,
} from 'rumor-utils/shared/schedulers/interfaces/scheduler.interface';

export class AdminNotificationService {
  private dbConnection = database;

  public async createAdminNotification(
    payload: CreateAdminNotificationRequestDto,
  ): Promise<AdminNotificationResponse> {
    const adminNotification = new AdminNotification();
    adminNotification.title = payload.title;
    adminNotification.message = payload.message;
    adminNotification.recipients = payload.recipients;
    adminNotification.types = payload.types;
    adminNotification.isScheduled = payload.isScheduled;

    if (payload.isScheduled && payload.scheduledDate) {
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
    const notification = await this.dbConnection.getRepository(AdminNotification).findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      console.log('Notification not found');
      return;
    }

    //MEMBERS => member, NON_MEMBERS => non_member, HOSTS => host
    const recipientList = notification.recipients.map(r => r.toLowerCase().replace(/s$/, ''));
    console.log('NotificationService => Sending admin notification to:', recipientList);

    if (notification.types.includes(AdminNotificationType.PUSH)) {
      this.sendPushNotification(notification, recipientList);
    }

    if (notification.types.includes(AdminNotificationType.SMS)) {
      this.sendSMSNotification(notification, recipientList);
    }
  }

  private async sendPushNotification(
    notification: AdminNotification,
    recipientList: string[],
  ): Promise<void> {
    const recipients = await this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .leftJoin('user.pushNotificationToken', 'pushToken')
      .where('role.name IN (:...recipientList)', { recipientList })
      .select('user.id, user.phoneNumber, user.email, role.name, pushToken.notificationToken')
      .limit(5)
      .getRawMany();

    console.log('NotificationService sendPushNotification() => MSG: ', notification.message);
    console.log(recipients);
  }

  private async sendSMSNotification(
    notification: AdminNotification,
    recipientList: string[],
  ): Promise<void> {
    const recipients = await this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'userRole')
      .leftJoin('userRole.role', 'role')
      .leftJoin('user.pushNotificationToken', 'pushToken')
      .where('role.name IN (:...recipientList)', { recipientList })
      .select('user.id, user.phoneNumber, user.email, role.name, pushToken.notificationToken')
      .limit(10)
      .getRawMany();

    console.log('NotificationService sendSMSNotification() => MSG: ', notification.message);
    console.log(recipients);
  }
}

const notificationService = new AdminNotificationService();
export default notificationService;
