import * as dayjs from 'dayjs';
import { AdminNotification } from '../entities/admin-notification.entity';
import { Notification } from '../entities/notification.entity';
import { AdminNotificationResponse } from '../grpc/notification/notification.pb';
interface NotificationResponse {
  id: string;
  title: string;
  type: string;
  image: string;
  message: string;
  isSeen: boolean;
  body?: object;
  notificationModule?: string;
  role?: string;
  createdDate: Date;
}

function toNotificationslisting(notifications: Partial<Notification>[]): NotificationResponse[] {
  return notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.notificationType,
    notificationModule: notification.notificationModule,
    image: notification.notificationImage
      ? eval(`notification.${notification.notificationImage}`)
      : 'https://host.therumor.com/images/app/rumor_icon.svg',
    isSeen: notification.isSeen,
    body: notification.body,
    role: notification.role,
    createdDate: notification.createdAt,
  }));
}

function toNotification(notification: Partial<Notification>): NotificationResponse {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.notificationType,
    notificationModule: notification.notificationModule,
    image: notification.notificationImage
      ? eval(`notification.${notification.notificationImage}`)
      : 'https://host.therumor.com/images/app/rumor_icon.svg',
    isSeen: notification.isSeen,
    body: notification.body,
    role: notification.role,
    createdDate: notification.createdAt,
  };
}

function toAdminNotification(notification: Partial<AdminNotification>): AdminNotificationResponse {
  return {
    id: notification.id,
    isScheduled: notification.isScheduled,
    title: notification.title,
    message: notification.message,
    recipients: notification.recipients,
    types: notification.types,
    scheduledDate: notification.scheduledDate
      ? dayjs(notification.scheduledDate).format('MM/DD/YYYY HH:mm')
      : null,
  };
}

export { toNotificationslisting, toNotification, toAdminNotification };
