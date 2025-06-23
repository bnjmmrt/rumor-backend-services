import { CreateAdminNotificationRequest, UpdateAdminNotificationRequest } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import { AdminNotificationResponse } from 'rumor-utils/shared/notifications/interfaces/notification.interface';
import { CreateResponse, GetResponse, DeleteResponse } from 'rumor-utils/success';
import adminNotificationService from '../services/admin-notification.service';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class AdminNotificationController {
  public static createAdminNotification = asyncWrapper(async (req, res): Promise<void> => {
    const payload: CreateAdminNotificationRequest = req.body;
    const response: AdminNotificationResponse =
      await adminNotificationService.createAdminNotification(payload);
    const createResponse = new CreateResponse(response, 'Notification created successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static updateAdminNotification = asyncWrapper(async (req, res): Promise<void> => {
    const { notificationId } = req.params;
    const payload: UpdateAdminNotificationRequest = { ...req.body, id: notificationId };
    const response: AdminNotificationResponse =
      await adminNotificationService.updateAdminNotification(payload);
    const createResponse = new CreateResponse(response, 'Notification updated successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static sendAdminNotification = asyncWrapper(async (req, res): Promise<void> => {
    const { notificationId } = req.params;
    await adminNotificationService.sendAdminNotification(notificationId);
    const createResponse = new CreateResponse({}, 'Notification sent successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static getAllAdminNotifications = asyncWrapper(async (req, res): Promise<void> => {
    const response: AdminNotificationResponse[] =
      await adminNotificationService.getAllAdminNotifications();
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static getAdminNotification = asyncWrapper(async (req, res): Promise<void> => {
    const { notificationId } = req.params;
    const response: AdminNotificationResponse =
      await adminNotificationService.getAdminNotification(notificationId);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static deleteNotificationById = asyncWrapper(async (req, res): Promise<void> => {
    const { notificationId } = req.params;

    const response = await adminNotificationService.deleteAdminNotification(notificationId);

    const deleteResponse = new DeleteResponse(response);
    res.status(deleteResponse.statusCode).json(deleteResponse);
  });
}
