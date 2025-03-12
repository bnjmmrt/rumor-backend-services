// import { Notification } from '../entities/notification.entity';
// import { NotificationData, NotificationType, RecipientsType, NotificationStatus, NotificationSource } from '../grpc/notification/notification.pb';
// import {
//   NotificationType as NotificationTypeInterface,
//   // RecipientsType as RecipientsTypeInterface,
//   NotificationStatus as NotificationStatusInterface,
//   NotificationSource as NotificationSourceInterface,
// } from '../interfaces/notification.interface';

// export const toNotificationData = (notification: Notification): NotificationData => {
//   return {
//     title: notification.title,
//     message: notification.message,
//     date: notification.date,
//     time: notification.time,
//     type: notification.type.map((item) => {
//       return entityToNotificationType[item];
//     }),
//     recipients: notification.recipients.map((item) => {
//       return entityToRecipientsType[item];
//     }),
//     emails: notification.emails,
//     userIds: notification.userIds,
//     source: entityToNotificationStatus[notification.source],
//     status: entityToNotificationSource[notification.status],
//     templateId: notification?.relatedTemplate?.id || undefined,
//     id: notification.id,
//   };
// };

// export const entityToNotificationSource: { [g in NotificationSourceInterface]: NotificationSource } = {
//   [NotificationSourceInterface.AUTOMATED]: NotificationSource.AUTOMATED,
//   [NotificationSourceInterface.CUSTOM]: NotificationSource.CUSTOM,
// };

// export const entityToNotificationStatus: { [g in NotificationStatusInterface]: NotificationStatus } = {
//   [NotificationStatusInterface.SENT]: NotificationStatus.SENT,
//   [NotificationStatusInterface.SCHEDULED]: NotificationStatus.SCHEDULED,
//   [NotificationStatusInterface.INACTIVE]: NotificationStatus.INACTIVE,
//   [NotificationStatusInterface.ACTIVE]: NotificationStatus.ACTIVE,
//   [NotificationStatusInterface.DRAFT]: NotificationStatus.DRAFT,
// };

// export const entityToNotificationType: { [g in NotificationTypeInterface]: NotificationType } = {
//   [NotificationTypeInterface.SMS]: NotificationType.SMS,
//   [NotificationTypeInterface.EMAIL]: NotificationType.EMAIL,
//   [NotificationTypeInterface.PUSH]: NotificationType.PUSH,
// };

// export const entityToRecipientsType: { [g in RecipientsTypeInterface]: RecipientsType } = {
//   [RecipientsTypeInterface.MEMBERS]: RecipientsType.MEMBERS,
//   [RecipientsTypeInterface.HOSTS]: RecipientsType.HOSTS,
//   [RecipientsTypeInterface.NON_MEMBERS]: RecipientsType.NON_MEMBERS,
// };

// export const notificationTypeToEntity: { [g in NotificationType]: NotificationTypeInterface } = {
//   [NotificationType.SMS]: NotificationTypeInterface.SMS,
//   [NotificationType.EMAIL]: NotificationTypeInterface.EMAIL,
//   [NotificationType.PUSH]: NotificationTypeInterface.PUSH,
//   [NotificationType.UNRECOGNIZED]: NotificationTypeInterface.SMS,
// };

// export const recipientsTypeToEntity: { [g in RecipientsType]: RecipientsTypeInterface } = {
//   [RecipientsType.MEMBERS]: RecipientsTypeInterface.MEMBERS,
//   [RecipientsType.HOSTS]: RecipientsTypeInterface.HOSTS,
//   [RecipientsType.NON_MEMBERS]: RecipientsTypeInterface.NON_MEMBERS,
//   [RecipientsType.UNRECOGNIZED]: RecipientsTypeInterface.MEMBERS,
// };

// export const notificationStatusToEntity: { [g in NotificationStatus]: NotificationStatusInterface } = {
//   [NotificationStatus.SENT]: NotificationStatusInterface.SENT,
//   [NotificationStatus.SCHEDULED]: NotificationStatusInterface.SCHEDULED,
//   [NotificationStatus.INACTIVE]: NotificationStatusInterface.INACTIVE,
//   [NotificationStatus.ACTIVE]: NotificationStatusInterface.ACTIVE,
//   [NotificationStatus.DRAFT]: NotificationStatusInterface.DRAFT,
//   [NotificationStatus.UNRECOGNIZED]: NotificationStatusInterface.SENT,
// };

// export const notificationSourceToEntity: { [g in NotificationSource]: NotificationSourceInterface } = {
//   [NotificationSource.AUTOMATED]: NotificationSourceInterface.AUTOMATED,
//   [NotificationSource.CUSTOM]: NotificationSourceInterface.CUSTOM,
//   [NotificationStatus.UNRECOGNIZED]: NotificationSourceInterface.CUSTOM,
// };
