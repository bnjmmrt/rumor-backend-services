export enum NotificationType {
  SMS = 0,
  EMAIL = 1,
  PUSH = 2,
  UNRECOGNIZED = -1,
}

export enum RecipientsType {
  MEMBERS = 0,
  HOSTS = 1,
  NON_MEMBERS = 2,
  UNRECOGNIZED = -1,
}

export enum NotificationStatus {
  SENT = 0,
  SCHEDULED = 1,
  INACTIVE = 2,
  ACTIVE = 3,
  DRAFT = 4,
  UNRECOGNIZED = -1,
}

export enum NotificationSource {
  AUTOMATED = 0,
  CUSTOM = 1,
  UNRECOGNIZED = -1,
}

/** Generic Response */
export interface GenericResponse {
  status: number;
  error?: Error | undefined;
}

/** Error */
export interface Error {
  type: string;
  message: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  date: string;
  time: string;
  type: NotificationType[];
  recipients: RecipientsType[];
  emails: string[];
  userIds: string[];
  source?: NotificationSource | undefined;
  templateId?: string | undefined;
}

export interface NotificationData {
  title?: string | undefined;
  message?: string | undefined;
  date?: string | undefined;
  time?: string | undefined;
  type: NotificationType[];
  recipients: RecipientsType[];
  emails: string[];
  userIds: string[];
  status?: NotificationStatus | undefined;
  source?: NotificationSource | undefined;
  templateId?: string | undefined;
  id?: string | undefined;
}

export interface RequestById {
  id: string;
}

export interface GetNotificationResponse {
  status: number;
  error?: Error | undefined;
  data?: NotificationData | undefined;
}

export interface ListNotificationsRequest {
  query?: string | undefined;
}

export interface ListNotificationsResponse {
  status: number;
  error?: Error | undefined;
  data: NotificationData[];
}

export interface SendPushNotificationRequest {
  userId: string;
  title: string;
  body: string;
}