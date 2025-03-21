import database from "../database";
import { Notification } from "rumor-utils/shared/notifications/entities/notification.entity";
import { NotFoundError } from "rumor-utils/errors";
import { Event } from "rumor-utils/shared/events/entities";
import { User } from "rumor-utils/shared/users/entities/user.entity";
import { PushNotificationToken } from "rumor-utils/shared/users/entities/push-notification-token.entity";
import { UserSettings } from "rumor-utils/shared/users/entities/user-settings.entity";
import { In } from "typeorm";
import getNotificationDetails from "../server/helpers/notificationMatrix";
import firebaseNotificationsService from "../utils/firebase-notifications/firebase-notifications.service";
import { toNotificationslisting , toNotification} from "rumor-utils/shared/notifications/mappers/notification.mapper";

class NotificationService {
  public dbConnection = database;

  async sendNotification(
    notificationType: string,
    recipients: string | string[],
    linkedUserId?: string,
    linkedEventId?: string
  ) {
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
  
    // Fetch notification template
    const notificationTemplate = getNotificationDetails(notificationType);
    if (!notificationTemplate) {
      throw new Error(`Invalid notification type: ${notificationType}`);
    }
  
    // Fetch linked entities if needed
    const linkedUser = linkedUserId
      ? await User.getRepository().findOne({ where: { id: linkedUserId } })
      : null;
    if (notificationTemplate.hasOwnProperty("linkedUser") && !linkedUser) {
      throw new NotFoundError("Linked user not found");
    }
  
    const linkedEvent = linkedEventId
      ? await Event.getRepository().findOne({ where: { id: linkedEventId } })
      : null;
    if (notificationTemplate.hasOwnProperty("linkedEvent") && !linkedEvent) {
      throw new NotFoundError("Linked event not found");
    }
  
    const notificationsToSave = [];
    const fcmTokens: string[] = [];
    let notificationImage: string = "";
  
    for (const recipientId of recipientList) {
      const recipientUser = await User.getRepository().findOne({
        where: { id: recipientId },
      });
  
      if (!recipientUser) continue; 
  
      let pushMessage = notificationTemplate.pushMessage || "";
      let appMessage = notificationTemplate.appMessage || "";
      let body: any = notificationTemplate.body ? { eventId:linkedEvent?.id } : {};
  
      let message = pushMessage || appMessage;
      message = message
        .replace("[Event Start Time]", linkedEvent?.startDate || "")
        .replace(
          "[Recipient Name]",
          recipientUser?.firstName
            ? `${recipientUser.firstName} ${recipientUser.lastName}`
            : ""
        )
        .replace(
          "[Linked User Name]",
          linkedUser?.firstName
            ? `${linkedUser.firstName} ${linkedUser.lastName}`
            : ""
        )
        .replace("[Event Name]", linkedEvent?.name || "")
        .replace("[Event City Name]", linkedEvent?.location?.city || "")
        .replace("[Member Name]", body?.name || "")
        .replace("[Host Name]", body?.name || "");
  
      if (pushMessage) pushMessage = message;
      if (appMessage) appMessage = message;
  
      notificationImage = eval(notificationTemplate.image)  || "";
      
      const userPreferences = await UserSettings.getRepository().findOne({
        where: { user: recipientUser },
      });
      const canSendPush =
        notificationTemplate.pushNotification &&
        userPreferences?.enableAppNotifications;
  
      const notification = new Notification()

        notification.title = "Rumor",
        notification.message = message,
        notification.body = body,
        notification.notificationType = notificationType,
        notification.linkedUser = linkedUser,
        notification.linkedEvent = linkedEvent,
        notification.notificationModule = notificationTemplate.notificationModule
        notification.recipients = [recipientUser],
        notification.notificationImage = notificationTemplate.image,
  
      notificationsToSave.push(notification);
  
      if (canSendPush) {
        const tokens = await PushNotificationToken.getRepository().find({
          where: { user: recipientUser },
          select: ["notificationToken"],
        });
        fcmTokens.push(...tokens.map((data) => data.notificationToken));
      }
    }
  
    if (notificationTemplate.appNotification && notificationsToSave.length > 0) {
      await this.dbConnection.getRepository(Notification).save(notificationsToSave);
    }
  
    // Send push notifications if there are tokens
    if (fcmTokens.length > 0) {
      await firebaseNotificationsService.sendPushNotification({
        tokens: fcmTokens,
        body: notificationsToSave[0]?.message,
        title: notificationsToSave[0]?.title,
        image: notificationImage,
      });
    }
  
    return { success: true, message: "Notifications sent successfully." };
  }

  async getAllNotifications(
    recipientId: string,
    take = 10,
    skip = 0
  ): Promise<{ totalCount: number; result: Partial<Notification>[] }> {
    const queryBuilder = this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder("notification")
      .innerJoin("notification.recipients", "recipient", "recipient.id = :recipientId", {
        recipientId,
      })
      .leftJoinAndSelect("notification.linkedUser", "linkedUser")
      .leftJoinAndSelect("notification.linkedEvent", "linkedEvent")
      .orderBy("notification.created_at", "DESC");
  
    const totalCount = await queryBuilder.getCount();
  
    const notifications = await queryBuilder.take(take).skip(skip).getMany();
    
    return { totalCount, result: toNotificationslisting(notifications) };
  }
  

