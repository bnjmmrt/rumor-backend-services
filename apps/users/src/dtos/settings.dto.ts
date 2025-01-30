import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  DeletePushNotificationTokenRequest,
  GetPushNotificationTokensRequest,
  UpdateNotificationPreferencesRequest,
  SavePushNotificationTokenRequest,
} from '../grpc/auth/settings.pb';

export class UpdateNotificationSettingRequestDto implements UpdateNotificationPreferencesRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsBoolean()
  allowEmailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  allowSMSNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyForEventsInMyCity?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyWhenFollowingEventHost?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyForEventInvitations?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyForMessagesFromHost?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyForEventAnnouncements?: boolean;

  @IsOptional()
  @IsBoolean()
  muteNotifications?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['1h', '8h', '24h'])
  muteDuration?: '1h' | '8h' | '24h';

  @IsOptional()
  @IsBoolean()
  enableSmsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAppNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enableEmailNotifications?: boolean;
}

export class GetPushNotificationTokensRequestDto implements GetPushNotificationTokensRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class SaveNotificationTokenRequestDto implements SavePushNotificationTokenRequest {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}

export class DeleteNotificationTokenRequestDto implements DeletePushNotificationTokenRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
