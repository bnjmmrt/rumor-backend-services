import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsUUID,
  IsEnum,
  Matches,
} from 'class-validator';
import {
  CreateNotificationRequest,
  ListNotificationsRequest,
  NotificationSource,
  NotificationStatus,
  NotificationType,
  RecipientsType,
  RequestById,
  NotificationData,
  SendPushNotificationRequest,
  AdminNotificationRecipients,
  NotificationDeliveryChannel,
  CreateAdminNotificationRequest,
} from '../grpc/notification/notification.pb';

export class RequestByIdDto implements RequestById {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class ListNotificationsRequestDto implements ListNotificationsRequest {
  @IsOptional()
  @IsString()
  query?: string;
}

export class CreateAdminNotificationRequestDto implements CreateAdminNotificationRequest {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  scheduledDate?: string;

  @IsNotEmpty()
  @IsEnum(AdminNotificationRecipients, { each: true })
  recipients: AdminNotificationRecipients[];

  @IsNotEmpty()
  @IsEnum(NotificationDeliveryChannel, { each: true })
  channel: NotificationDeliveryChannel[];
}

export class CreateNotificationRequestDto implements CreateNotificationRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4})$/, {
    message: 'Date must be in the format MM/DD/YYYY',
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in the format HH:mm' })
  time: string;

  @IsNotEmpty()
  @IsEnum(NotificationType, { each: true })
  type: NotificationType[];

  @IsNotEmpty()
  @IsEnum(RecipientsType, { each: true })
  recipients: RecipientsType[];

  @IsArray()
  @IsString({ each: true })
  emails: string[];

  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @IsEnum(NotificationSource)
  source?: NotificationSource;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class UpdateNotificationRequestDto implements NotificationData {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4})$/, {
    message: 'date must be in the format MM/DD/YYYY',
  })
  date?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in the format HH:mm' })
  time?: string;

  @IsNotEmpty()
  @IsEnum(NotificationType, { each: true })
  type: NotificationType[];

  @IsNotEmpty()
  @IsEnum(RecipientsType, { each: true })
  recipients: RecipientsType[];

  @IsArray()
  @IsString({ each: true })
  emails: string[];

  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @IsEnum(NotificationSource)
  source?: NotificationSource;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsUUID()
  @IsOptional()
  id?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class SendPushNotificationRequestDto implements SendPushNotificationRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