  async getNotificationDetail(notificationId: string): Promise<any> {
    // Fetch the notification
    const notification = await this.dbConnection
      .getRepository(Notification)
      .findOne({
        where: { id: notificationId },
        relations: ["linkedUser", "linkedEvent", "recipients"], // Load relations if needed
      });

    // If notification is not found, throw an error
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // If isSeen is false, update it to true
    if (!notification.isSeen) {
      await this.dbConnection
        .getRepository(Notification)
        .update(notificationId, { isSeen: true });
    }

    return toNotification(notification);
  }

  async deleteNotification(
    notificationId: string
  ): Promise<{ message: string }> {
    const result = await this.dbConnection
      .getRepository(Notification)
      .delete(notificationId);

    if (result.affected === 0) {
      throw new NotFoundError("Notification not found");
    }

    return { message: "Notification deleted successfully" };
  }

  async findAllNotifications(
    recipientId:string,
    take = 10,
    skip = 0,
    notificationByModule?: string,
    notificationByType?: string,
  ): Promise<{ totalCount: number; notifications: Partial<Notification>[] }> {
    const queryBuilder = this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder("notification")
      .innerJoin(
        "notification.recipients",
        "recipient",
        "recipient.id = :recipientId",
        { recipientId }
      )
      .select([
        "notification.id",
        "notification.title",
        "notification.notificationType",
        "notification.notificationModule",
        "notification.created_at",
        "notification.message",
        "notification.body",
      ])
      .orderBy("notification.created_at", "DESC");

    // Apply filters if provided
    if (notificationByModule) {
      queryBuilder.andWhere(
        "notification.notificationModule = :notificationByModule",
        { notificationByModule }
      );
    }

    if (notificationByType) {
      queryBuilder.andWhere(
        "notification.notificationType = :notificationByType",
        { notificationByType }
      );
    }

    // Get total count before pagination
    const totalCount = await queryBuilder.getCount();

    // Apply pagination
    const notifications = await queryBuilder.take(take).skip(skip).getRawMany();



    return { totalCount, notifications };
  }

  async getNotificationSummary(recipientId: string): Promise<{
    totalNotifications: number;
    notificationsByModule: Record<string, number>;
    notificationsByType: Record<string, number>;
  }> {
    const queryBuilder = this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder("notification")
      .where('notification.isSeen = false')
      .innerJoin(
        "notification.recipients",
        "recipient",
        "recipient.id = :recipientId",
        { recipientId }
      );

    // Get total notifications count
    const totalNotifications = await queryBuilder.getCount();

    // Get count grouped by notificationModule
    const notificationsByModule = await queryBuilder
      .select("notification.notificationModule, COUNT(*) AS count")
      .groupBy("notification.notificationModule")
      .getRawMany();

    // Get count grouped by notificationType
    const notificationsByType = await queryBuilder
      .select("notification.notificationType, COUNT(*) AS count")
      .groupBy("notification.notificationType")
      .getRawMany();

    // Format response
    return {
      totalNotifications,
      notificationsByModule: notificationsByModule.reduce((acc, row) => {
        acc[row.notificationModule] = Number(row.count);
        return acc;
      }, {} as Record<string, number>),
      notificationsByType: notificationsByType.reduce((acc, row) => {
        acc[row.notificationType] = Number(row.count);
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async deleteMultipleNotifications(
    recipientId: string,
    notificationIds: string[]
  ): Promise<{ deletedCount: number }> {
    if (!notificationIds || notificationIds.length === 0) {
      throw new Error("No notification IDs provided.");
    }

    const result = await this.dbConnection
      .getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where("id IN (:...notificationIds)", { notificationIds })
      .andWhere(
        "id IN (SELECT nr.notification_id FROM notification_recipients nr WHERE nr.user_id = :recipientId)",
        { recipientId }
      )
      .execute();

    return { deletedCount: result.affected || 0 };
  }

  async createNotification(
    title: string,
    message: string,
    body: object,
    notificationType: string,
    notificationModule: string,
    recipientIds: string[],
    linkedUserId?: string,
    linkedEventId?: string
  ): Promise<Notification> {
    return await this.dbConnection.connection.transaction(
      async (transactionalEntityManager) => {
        const notificationRepository =
          transactionalEntityManager.getRepository(Notification);
        const userRepository = transactionalEntityManager.getRepository(User);
        const eventRepository = transactionalEntityManager.getRepository(Event);

        const newNotification = notificationRepository.create({
          title,
          message,
          body,
          notificationType,
          notificationModule,
          linkedUser: linkedUserId
            ? await userRepository.findOne({ where: { id: linkedUserId } })
            : null,
          linkedEvent: linkedEventId
            ? await eventRepository.findOne({ where: { id: linkedEventId } })
            : null,
        });

        const savedNotification = await notificationRepository.save(
          newNotification
        );

        if (recipientIds.length > 0) {
          const recipients = await userRepository.find({
            where: { id: In(recipientIds) },
          });
          savedNotification.recipients = recipients;
          await notificationRepository.save(savedNotification);
        }

        return savedNotification;
      }
    );
  }

}

const notificationSerice = new NotificationService();
export default notificationSerice;
