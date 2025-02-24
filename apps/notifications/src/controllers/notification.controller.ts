import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from '../services/notification.service';

import { NOTIFICATION_SERVICE_NAME, GetNotificationResponse, ListNotificationsResponse, GenericResponse } from '../grpc/notification/notification.pb';
import {
  CreateNotificationRequestDto,
  ListNotificationsRequestDto,
  RequestByIdDto,
  SendPushNotificationRequestDto,
  UpdateNotificationRequestDto,
} from '../dtos/notification.dto';

@Controller('notification')
export class NotificationController {
  @Inject(NotificationService)
  private readonly service: NotificationService;

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'CreateNotification')
  private async createNotification(payload: CreateNotificationRequestDto): Promise<GenericResponse> {
    return this.service.createNotification(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'UpdateNotification')
  private async updateNotification(payload: UpdateNotificationRequestDto): Promise<GenericResponse> {
    return this.service.updateNotification(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetNotification')
  private async getNotification(payload: RequestByIdDto): Promise<GetNotificationResponse> {
    return this.service.getNotification(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'ListNotifications')
  private async listNotifications(payload: ListNotificationsRequestDto): Promise<ListNotificationsResponse> {
    return this.service.listNotifications(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'DeleteNotification')
  private async deleteNotification(payload: RequestByIdDto): Promise<GenericResponse> {
    return this.service.deleteNotification(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendPushNotification')
  private async sendPushNotification(payload: SendPushNotificationRequestDto): Promise<GenericResponse> {
    return this.service.sendPushNotification(payload);
  }
}
