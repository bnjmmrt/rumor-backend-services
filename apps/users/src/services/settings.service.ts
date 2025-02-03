import database from 'src/database';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { GetPushNotificationTokensRequest, GetPushNotificationTokensResponse, ProfileNotificationSetting, UserSettingResponse } from 'rumor-utils/shared/users/grpc/auth/settings.pb';
import { UserSettings } from 'rumor-utils/shared/users/entities/user-settings.entity';
import { responses } from '../common/responses.common';
import { isWithinTimeRange } from '../utils/auth.util';
import { DeleteNotificationTokenRequestDto, UpdateNotificationSettingRequestDto } from 'rumor-utils/shared/users/dtos/settings.dto';
import { UserDataSimple } from 'rumor-utils/shared/users/grpc/auth/auth.pb';
import { SaveNotificationTokenRequestDto } from 'rumor-utils/shared/users/dtos/settings.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { PushNotificationToken } from 'rumor-utils/shared/users/entities/push-notification-token.entity';


export class SettingsService {
  static dbConnection = database;
  
  public static async getNotificationSettings(payload: IdRequestDto): Promise<UserSettingResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.id });
      if (!user) return responses.notFound('User not found!');

      const notificationSettings = await this.dbConnection.getRepository(UserSettings).findOne({
        where: { user: { id: payload.id } },
      });

      if (!notificationSettings) {
        const notificationSettingsSave = await this.createNotificationSettingsForUser(user);
        return this.buildUserResponse(user, { ...notificationSettingsSave });
      }

      const { muteNotifications, muteDuration, currentTimeSetDuration } = notificationSettings;
      const validateSetDurationTime = isWithinTimeRange(currentTimeSetDuration, muteDuration);

      let updatedMuteNotification = muteNotifications;
      let updatedSetDurationTime = muteDuration;

      if (muteNotifications && !validateSetDurationTime.validate) {
        updatedMuteNotification = false;
        updatedSetDurationTime = null;
        await this.updateNotificationSettings({
          ...notificationSettings,
          userId: payload.id,
          muteNotifications: updatedMuteNotification,
          muteDuration: null,
        });
      }

      const NotificationsSettings: ProfileNotificationSetting = {
        ...notificationSettings,
        muteNotifications: updatedMuteNotification,
        muteDuration: updatedSetDurationTime,
        timeLeftMuteNotification: validateSetDurationTime.timeLeft,
      };

      return this.buildUserResponse(user, NotificationsSettings);
    } catch (err) {
      return responses.badRequest('Error at get notification settings.');
    }
  }

  public static async createNotificationSettings(payload: IdRequestDto): Promise<UserSettingResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.id });
      if (!user) return responses.notFound('User not found!');
      const notificationSettings = await this.createNotificationSettingsForUser(user);
      return this.buildUserResponse(user, notificationSettings);
    } catch (err) {
      return responses.badRequest('Error at create notification settings.');
    }
  }

  public static async updateNotificationSettings(payload: UpdateNotificationSettingRequestDto): Promise<UserSettingResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');

      if (payload.muteNotifications && !payload.muteDuration) {
        return responses.notFound('Set Duration Time is required');
      }

      let notificationSettings = await this.dbConnection.getRepository(UserSettings).findOne({
        where: { user: { id: payload.userId } },
      });

      if (!notificationSettings) {
        notificationSettings = this.dbConnection.getRepository(UserSettings).create({ user: { id: payload.userId } });
        notificationSettings = await this.dbConnection.getRepository(UserSettings).save(notificationSettings);
        notificationSettings = await this.dbConnection.getRepository(UserSettings).findOne({
          where: { user: { id: payload.userId } },
        });
      }

      const updatedSettings = await this.dbConnection.getRepository(UserSettings).save({
        ...notificationSettings,
        ...payload,
        currentTimeSetDuration: payload.muteNotifications ? new Date() : null,
        setDurationTime: payload.muteNotifications ? payload.muteDuration : null,
      });

      const validateSetDurationTime = isWithinTimeRange(updatedSettings.currentTimeSetDuration, updatedSettings.setDurationTime);

      const NotificationsSettings: ProfileNotificationSetting = {
        ...updatedSettings,
        timeLeftMuteNotification: validateSetDurationTime.timeLeft,
      };

      return this.buildUserResponse(user, NotificationsSettings);
    } catch (err) {
      return responses.badRequest('Error at update notification settings.');
    }
  }

  public static async savePushNotificationToken(payload: SaveNotificationTokenRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');

      let pushNotificationToken = await this.dbConnection.getRepository(PushNotificationToken).findOne({
        where: { deviceId: payload.deviceId, user: { id: payload.userId } },
      });

      // if push notification exists for the user for the same device, overwrite the token, otherwise create a new entry
      if (pushNotificationToken) {
        pushNotificationToken.notificationToken = payload.token;
        await pushNotificationToken.save();
        return responses.ok;
      }

      pushNotificationToken = new PushNotificationToken();
      pushNotificationToken.deviceId = payload.deviceId;
      pushNotificationToken.notificationToken = payload.token;
      pushNotificationToken.user = user;

      await pushNotificationToken.save();

      return responses.ok;
    } catch (err) {
      return responses.badRequest(`error occurred while saving notification token: ${err}`);
    }
  }

  public static async deletePushNotificationToken(payload: DeleteNotificationTokenRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');

      const pushNotificationToken = await this.dbConnection.getRepository(PushNotificationToken).findOne({
        where: { deviceId: payload.deviceId, user: { id: payload.userId } },
      });

      if (!pushNotificationToken) {
        return responses.badRequest('push notification token for device does not exists');
      }
      await pushNotificationToken.remove();

      return responses.ok;
    } catch (err) {
      return responses.badRequest(`error occurred while saving notification token: ${err}`);
    }
  }

  public static async getPushNotificationTokens(payload: GetPushNotificationTokensRequest): Promise<GetPushNotificationTokensResponse> {
    const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!user) return responses.notFound('User not found!');

    const pushNotificationTokens = await this.dbConnection.getRepository(PushNotificationToken).find({
      where: { user: { id: payload.userId } },
    });

    return responses.data(pushNotificationTokens);
  }

  public static async createNotificationSettingsForUser(user: User): Promise<ProfileNotificationSetting> {
    const notificationSettings = this.dbConnection.getRepository(UserSettings).create({ user });
    await this.dbConnection.getRepository(UserSettings).save(notificationSettings);
    const validateSetDurationTime = isWithinTimeRange(null, null);
    return {
      ...notificationSettings,
      timeLeftMuteNotification: validateSetDurationTime.timeLeft,
    };
  }

  public static buildUserResponse(user: User, notificationSettings: ProfileNotificationSetting): UserSettingResponse {
    const UserData: UserDataSimple = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: `${user.firstName || ''} ${user.lastName || ''}`,
    };
    return responses.data({ userData: UserData, notificationsSettings: notificationSettings });
  }
}
