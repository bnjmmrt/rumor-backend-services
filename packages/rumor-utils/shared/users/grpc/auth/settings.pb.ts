import { Observable } from "rxjs";
import { UserDataSimple } from "./auth.pb";
import { Error, GenericResponse, IdRequest } from "./shared.pb";

export const protobufPackage = "auth";

export interface ProfileNotificationSetting {
  allowPushNotifications: boolean;
  allowSMSNotifications: boolean;
  allowEmailNotifications: boolean;
  // notifyForEventsInMyCity?: boolean;
  // notifyWhenFollowingEventHost?: boolean;
  // notifyForEventInvitations?: boolean;
  // notifyForMessagesFromHost?: boolean;
  // notifyForEventAnnouncements?: boolean;
  // muteNotifications?: boolean;
  // muteDuration?: string;
  // enableSmsNotifications?: boolean;
  // enableAppNotifications?: boolean;
  // enableEmailNotifications?: boolean;
  // timeLeftMuteNotification?: string;
}

export interface UserSettings {
  userData: UserDataSimple | undefined;
  notificationsSettings: ProfileNotificationSetting | undefined;
}

export interface UserSettingResponse {
  status: number;
  error?: Error | undefined;
  data?: UserSettings | undefined;
}

export interface UpdateNotificationPreferencesRequest {
  userId: string;
  allowSMSNotifications?: boolean | undefined;
  allowEmailNotifications?: boolean | undefined;
  allowPushNotifications?: boolean | undefined;
  // notifyForEventsInMyCity?: boolean | undefined;
  // notifyWhenFollowingEventHost?: boolean | undefined;
  // notifyForEventInvitations?: boolean | undefined;
  // notifyForMessagesFromHost?: boolean | undefined;
  // notifyForEventAnnouncements?: boolean | undefined;
  // muteNotifications?: boolean | undefined;
  // muteDuration?: string | undefined;
  // enableSmsNotifications?: boolean | undefined;
  // enableAppNotifications?: boolean | undefined;
  // enableEmailNotifications?: boolean | undefined;
}

export interface PushNotificationToken {
  notificationToken: string;
  deviceId: string;
}

export interface GetPushNotificationTokensRequest {
  userId: string;
}

export interface GetPushNotificationTokensResponse {
  status: number;
  error?: Error | undefined;
  data: PushNotificationToken[];
}

export interface SavePushNotificationTokenRequest {
  token: string;
  userId: string;
  deviceId: string;
}

export interface DeletePushNotificationTokenRequest {
  userId: string;
  deviceId: string;
}

export const AUTH_PACKAGE_NAME = "auth";