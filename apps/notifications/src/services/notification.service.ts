import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CreateNotificationRequestDto,
  ListNotificationsRequestDto,
  RequestByIdDto,
  SendPushNotificationRequestDto,
  UpdateNotificationRequestDto,
} from '../dtos/notification.dto';
import { GenericResponse, GetNotificationResponse, ListNotificationsResponse } from '../grpc/notification/notification.pb';
import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Notification } from '../entities/notification.entity';
import { NotificationSource, NotificationStatus, NotificationType, RecipientsType } from '../interfaces/notification.interface';
import {
  notificationSourceToEntity,
  notificationStatusToEntity,
  notificationTypeToEntity,
  recipientsTypeToEntity,
  toNotificationData,
} from '../mappers/notification.mapper';

import { parse } from 'qs';
import { hasPagination } from '../../../user-service/src/dtos/shared.dto';
import { CommunicationClient } from '@rumor/shared/clients/communication.client';
import { EmailTemplate } from '@fusionauth/typescript-client';
import { AuthClient } from '@rumor/shared/clients/auth.client';
import { responses } from '../common/responses';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  @InjectRepository(Notification)
  private readonly notificationRepository: Repository<Notification>;

  @Inject(AuthClient)
  private readonly authClient: AuthClient;

  @Inject(CommunicationClient)
  private readonly communicationClient: CommunicationClient;

  constructor(private readonly configService: ConfigService) {}

  async createNotification(payload: CreateNotificationRequestDto): Promise<GenericResponse> {
    try {
      const notification = new Notification();
      notification.title = payload.title;
      notification.message = payload.message;
      notification.date = payload.date;
      notification.time = payload.time;

      let types: NotificationType[] = [];
      if (payload.type)
        types = payload.type.map((item) => {
          return notificationTypeToEntity[item];
        });
      notification.type = types;
      let recipients: RecipientsType[] = [];
      if (payload.recipients)
        recipients = payload.recipients.map((item) => {
          return recipientsTypeToEntity[item];
        });
      notification.recipients = recipients;
      notification.emails = payload.emails;
      notification.userIds = payload.userIds;
      notification.source = notificationSourceToEntity[payload.source];

      if (payload.templateId) {
        const template: Partial<EmailTemplate> = await this.communicationClient.getTemplateById(payload.templateId);
        if (template) notification.relatedTemplate = template;
      }

      await this.notificationRepository.save(notification);
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to create notification.');
    }
  }

  async updateNotification(payload: UpdateNotificationRequestDto): Promise<GenericResponse> {
    try {
      const notification = await this.notificationRepository.findOne({ where: { id: payload.id } });
      if (!notification) return responses.notFound('Notification not found');

      if (notification.status == NotificationStatus.SENT) return responses.badRequest('You can not modify a notification already sent');

      notification.title = payload.title || notification.title;
      notification.message = payload.message || notification.message;
      notification.date = payload.date || notification.date;
      notification.time = payload.time || notification.time;
      notification.emails = payload.emails || notification.emails;
      notification.userIds = payload.userIds || notification.userIds;

      notification.source = notificationSourceToEntity[payload.source] || notification.source;
      notification.status = notificationStatusToEntity[payload.status] || notification.status;

      let types: NotificationType[] = [];
      if (payload.type)
        types = payload.type.map((item) => {
          return notificationTypeToEntity[item];
        });
      notification.type = types;
      let recipients: RecipientsType[] = [];
      if (payload.recipients)
        recipients = payload.recipients.map((item) => {
          return recipientsTypeToEntity[item];
        });
      notification.recipients = recipients;

      if (payload.templateId) {
        const template: Partial<EmailTemplate> = await this.communicationClient.getTemplateById(payload.id);
        if (template) notification.relatedTemplate = template;
      }

      await this.notificationRepository.save(notification);
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to update notification.');
    }
  }

  async getNotification(payload: RequestByIdDto): Promise<GetNotificationResponse> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: payload.id },
        relations: ['relatedTemplate'],
      });
      if (!notification) return responses.notFound('Notification not found');
      return responses.data(toNotificationData(notification));
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to get notification.');
    }
  }

  async listNotifications(payload: ListNotificationsRequestDto): Promise<ListNotificationsResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const pagination = hasPagination(parsedQuery)
        ? {
            take: parseInt(parsedQuery.take),
            skip: parseInt(parsedQuery.skip),
          }
        : {};

      const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

      if (parsedQuery.recipients) {
        const recipients = String(parsedQuery.recipients)
          .split(',')
          .map((item) => item.trim());
        queryBuilder.andWhere('notification.recipients @> :recipients', {
          recipients: JSON.stringify(recipients),
        });
      }

      if (parsedQuery.type) {
        const types = String(parsedQuery.type)
          .split(',')
          .map((item) => item.trim());
        queryBuilder.andWhere('notification.type @> :type', {
          recipients: JSON.stringify(types),
        });
      }

      if (parsedQuery.status) {
        const statusList = String(parsedQuery.status)
          .split(',')
          .map((item) => item.trim() as NotificationStatus);
        queryBuilder.andWhere('notification.status IN (:...statusList)', { statusList });
      }

      if (parsedQuery.source) {
        const sources = String(parsedQuery.source)
          .split(',')
          .map((item) => item.trim() as NotificationSource);
        queryBuilder.andWhere('notification.source IN (:...sources)', { sources });
      }

      if (parsedQuery.date) {
        const date = new Date(String(parsedQuery.date));
        queryBuilder.andWhere('notification.date = :date', { date });
      }

      if (parsedQuery.findByTitleOrMessage) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('notification.title ILIKE :searchTerm', { searchTerm: `%${parsedQuery.findByTitleOrMessage}%` }).orWhere('notification.message ILIKE :searchTerm', {
              searchTerm: `%${parsedQuery.findByTitleOrMessage}%`,
            });
          }),
        );
      }

      if (parsedQuery.sortBy) {
        const sortOrder = String(parsedQuery.order || 'ASC').toUpperCase();
        queryBuilder.orderBy(`notification.${parsedQuery.sortBy}`, sortOrder as 'ASC' | 'DESC');
      }

      if (pagination.take) queryBuilder.take(pagination.take);
      if (pagination.skip) queryBuilder.skip(pagination.skip);

      queryBuilder.relation('relatedTemplate');

      const notifications = await queryBuilder.getMany();

      return responses.data(notifications.map((item) => toNotificationData(item)));
    } catch (err) {
      console.error(err);
      this.logger.error(err);
      return responses.badRequest('An error occurred while trying to list notifications.');
    }
  }

  async deleteNotification(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      await this.notificationRepository.delete({ id: payload.id });
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to delete notification.');
    }
  }

  async sendPushNotification(payload: SendPushNotificationRequestDto): Promise<GenericResponse> {
    try {
      const userSettings = await this.authClient.getUserSettings(payload.userId);
      if (!userSettings) return responses.notFound('user settings not found');

      const notificationSettings = userSettings.notificationsSettings;
      if (!notificationSettings.allowPushNotifications) return responses.ok;
      if (!notificationSettings.enableAppNotifications) return responses.ok;

      if (notificationSettings.muteNotifications) return responses.ok;

      const pushNotificationTokens = await this.authClient.getPushNotificationTokens(payload.userId);
      const notificationTokens = pushNotificationTokens.map((p) => p.notificationToken);
      if (notificationTokens.length === 0) return responses.ok;

      await this.communicationClient.sendPushNotification(notificationTokens, payload.title, payload.body);
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('error occurred while trying to send push notification');
    }
  }
}
