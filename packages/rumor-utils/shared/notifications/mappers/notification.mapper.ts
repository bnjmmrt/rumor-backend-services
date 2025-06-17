import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as tz from 'dayjs/plugin/timezone';
import { AdminNotification } from '../entities/admin-notification.entity';
import { Notification } from '../entities/notification.entity';
import {
  AdminNotificationResponse,
  NotificationStatus,
} from '../interfaces/notification.interface';

dayjs.extend(utc);
dayjs.extend(tz);

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
    title: notification.title,
    message: notification.message,
    recipients: notification.recipients,
    channels: notification.channels,
    scheduledDate: notification.scheduledDate
      ? dayjs(notification.scheduledDate).tz('America/New_York').format('MM/DD/YYYY hh:mm A')
      : null,
    status: notification.status,
    deliveryType: notification.deliveryType,
    sentDate:
      notification.status === NotificationStatus.SENT
        ? dayjs(notification.scheduledDate || notification.updatedAt)
            .tz('America/New_York')
            .format('MM/DD/YYYY hh:mm A')
        : '',
  };
}

export { toNotificationslisting, toNotification, toAdminNotification };
