import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import { SettingsService } from '../services/settings.service';
import {
  DeleteNotificationTokenRequestDto,
  GetPushNotificationTokensRequestDto,
  UpdateNotificationSettingRequestDto,
  SaveNotificationTokenRequestDto,
} from 'rumor-utils/shared/users/dtos/settings.dto';
import { GetPushNotificationTokensResponse, SETTINGS_SERVICE_NAME, UserSettingResponse } from 'rumor-utils/shared/users/grpc/auth/settings.pb';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import asyncWrapper from 'src/server/helpers/asyncWrapper';

// @Controller('settings')
export class SettingsController {
  // @Inject(SettingsService)
  //private readonly service: SettingsService;
  // Profile Notifications Settings

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'GetUserSettings')
  public static getNotificationSettings = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: UserSettingResponse = await SettingsService.getNotificationSettings(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'UpdateNotificationSettings')
  public static updateNotificationSettings = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateNotificationSettingRequestDto = req.body;
      const response: UserSettingResponse = await SettingsService.updateNotificationSettings(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'GetPushNotificationTokens')
  public static getPushNotificationTokens = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetPushNotificationTokensRequestDto = req.body;
      const response: GetPushNotificationTokensResponse = await SettingsService.getPushNotificationTokens(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'SavePushNotificationToken')
  public static savePushNotificationToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SaveNotificationTokenRequestDto = req.body;
      const response: GenericResponse = await SettingsService.savePushNotificationToken(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'DeletePushNotificationToken')
  public static deletePushNotificationToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: DeleteNotificationTokenRequestDto = req.body;
      const response: GenericResponse = await SettingsService.deletePushNotificationToken(payload);
      res.json(response);
    }
  );
}
