import notificationService from "../services/notification.service";
import asyncWrapper from "../server/helpers/asyncWrapper";

export class NotificationController {
  public static sendNotification = asyncWrapper(async (req, res): Promise<void> =>{

  })

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

      const response = await notificationService.createNotification(
        title,
        message,
        body,
        notificationType,
        notificationModule,
        recipientIds,
        linkedUserId,
        linkedEventId
      );
      res.json(response);
    }
  );

  public static getAllNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const recipientId = req.user;
      const { take = 10, skip = 0 } = req.query;
      
      const response = await notificationService.getAllNotifications(
        recipientId,
        Number(take),
        Number(skip)
      );
      res.json(response);
    }
  );

  public static getNotificationDetail = asyncWrapper(
    async (req, res): Promise<void> => {
      const { notificationId } = req.params;
      
      const response = await notificationService.getNotificationDetail(notificationId);
      res.json(response);
    }
  );

  public static deleteNotificationById = asyncWrapper(
    async (req, res): Promise<void> => {
      const { notificationId } = req.params;
      
      const response = await notificationService.deleteNotification(notificationId);
      res.json(response);
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
      res.json(response);
    }
  );

  public static getNotificationSummary = asyncWrapper(
    async (req, res): Promise<void> => {
      const recipientId  = req.user;
      const response = await notificationService.getNotificationSummary(recipientId);
      res.json(response);
    }
  );

  public static listNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const { take = 10, skip = 0, notificationByModule, notificationByType } = req.query;
      
      const response = await notificationService.findAllNotifications(
        Number(take),
        Number(skip),
        notificationByModule as string,
        notificationByType as string
      );
      res.json(response);
    }
  );

  // public static sendPushNotification = asyncWrapper(
  //   async (req, res): Promise<void> => {
  //     const response = await notificationService.sendPushNotification(req.body);
  //     res.json(response);
  //   }
  // );
}
