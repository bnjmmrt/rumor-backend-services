import { NotificationService } from '../services/notification.service';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class NotificationController {

  public static createNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await NotificationService.createNotification(req, res);
      res.json(response);
    }
  );

  public static updateNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await NotificationService.updateNotification(req, res);
      res.json(response);
    }
  );

  public static getNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await NotificationService.getNotification(req, res);
      res.json(response);
    }
  );

  public static listNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await NotificationService.listNotifications(req, res);
      res.json(response);
    }
  );

  public static deleteNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await NotificationService.deleteNotification(req, res);
      res.json(response);
    }
  );

  public static sendPushNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await NotificationService.sendPushNotification(req, res);
      res.json(response);
    }
  );
}
