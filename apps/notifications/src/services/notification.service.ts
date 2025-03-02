import { Request, Response } from "express";
import { Brackets } from "typeorm";
import { Notification } from "rumor-utils/shared/notifications/entities/notification.entity";
import {
  NotificationSource,
  NotificationStatus,
  NotificationType,
  RecipientsType,
} from "rumor-utils/shared/notifications/interfaces/notification.interface";
import {
  notificationSourceToEntity,
  notificationStatusToEntity,
  notificationTypeToEntity,
  recipientsTypeToEntity,
  toNotificationData,
} from "rumor-utils/shared/notifications/mappers/notification.mapper";
import { parse } from "qs";
import { hasPagination } from "rumor-utils/shared/users/dtos/shared.dto";
// import { AuthClient } from '../../../../packages/rumor-utils/client/auth.client';
// import { CommunicationClient } from '../../../../packages/rumor-utils/client/communication.client';
// import { responses } from "../../../users/src/common/responses";

import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
  ListNotificationsRequestDto,
  RequestByIdDto,
  SendPushNotificationRequestDto,
} from "rumor-utils/shared/notifications/dtos/notification.dto";
import { EmailTemplate } from "@fusionauth/typescript-client";
import database from "../database";
import { NotFoundError, BadRequestError } from 'rumor-utils/errors'
import * as serviceMesh from 'rumor-utils/service-mesh'

export class NotificationService {

  public static dbConnection = database;
  
  public static async createNotification(req: Request, res: Response) {
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

      // Changes below is needed for the following snippet
      if (payload.templateId) {
        const template = await serviceMesh.getTemplateById("",
          payload.templateId
        );
        if (template) notification.relatedTemplate = template;
      }

      return this.dbConnection.getRepository(Notification).save(notification);
  }


  public static async updateNotification(req: Request, res: Response) {
      const payload: UpdateNotificationRequestDto = req.body;
      const notification = await this.dbConnection.getRepository(Notification).findOne({
        where: { id: payload.id },
      });
      if (!notification)
        throw new NotFoundError("Notification not found");

      if (notification.status === NotificationStatus.SENT)
        throw new BadRequestError("Cannot modify a sent notification");

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
          await serviceMesh.getTemplateById("",payload.id); // This line is changed
        if (template) notification.relatedTemplate = template;
      }

      await this.dbConnection.getRepository(Notification).save(notification);
      return 
  }

  public static async getNotification(req: Request, res: Response) {
      const { id } = req.params;
      const notification = await this.dbConnection.getRepository(Notification).findOne({
        where: { id },
        relations: ["relatedTemplate"],
      });
      if (!notification)
        throw new Error("Notification not found");
      return toNotificationData(notification);
  }

  public static async listNotifications(req: Request, res: Response) {
      const parsedQuery = parse(req.query as unknown as string);
      const pagination = hasPagination(parsedQuery)
        ? { take: parseInt(parsedQuery.take), skip: parseInt(parsedQuery.skip) }
        : {};
      const queryBuilder =
        this.dbConnection.getRepository(Notification).createQueryBuilder("notification");

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
      return notifications.map(toNotificationData);
  }

  public static async deleteNotification(req: Request, res: Response) {
      const { id } = req.params;
      await this.dbConnection.getRepository(Notification).delete({ id });
      return ;
  }

  public static async sendPushNotification(req: Request, res: Response) {
      const payload: SendPushNotificationRequestDto = req.body;
      const userSettings = await serviceMesh.getUserSettings(
        "",payload.userId
      );
      
      if (!userSettings) throw new NotFoundError("user settings not found");

      const notificationSettings = userSettings.notificationsSettings;
      if (!notificationSettings.allowPushNotifications) return //responses.ok;
      if (!notificationSettings.enableAppNotifications) return //responses.ok;

      if (notificationSettings.muteNotifications) return //responses.ok;

      const pushNotificationTokens =
        await serviceMesh.getPushNotificationTokens("",payload.userId);
      const notificationTokens = pushNotificationTokens.map(
        (p) => p.notificationToken
      );
      if (notificationTokens.length === 0) return //responses.ok;

      // await serviceMesh.sendPushNotification(
      //   "",
      //   notificationTokens,
      //   payload.title,
      //   payload.body
      // );
      return //res.json(responses.ok);
  }
}
