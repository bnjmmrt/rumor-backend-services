import { SettingsService } from '../services/settings.service';
import {
  DeleteNotificationTokenRequestDto,
  GetPushNotificationTokensRequestDto,
  UpdateNotificationSettingRequestDto,
  SaveNotificationTokenRequestDto,
} from 'rumor-utils/shared/users/dtos/settings.dto';
import { GetPushNotificationTokensResponse, UserSettingResponse } from 'rumor-utils/shared/users/grpc/auth/settings.pb';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import asyncWrapper from '../server/helpers/asyncWrapper';

import {
  GetResponse,
  UpdateResponse,
} from "rumor-utils/success";
export class SettingsController {

  public static getNotificationSettings = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId  = req.params.id;
      const response: UserSettingResponse = await SettingsService.getNotificationSettings(userId);
      const successResponse = new GetResponse(
        response
      );
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static updateNotificationSettings = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateNotificationSettingRequestDto = {
          userId: req.params.id,
          enableSmsNotifications: req.body.enableSmsNotifications,
          enableAppNotifications: req.body.enableAppNotifications,
          enableEmailNotifications: req.body.enableEmailNotifications
      } 
      const response: UserSettingResponse = await SettingsService.updateNotificationSettings(payload);
      const successResponse = new UpdateResponse(
        response
      );
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getPushNotificationTokens = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetPushNotificationTokensRequestDto = req.body;
      const response: GetPushNotificationTokensResponse = await SettingsService.getPushNotificationTokens(payload);
      res.json(response);
    }
  );

  public static savePushNotificationToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SaveNotificationTokenRequestDto = req.body;
      const response: GenericResponse = await SettingsService.savePushNotificationToken(payload);
      res.json(response);
    }
  );

  public static deletePushNotificationToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: DeleteNotificationTokenRequestDto = req.body;
      const response: GenericResponse = await SettingsService.deletePushNotificationToken(payload);
      res.json(response);
    }
  );
}
