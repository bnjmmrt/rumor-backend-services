// import { Controller, Inject } from '@nestjs/common';
// import {// GrpcMethod } from '@nestjs/microservices';
import {
  GetGoogleAuthUrlResponse,
  GetLinkedInAuthDataResponse,
  GetLinkedInAuthUrlResponse,
  GetMetaAuthDataResponse,
  GetMetaAuthUrlResponse,
  GetTiktokAuthDataResponse,
  GetTiktokAuthUrlResponse,
  GetXAuthDataResponse,
  GetXAuthUrlResponse,
  GoogleAuthCallbackResponse,
  LinkedInAuthCallbackResponse,
  MetaAuthCallbackResponse,
  SOCIAL_SERVICE_NAME,
  SetMetaAuthTokenResponse,
  TiktokAuthCallbackResponse,
  GetSnapchatAuthUrlResponse,
  SnapchatAuthCallbackResponse,
  GetSnapchatAuthDataResponse,
  XAuthCallbackResponse,
  InstagramUserResponse,
  SocialMediaStatsResponse,
} from '../grpc/auth/social.pb';
import {
  UserIdAuthRequestDto,
  GetMetaAuthUrlRequestDto,
  GetSnapchatAuthDataRequestDto,
  GoogleAuthCallbackRequestDto,
  LinkedInAuthCallbackRequestDto,
  MetaAuthCallbackRequestDto,
  SetMetaAuthTokenRequestDto,
  SnapchatAuthCallbackRequestDto,
  TiktokAuthCallbackRequestDto,
  InstagramUserRequestDto,
  LinkedInUserIdAuthRequestDto,
} from '../dtos/social.dto';
import { SocialService } from '../services/social.service';
import { XAuthCallbackRequestDto } from '../dtos/social.dto';

// @Controller('social')
export class SocialController {
  // @Inject(SocialService)
  // private readonly service: SocialService;

  // Facebook
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetFacebookAuthUrl')
  private getFacebookAuthUrl(payload: GetMetaAuthUrlRequestDto): Promise<GetMetaAuthUrlResponse> {
    return SocialService.getFacebookAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'FacebookAuthCallback')
  private facebookAuthCallback(payload: MetaAuthCallbackRequestDto): Promise<MetaAuthCallbackResponse> {
    return SocialService.facebookAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SetFacebookAuthToken')
  private setFacebookAuthToken(payload: SetMetaAuthTokenRequestDto): Promise<SetMetaAuthTokenResponse> {
    return SocialService.setFacebookAuthToken(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetFacebookAuthData')
  private getFacebookAuthData(payload: UserIdAuthRequestDto): Promise<GetMetaAuthDataResponse> {
    return SocialService.getFacebookAuthData(payload);
  }

  // Instagram

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SetInstagramUser')
  private setInstagramUser(payload: InstagramUserRequestDto): Promise<InstagramUserResponse> {
    return SocialService.setInstagramUser(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetInstagramUser')
  private getInstagramUser(payload: InstagramUserRequestDto): Promise<InstagramUserResponse> {
    return SocialService.getInstagramUser(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetInstagramAuthUrl')
  private getInstagramAuthUrl(payload: GetMetaAuthUrlRequestDto): Promise<GetMetaAuthUrlResponse> {
    return SocialService.getInstagramAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'InstagramAuthCallback')
  private instagramAuthCallback(payload: MetaAuthCallbackRequestDto): Promise<MetaAuthCallbackResponse> {
    return SocialService.instagramAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'InstagramRedirect')
  private instagramRedirect(payload: MetaAuthCallbackRequestDto): Promise<MetaAuthCallbackResponse> {
    return SocialService.instagramRedirect(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SetInstagramAuthToken')
  private setMetaAuthToken(payload: SetMetaAuthTokenRequestDto): Promise<SetMetaAuthTokenResponse> {
    return SocialService.setInstagramAuthToken(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetInstagramAuthData')
  private getInstagramAuthData(payload: UserIdAuthRequestDto): Promise<GetMetaAuthDataResponse> {
    return SocialService.getInstagramAuthData(payload);
  }

  // Google
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetGoogleAuthUrl')
  private getGoogleAuthUrl(payload: UserIdAuthRequestDto): Promise<GetGoogleAuthUrlResponse> {
    return SocialService.getGoogleAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GoogleAuthCallback')
  private googleAuthCallback(payload: GoogleAuthCallbackRequestDto): Promise<GoogleAuthCallbackResponse> {
    return SocialService.googleAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetGoogleAuthData')
  private getGoogleAuthData(payload: UserIdAuthRequestDto): Promise<GetMetaAuthDataResponse> {
    return SocialService.getGoogleAuthData(payload);
  }

  // LinkedIn
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetLinkedInAuthUrl')
  public async getLinkedInAuthUrl(payload: LinkedInUserIdAuthRequestDto): Promise<GetLinkedInAuthUrlResponse> {
    return SocialService.getLinkedInAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'LinkedInAuthCallback')
  public async linkedInAuthCallback(payload: LinkedInAuthCallbackRequestDto): Promise<LinkedInAuthCallbackResponse> {
    return SocialService.linkedInAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetLinkedInAuthData')
  public async getLinkedInAuthData(payload: UserIdAuthRequestDto): Promise<GetLinkedInAuthDataResponse> {
    return SocialService.getLinkedInAuthData(payload);
  }

  // TikTok
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetTiktokAuthUrl')
  private getTiktokAuthUrl(payload: UserIdAuthRequestDto): Promise<GetTiktokAuthUrlResponse> {
    return SocialService.getTiktokAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'TiktokAuthCallback')
  private tiktokAuthCallback(payload: TiktokAuthCallbackRequestDto): Promise<TiktokAuthCallbackResponse> {
    return SocialService.tiktokAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetTiktokAuthData')
  private getTiktokAuthData(payload: UserIdAuthRequestDto): Promise<GetTiktokAuthDataResponse> {
    return SocialService.getTiktokAuthData(payload);
  }

  // Snapchat
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetSnapchatAuthUrl')
  public async getSnapchatAuthUrl(payload: UserIdAuthRequestDto): Promise<GetSnapchatAuthUrlResponse> {
    return SocialService.getSnapchatAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SnapchatAuthCallback')
  public async snapchatAuthCallback(payload: SnapchatAuthCallbackRequestDto): Promise<SnapchatAuthCallbackResponse> {
    return SocialService.snapchatAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetSnapchatAuthData')
  public async getSnapchatAuthData(payload: GetSnapchatAuthDataRequestDto): Promise<GetSnapchatAuthDataResponse> {
    return SocialService.getSnapchatAuthData(payload);
  }

  // X
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetXAuthUrl')
  private getXAuthUrl(payload: UserIdAuthRequestDto): Promise<GetXAuthUrlResponse> {
    return SocialService.getXAuthUrl(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'XAuthCallback')
  private xAuthCallback(payload: XAuthCallbackRequestDto): Promise<XAuthCallbackResponse> {
    return SocialService.xAuthCallback(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetXAuthData')
  private getXAuthData(payload: UserIdAuthRequestDto): Promise<GetXAuthDataResponse> {
    return SocialService.getXAuthData(payload);
  }

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SyncSocialStats')
  private syncSocialStats(payload: UserIdAuthRequestDto): Promise<SocialMediaStatsResponse> {
    return SocialService.syncSocialStats(payload);
  }
}
