import { CreateAdminNotificationRequestDto } from 'rumor-utils/shared/notifications/dtos/notification.dto';
import database from '../database';
//import { BadRequestError, ConflictError, NotFoundError } from 'rumor-utils/errors';
import { AdminNotification } from 'rumor-utils/shared/notifications/entities/admin-notification.entity';
import { toAdminNotification } from 'rumor-utils/shared/notifications/mappers/notification.mapper';
import { AdminNotificationResponse } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import {
  SchedulerJobType,
  SchedulerTriggerPayload,
} from 'rumor-utils/shared/schedulers/interfaces/scheduler.interface';

export class AdminNotificationService {
  public static dbConnection = database;

  public static async createAdminNotification(
    payload: CreateAdminNotificationRequestDto,
  ): Promise<AdminNotificationResponse> {
    console.log({ payload });
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

  public static async sendAdminNotification(id: string): Promise<void> {
    console.log('NotificationService => Sending admin notification with id:', id);
  }
}
