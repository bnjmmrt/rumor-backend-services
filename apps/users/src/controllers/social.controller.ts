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
} from 'rumor-utils/shared/users/grpc/auth/social.pb';
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
} from 'rumor-utils/shared/users/dtos/social.dto';
import { SocialService } from '../services/social.service';
import { XAuthCallbackRequestDto } from 'rumor-utils/shared/users/dtos/social.dto';
import asyncWrapper from 'src/server/helpers/asyncWrapper';

// @Controller('social')
export class SocialController {
  // @Inject(SocialService)
  // private readonly service: SocialService;

  // Facebook
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetFacebookAuthUrl')
  public static getFacebookAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetMetaAuthUrlRequestDto = req.body;
      const response: GetMetaAuthUrlResponse = await SocialService.getFacebookAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'FacebookAuthCallback')
  public static facebookAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MetaAuthCallbackRequestDto = req.body;
      const response: MetaAuthCallbackResponse = await SocialService.facebookAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SetFacebookAuthToken')
  public static setFacebookAuthToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetMetaAuthTokenRequestDto = req.body;
      const response: SetMetaAuthTokenResponse = await SocialService.setFacebookAuthToken(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetFacebookAuthData')
  public static getFacebookAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetMetaAuthDataResponse = await SocialService.getFacebookAuthData(payload);
      res.json(response);
    }
  );

  // Instagram
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SetInstagramUser')
  public static setInstagramUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InstagramUserRequestDto = req.body;
      const response: InstagramUserResponse = await SocialService.setInstagramUser(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetInstagramUser')
  public static getInstagramUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InstagramUserRequestDto = req.body;
      const response: InstagramUserResponse = await SocialService.getInstagramUser(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetInstagramAuthUrl')
  public static getInstagramAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetMetaAuthUrlRequestDto = req.body;
      const response: GetMetaAuthUrlResponse = await SocialService.getInstagramAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'InstagramAuthCallback')
  public static instagramAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MetaAuthCallbackRequestDto = req.body;
      const response: MetaAuthCallbackResponse = await SocialService.instagramAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'InstagramRedirect')
  public static instagramRedirect = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MetaAuthCallbackRequestDto = req.body;
      const response: MetaAuthCallbackResponse = await SocialService.instagramRedirect(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SetInstagramAuthToken')
  public static setMetaAuthToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetMetaAuthTokenRequestDto = req.body;
      const response: SetMetaAuthTokenResponse = await SocialService.setInstagramAuthToken(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetInstagramAuthData')
  public static getInstagramAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetMetaAuthDataResponse = await SocialService.getInstagramAuthData(payload);
      res.json(response);
    }
  );

  // Google
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetGoogleAuthUrl')
  public static getGoogleAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetGoogleAuthUrlResponse = await SocialService.getGoogleAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GoogleAuthCallback')
  public static googleAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GoogleAuthCallbackRequestDto = req.body;
      const response: GoogleAuthCallbackResponse = await SocialService.googleAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetGoogleAuthData')
  public static getGoogleAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetMetaAuthDataResponse = await SocialService.getGoogleAuthData(payload);
      res.json(response);
    }
  );

  // LinkedIn
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetLinkedInAuthUrl')
  public static getLinkedInAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LinkedInUserIdAuthRequestDto = req.body;
      const response: GetLinkedInAuthUrlResponse = await SocialService.getLinkedInAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'LinkedInAuthCallback')
  public static linkedInAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LinkedInAuthCallbackRequestDto = req.body;
      const response: LinkedInAuthCallbackResponse = await SocialService.linkedInAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetLinkedInAuthData')
  public static getLinkedInAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetLinkedInAuthDataResponse = await SocialService.getLinkedInAuthData(payload);
      res.json(response);
    }
  );

  // TikTok
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetTiktokAuthUrl')
  public static getTiktokAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetTiktokAuthUrlResponse = await SocialService.getTiktokAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'TiktokAuthCallback')
  public static tiktokAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: TiktokAuthCallbackRequestDto = req.body;
      const response: TiktokAuthCallbackResponse = await SocialService.tiktokAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetTiktokAuthData')
  public static getTiktokAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetTiktokAuthDataResponse = await SocialService.getTiktokAuthData(payload);
      res.json(response);
    }
  );

  // Snapchat
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetSnapchatAuthUrl')
  public static getSnapchatAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetSnapchatAuthUrlResponse = await SocialService.getSnapchatAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SnapchatAuthCallback')
  public static snapchatAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SnapchatAuthCallbackRequestDto = req.body;
      const response: SnapchatAuthCallbackResponse = await SocialService.snapchatAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetSnapchatAuthData')
  public static getSnapchatAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetSnapchatAuthDataRequestDto = req.body;
      const response: GetSnapchatAuthDataResponse = await SocialService.getSnapchatAuthData(payload);
      res.json(response);
    }
  );

  // X
  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetXAuthUrl')
  public static getXAuthUrl = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetXAuthUrlResponse = await SocialService.getXAuthUrl(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'XAuthCallback')
  public static xAuthCallback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: XAuthCallbackRequestDto = req.body;
      const response: XAuthCallbackResponse = await SocialService.xAuthCallback(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'GetXAuthData')
  public static getXAuthData = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: GetXAuthDataResponse = await SocialService.getXAuthData(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(SOCIAL_SERVICE_NAME, 'SyncSocialStats')
  public static syncSocialStats = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserIdAuthRequestDto = req.body;
      const response: SocialMediaStatsResponse = await SocialService.syncSocialStats(payload);
      res.json(response);
    }
  );
}


