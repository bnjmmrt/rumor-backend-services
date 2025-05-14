import { CreateAdminNotificationRequest } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import { AdminNotificationResponse } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import { CreateResponse } from 'rumor-utils/success';
import { AdminNotificationService } from '../services/admin-notification.service';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class AdminNotificationController {
  public static createAdminNotification = asyncWrapper(async (req, res): Promise<void> => {
    const payload: CreateAdminNotificationRequest = req.body;
    const response: AdminNotificationResponse =
      await AdminNotificationService.createAdminNotification(payload);
    const createResponse = new CreateResponse(response, 'Notification created successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static sendAdminNotification = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    await AdminNotificationService.sendAdminNotification(id);
    const createResponse = new CreateResponse({}, 'Notification sent successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });
}
