// import { Controller, Inject } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
// import { NotificationService } from '../services/notification.service';

// import { NOTIFICATION_SERVICE_NAME, GetNotificationResponse, ListNotificationsResponse, GenericResponse } from '../grpc/notification/notification.pb';
// import {
//   CreateNotificationRequestDto,
//   ListNotificationsRequestDto,
//   RequestByIdDto,
//   SendPushNotificationRequestDto,
//   UpdateNotificationRequestDto,
// } from '../dtos/notification.dto';

// @Controller('notification')
// export class NotificationController {
//   @Inject(NotificationService)
//   private readonly service: NotificationService;

//   @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'CreateNotification')
//   private async createNotification(payload: CreateNotificationRequestDto): Promise<GenericResponse> {
//     return this.service.createNotification(payload);
//   }

//   @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'UpdateNotification')
//   private async updateNotification(payload: UpdateNotificationRequestDto): Promise<GenericResponse> {
//     return this.service.updateNotification(payload);
//   }

//   @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetNotification')
//   private async getNotification(payload: RequestByIdDto): Promise<GetNotificationResponse> {
//     return this.service.getNotification(payload);
//   }

//   @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'ListNotifications')
//   private async listNotifications(payload: ListNotificationsRequestDto): Promise<ListNotificationsResponse> {
//     return this.service.listNotifications(payload);
//   }

//   @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'DeleteNotification')
//   private async deleteNotification(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.service.deleteNotification(payload);
//   }

//   @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendPushNotification')
//   private async sendPushNotification(payload: SendPushNotificationRequestDto): Promise<GenericResponse> {
//     return this.service.sendPushNotification(payload);
//   }
// }

import { NotificationService } from '../services/notification.service';

import asyncWrapper from '../../../users/src/server/helpers/asyncWrapper';

import { getRepository } from 'typeorm';
import { Notification } from '../../../../packages/rumor-utils/shared/notifications/entities/notification.entity';

const notificationRepository = getRepository(Notification);
import * as serviceMesh from 'rumor-utils/packages/rumor-utils/service-mesh'
const authClient = serviceMesh.authClient;
const communicationClient = serviceMesh.communicationClient;

const notificationService = new NotificationService(notificationRepository, authClient, communicationClient);

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
