import { CreateAdminNotificationRequestDto } from 'rumor-utils/shared/notifications/dtos/notification.dto';
import database from '../database';
import { BadRequestError, ConflictError, NotFoundError } from 'rumor-utils/errors';
import { AdminNotification } from 'rumor-utils/shared/notifications/entities/admin-notification.entity';
import { toAdminNotification } from 'rumor-utils/shared/notifications/mappers/notification.mapper';
import { AdminNotificationResponse } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';

export class AdminNotificationService {
    public static dbConnection = database;
  
    public static async createAdminNotification(payload: CreateAdminNotificationRequestDto): Promise<AdminNotificationResponse> {
        console.log({payload});
        const adminNotification = new AdminNotification();
        adminNotification.title = payload.title;
        adminNotification.message = payload.message;
        adminNotification.isScheduled = false;
        adminNotification.scheduledDate = null;
        adminNotification.recipients = [];
        const created = await this.dbConnection.getRepository(AdminNotification).save(adminNotification);

        return toAdminNotification(created);
    }

}