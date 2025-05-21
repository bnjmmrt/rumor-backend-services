import { CreateAdminNotificationRequest } from '../grpc/notification/notification.pb';

export enum NotificationStatus {
  SENT = 'SENT',
  SCHEDULED = 'SCHEDULED',
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  CREATED = 'CREATED',
}
export enum NotificationSource {
  AUTOMATED = 'AUTOMATED',
  CUSTOM = 'CUSTOM',
}
export enum AdminNotificationRecipients {
  MEMBERS = 'MEMBERS',
  HOSTS = 'HOSTS',
  NON_MEMBERS = 'NON_MEMBERS',
}

export interface AdminNotificationResponse extends CreateAdminNotificationRequest {
  id: string;
  status: NotificationStatus;
  sentDate?: string;
}

export enum NotificationType {}

export enum NotificationModules {}
