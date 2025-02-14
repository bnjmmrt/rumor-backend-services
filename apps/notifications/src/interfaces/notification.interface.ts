export enum NotificationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
}

export enum RecipientsType {
  MEMBERS = 'MEMBERS',
  HOSTS = 'HOSTS',
  NON_MEMBERS = 'NON_MEMBERS',
}

export enum NotificationStatus {
  SENT = 'SENT',
  SCHEDULED = 'SCHEDULED',
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
}

export enum NotificationSource {
  AUTOMATED = 'AUTOMATED',
  CUSTOM = 'CUSTOM',
}
