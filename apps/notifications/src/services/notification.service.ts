import { Request, Response } from "express";
import { Repository, Brackets } from "typeorm";
import { Notification } from "../../../../packages/rumor-utils/shared/notifications/entities/notification.entity";
import {
  NotificationSource,
  NotificationStatus,
  NotificationType,
  RecipientsType,
} from "../interfaces/notification.interface";
import {
  notificationSourceToEntity,
  notificationStatusToEntity,
  notificationTypeToEntity,
  recipientsTypeToEntity,
  toNotificationData,
} from "../mappers/notification.mapper";
import { parse } from "qs";
import { hasPagination } from "../../../../packages/rumor-utils/shared/users/dtos/shared.dto";
// import { AuthClient } from '../../../../packages/rumor-utils/client/auth.client';
// import { CommunicationClient } from '../../../../packages/rumor-utils/client/communication.client';
// import { responses } from "../../../users/src/common/responses";
import * as serviceMesh from 'rumor-utils/service-mesh'

import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
  ListNotificationsRequestDto,
  RequestByIdDto,
  SendPushNotificationRequestDto,
} from "../../../../packages/rumor-utils/shared/notifications/dtos/notification.dto";
import { EmailTemplate } from "@fusionauth/typescript-client";

export class NotificationService {
  public static async createNotification(req: Request, res: Response) {
    try {
      const payload: CreateNotificationRequestDto = req.body;
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
        const template = await this.communicationClient.getTemplateById(
          payload.templateId
        );
        if (template) notification.relatedTemplate = template;
      }

      await this.notificationRepository.save(notification);
      return res.json(responses.ok);
    } catch (err) {
      return res
        .status(400)
        .json(responses.badRequest("Error creating notification."));
    }
  }

  async updateNotification(req: Request, res: Response) {
    try {
      const payload: UpdateNotificationRequestDto = req.body;
      const notification = await this.notificationRepository.findOne({
        where: { id: payload.id },
      });
      if (!notification)
        return res
          .status(404)
          .json(responses.notFound("Notification not found"));
      if (notification.status === NotificationStatus.SENT)
        return res
          .status(400)
          .json(responses.badRequest("Cannot modify a sent notification"));
      notification.title = payload.title || notification.title;
      notification.message = payload.message || notification.message;
      notification.date = payload.date || notification.date;
      notification.time = payload.time || notification.time;
      notification.emails = payload.emails || notification.emails;
      notification.userIds = payload.userIds || notification.userIds;

      notification.source =
        notificationSourceToEntity[payload.source] || notification.source;
      notification.status =
        notificationStatusToEntity[payload.status] || notification.status;

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
        const template: Partial<EmailTemplate> =
          await this.communicationClient.getTemplateById(payload.id);
        if (template) notification.relatedTemplate = template;
      }

      await this.notificationRepository.save(notification);
      return responses.ok;
    } catch (err) {
      return res
        .status(400)
        .json(responses.badRequest("Error updating notification."));
    }
  }

  async getNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await this.notificationRepository.findOne({
        where: { id },
        relations: ["relatedTemplate"],
      });
      if (!notification)
        return res
          .status(404)
          .json(responses.notFound("Notification not found"));
      return res.json(responses.data(toNotificationData(notification)));
    } catch (err) {
      return res
        .status(400)
        .json(responses.badRequest("Error fetching notification."));
    }
  }

  async listNotifications(req: Request, res: Response) {
    try {
      const parsedQuery = parse(req.query as unknown as string);
      const pagination = hasPagination(parsedQuery)
        ? { take: parseInt(parsedQuery.take), skip: parseInt(parsedQuery.skip) }
        : {};
      const queryBuilder =
        this.notificationRepository.createQueryBuilder("notification");

      if (parsedQuery.recipients) {
        const recipients = String(parsedQuery.recipients)
          .split(",")
          .map((item) => item.trim());
        queryBuilder.andWhere("notification.recipients @> :recipients", {
          recipients: JSON.stringify(recipients),
        });
      }
      if (parsedQuery.type) {
        const types = String(parsedQuery.type)
          .split(",")
          .map((item) => item.trim());
        queryBuilder.andWhere("notification.type @> :type", {
          recipients: JSON.stringify(types),
        });
      }

      if (parsedQuery.status) {
        const statusList = String(parsedQuery.status)
          .split(",")
          .map((item) => item.trim() as NotificationStatus);
        queryBuilder.andWhere("notification.status IN (:...statusList)", {
          statusList,
        });
      }

      if (parsedQuery.source) {
        const sources = String(parsedQuery.source)
          .split(",")
          .map((item) => item.trim() as NotificationSource);
        queryBuilder.andWhere("notification.source IN (:...sources)", {
          sources,
        });
      }

      if (parsedQuery.date) {
        const date = new Date(String(parsedQuery.date));
        queryBuilder.andWhere("notification.date = :date", { date });
      }

      if (parsedQuery.findByTitleOrMessage) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("notification.title ILIKE :searchTerm", {
              searchTerm: `%${parsedQuery.findByTitleOrMessage}%`,
            }).orWhere("notification.message ILIKE :searchTerm", {
              searchTerm: `%${parsedQuery.findByTitleOrMessage}%`,
            });
          })
        );
      }

      if (parsedQuery.sortBy) {
        const sortOrder = String(parsedQuery.order || "ASC").toUpperCase();
        queryBuilder.orderBy(
          `notification.${parsedQuery.sortBy}`,
          sortOrder as "ASC" | "DESC"
        );
      }

      if (pagination.take) queryBuilder.take(pagination.take);
      if (pagination.skip) queryBuilder.skip(pagination.skip);

      queryBuilder.relation("relatedTemplate");

      const notifications = await queryBuilder.getMany();
      return res.json(responses.data(notifications.map(toNotificationData)));
    } catch (err) {
      return res
        .status(400)
        .json(responses.badRequest("Error listing notifications."));
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.notificationRepository.delete({ id });
      return res.json(responses.ok);
    } catch (err) {
      return res
        .status(400)
        .json(responses.badRequest("Error deleting notification."));
    }
  }

  async sendPushNotification(req: Request, res: Response) {
    try {
      const payload: SendPushNotificationRequestDto = req.body;
      const userSettings = await serviceMesh.getUserSettings(
        payload.userId
      );
      if (!userSettings) return responses.notFound("user settings not found");

      const notificationSettings = userSettings.notificationsSettings;
      if (!notificationSettings.allowPushNotifications) return responses.ok;
      if (!notificationSettings.enableAppNotifications) return responses.ok;

      if (notificationSettings.muteNotifications) return responses.ok;

      const pushNotificationTokens =
        await this.authClient.getPushNotificationTokens(payload.userId);
      const notificationTokens = pushNotificationTokens.map(
        (p) => p.notificationToken
      );
      if (notificationTokens.length === 0) return responses.ok;

      await this.communicationClient.sendPushNotification(
        notificationTokens,
        payload.title,
        payload.body
      );
      return res.json(responses.ok);
    } catch (err) {
      return res
        .status(400)
        .json(responses.badRequest("Error sending push notification."));
    }
  }
}
