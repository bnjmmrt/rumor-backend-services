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

// @Controller('settings')
export class SettingsController {
  // @Inject(SettingsService)
  //private readonly service: SettingsService;
  // Profile Notifications Settings

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'GetUserSettings')
  public async getNotificationSettings(payload: IdRequestDto): Promise<UserSettingResponse> {
    return SettingsService.getNotificationSettings(payload);
  }

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'UpdateNotificationSettings')
  public async updateNotificationSettings(payload: UpdateNotificationSettingRequestDto): Promise<UserSettingResponse> {
    return SettingsService.updateNotificationSettings(payload);
  }

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'GetPushNotificationTokens')
  private getPushNotificationTokens(payload: GetPushNotificationTokensRequestDto): Promise<GetPushNotificationTokensResponse> {
    return SettingsService.getPushNotificationTokens(payload);
  }

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'SavePushNotificationToken')
  private savePushNotificationToken(payload: SaveNotificationTokenRequestDto): Promise<GenericResponse> {
    return SettingsService.savePushNotificationToken(payload);
  }

  //@GrpcMethod(SETTINGS_SERVICE_NAME, 'DeletePushNotificationToken')
  private deletePushNotificationToken(payload: DeleteNotificationTokenRequestDto): Promise<GenericResponse> {
    return SettingsService.deletePushNotificationToken(payload);
  }
}
