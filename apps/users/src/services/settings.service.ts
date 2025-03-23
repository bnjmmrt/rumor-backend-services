import connectionManager from "../database";
import { User } from "rumor-utils/shared/users/entities/user.entity";
import {
  GetPushNotificationTokensRequest,
  GetPushNotificationTokensResponse,
  ProfileNotificationSetting,
  UserSettingResponse,
} from "rumor-utils/shared/users/grpc/auth/settings.pb";
import { UserSettings } from "rumor-utils/shared/users/entities/user-settings.entity";
import { responses } from "../common/responses.common";
import {
  DeleteNotificationTokenRequestDto,
} from "rumor-utils/shared/users/dtos/settings.dto";
import { UserDataSimple } from "rumor-utils/shared/users/grpc/auth/auth.pb";
import { SaveNotificationTokenRequestDto } from "rumor-utils/shared/users/dtos/settings.dto";
import { GenericResponse } from "rumor-utils/shared/users/grpc/auth/shared.pb";
import { PushNotificationToken } from "rumor-utils/shared/users/entities/push-notification-token.entity";
import { NotFoundError } from 'rumor-utils/errors'
import { IsNull } from "typeorm";

export class SettingsService {
  static dbConnection = connectionManager;

  public static async getNotificationSettings(id: string): Promise<any> {
    if(!id) throw new NotFoundError("User not found!");
    const user = await this.dbConnection.getRepository(User).findOne({where: {id, deletedAt: IsNull()}});
    if (!user) throw new NotFoundError("User not found!");

    let notificationSettings = await this.dbConnection
      .getRepository(UserSettings)
      .findOne({
        where: { user: { id } },
        select: [
          "id",
          "enableAppNotifications",
          "enableEmailNotifications",
          "enableSmsNotifications",
        ],
      });

    if (!notificationSettings) {
      notificationSettings = this.dbConnection
        .getRepository(UserSettings)
        .create({
          user,
          enableAppNotifications: true,
          enableEmailNotifications: true,
          enableSmsNotifications: true,
        });
      await this.dbConnection
        .getRepository(UserSettings)
        .save(notificationSettings);
    }

    return notificationSettings;
  }

  public static async updateNotificationSettings(payload: any): Promise<any> {
    if(!payload.userId) throw new NotFoundError("User not found!");
    
    const user = await this.dbConnection
      .getRepository(User)
      .findOneBy({ id: payload.userId, deletedAt: IsNull() });
    if (!user) return responses.notFound("User not found!");

    let notificationSettings = await this.dbConnection
      .getRepository(UserSettings)
      .findOne({
        where: { user: { id: payload.userId } },
      });

    if (!notificationSettings) {
      notificationSettings = this.dbConnection
        .getRepository(UserSettings)
        .create({
          user,
          enableAppNotifications: payload.enableAppNotifications,
          enableEmailNotifications: payload.enableEmailNotifications,
          enableSmsNotifications: payload.enableSmsNotifications,
        });
    } else {
      Object.assign(notificationSettings, payload);
    }

    return await this.dbConnection
      .getRepository(UserSettings)
      .save(notificationSettings);
  }

  public static async savePushNotificationToken(
    payload: SaveNotificationTokenRequestDto
  ): Promise<GenericResponse> {
    if (!payload.deviceId || !payload.token) {
      return;
    }

    const user = await this.dbConnection
      .getRepository(User)
      .findOneBy({ id: payload.userId });
    if (!user) return responses.notFound("User not found!");

    let pushNotificationToken = await this.dbConnection
      .getRepository(PushNotificationToken)
      .findOne({
        where: { deviceId: payload.deviceId, user: { id: payload.userId } },
      });

    // if push notification exists for the user for the same device, overwrite the token, otherwise create a new entry
    if (pushNotificationToken) {
      pushNotificationToken.notificationToken = payload.token;
      await pushNotificationToken.save();
      return;
    }

    pushNotificationToken = new PushNotificationToken();
    pushNotificationToken.deviceId = payload.deviceId;
    pushNotificationToken.notificationToken = payload.token;
    pushNotificationToken.user = user;

    await pushNotificationToken.save();
    return;
  }

  public static async deletePushNotificationToken(
    payload: DeleteNotificationTokenRequestDto
  ): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection
        .getRepository(User)
        .findOneBy({ id: payload.userId });
      if (!user) return responses.notFound("User not found!");

      const pushNotificationToken = await this.dbConnection
        .getRepository(PushNotificationToken)
        .findOne({
          where: { deviceId: payload.deviceId, user: { id: payload.userId } },
        });

      if (!pushNotificationToken) {
        return responses.badRequest(
          "push notification token for device does not exists"
        );
      }
      await pushNotificationToken.remove();

      return responses.ok;
    } catch (err) {
      return responses.badRequest(
        `error occurred while saving notification token: ${err}`
      );
    }
  }

  public static async getPushNotificationTokens(
    payload: GetPushNotificationTokensRequest
  ): Promise<GetPushNotificationTokensResponse> {
    const user = await this.dbConnection
      .getRepository(User)
      .findOneBy({ id: payload.userId });
    if (!user) return responses.notFound("User not found!");

    const pushNotificationTokens = await this.dbConnection
      .getRepository(PushNotificationToken)
      .find({
        where: { user: { id: payload.userId } },
      });

    return responses.data(pushNotificationTokens);
  }

  public static buildUserResponse(
    user: User,
    notificationSettings: ProfileNotificationSetting
  ): UserSettingResponse {
    const UserData: UserDataSimple = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: `${user.firstName || ""} ${user.lastName || ""}`,
    };
    return responses.data({
      userData: UserData,
      notificationsSettings: notificationSettings,
    });
  }
}
