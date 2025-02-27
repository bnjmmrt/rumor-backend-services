import { NotificationService } from '../services/notification.service';

import asyncWrapper from '../../../users/src/server/helpers/asyncWrapper';

import { getRepository } from 'typeorm';
import { Notification } from '../../../../packages/rumor-utils/shared/notifications/entities/notification.entity';

import * as serviceMesh from 'rumor-utils/packages/rumor-utils/service-mesh'
const authClient = serviceMesh.authClient;
const communicationClient = serviceMesh.communicationClient;

export class NotificationController {
  public static createNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await notificationService.createNotification(req, res);
      res.json(response);
    }
  );

  public static updateNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await notificationService.updateNotification(req, res);
      res.json(response);
    }
  );

  public static getNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await notificationService.getNotification(req, res);
      res.json(response);
    }
  );

  public static listNotifications = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await notificationService.listNotifications(req, res);
      res.json(response);
    }
  );

  public static deleteNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await notificationService.deleteNotification(req, res);
      res.json(response);
    }
  );

  public static sendPushNotification = asyncWrapper(
    async (req, res): Promise<void> => {
      const response = await notificationService.sendPushNotification(req, res);
      res.json(response);
    }
  );
}
