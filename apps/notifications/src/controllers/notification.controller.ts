import notificationService from "../services/notification.service";
import asyncWrapper from "../server/helpers/asyncWrapper";
import {CreateResponse, GetResponse, DeleteResponse} from 'rumor-utils/success';

export class NotificationController {
  public static sendNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const { notificationType, recipients, linkedUserId, linkedEventId } =
        req.body;
        
      await notificationService.sendNotification(
        notificationType,
        recipients,
        linkedUserId,
        linkedEventId
      );

      const successResponse = new CreateResponse({}, "Notification sent successfully");
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static createNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const {
        title,
        message,
        body,
        notificationType,
        notificationModule,
        recipientIds,
        linkedUserId,
        linkedEventId,
      } = req.body;

      const createReponse = await notificationService.createNotification(
        title,
        message,
        body,
        notificationType,
        notificationModule,
        recipientIds,
        linkedUserId,
        linkedEventId
      );

      const successResponse = new CreateResponse(createReponse, "Notification sent successfully");
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getAllNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const recipientId = req.user;
      console.log("🚀 ~ NotificationController ~ recipientId:", recipientId)
      const { take = 10, skip = 0 } = req.query;

      const response = await notificationService.getAllNotifications(
        recipientId,
        Number(take),
        Number(skip)
      );

      const getResponse = new GetResponse(response);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static getNotificationDetail = asyncWrapper(
    async (req, res): Promise<void> => {
      const { notificationId } = req.params;
      const response = await notificationService.getNotificationDetail(
        notificationId
      );

      const getResponse = new GetResponse(response);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static deleteNotificationById = asyncWrapper(
    async (req, res): Promise<void> => {
      const { notificationId } = req.params;

      const response = await notificationService.deleteNotification(
        notificationId
      );

      const deleteResponse = new DeleteResponse(response);
      res.status(deleteResponse.statusCode).json(deleteResponse);
    }
  );

  public static deleteMultipleNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const recipientId = req.user;
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ error: "Invalid notificationIds array" });
      }

      const response = await notificationService.deleteMultipleNotifications(
        recipientId,
        notificationIds
      );

      const deleteResponse = new DeleteResponse(response);
      res.status(deleteResponse.statusCode).json(deleteResponse);
    }
  );

  public static getNotificationSummary = asyncWrapper(
    async (req, res): Promise<void> => {
      const recipientId = req.user;
      const response = await notificationService.getNotificationSummary(
        recipientId
      );

      const getResponse = new GetResponse(response);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static listNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const {
        take = 10,
        skip = 0,
        notificationByModule,
        notificationByType,
      } = req.query;
      const recipientId = req.user;
      const response = await notificationService.findAllNotifications(
        recipientId,
        Number(take),
        Number(skip),
        notificationByModule as string,
        notificationByType as string
      );
      
      const getResponse = new GetResponse(response);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );
}
