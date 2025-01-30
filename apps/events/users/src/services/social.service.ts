import { IsNull, Repository } from 'typeorm';
import { responses } from '../common/responses.common';
import database from '../database';
import config from 'src/config';

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
  XAuthCallbackRequestDto,
  InstagramUserRequestDto,
  LinkedInUserIdAuthRequestDto,
} from '../dtos/social.dto';

import {
  GetGoogleAuthUrlResponse,
  GetLinkedInAuthDataResponse,
  GetLinkedInAuthUrlResponse,
  GetMetaAuthDataResponse,
  GetMetaAuthUrlResponse,
  GetSnapchatAuthDataResponse,
  GetSnapchatAuthUrlResponse,
  GetTiktokAuthDataResponse,
  GetTiktokAuthUrlResponse,
  GetXAuthDataResponse,
  GetXAuthUrlResponse,
  GoogleAuthCallbackResponse,
  InstagramUserResponse,
  LinkedInAuthCallbackResponse,
  MetaAuthCallbackResponse,
  SetMetaAuthTokenResponse,
  SnapchatAuthCallbackResponse,
  SocialMediaStatsResponse,
  TiktokAuthCallbackResponse,
  XAuthCallbackResponse,
} from '../grpc/auth/social.pb';

import {
  FacebookTokenResponse,
  InstagAPIUserProfileResponse,
  InstagramTokenResponse,
  LinkedInTokenResponse,
  LinkedInUserInfoResponse,
} from '../interfaces/social.interface';

import { SocialProviderType } from '../interfaces/shared.interface';
import axios, { AxiosError } from 'axios';
import { entityToProviderType } from '../mappers/social.mapper';
import { ProviderAuth, ProviderType } from '../grpc/auth/shared.pb';
import * as querystring from 'querystring';
import { generateCodeChallenge, generateCodeVerifier } from '../utils/auth.util';
import { User } from '../database/entities/user.entity';
import { XAuthSession } from '../database/entities/xauthsession.entity';
import { SocialProvider } from '../database/entities/social-provider.entity';
import { SocialStats } from '../database/entities/social-stats.entity';


export class SocialService {

  static dbConnection = database;

  static async getFacebookAuthUrl(payload: GetMetaAuthUrlRequestDto): Promise<GetMetaAuthUrlResponse> {
    try {
      let userId: string | null = null;
      if (payload.userId && payload.userId != '') {
        const user: User = await this.dbConnection.getRepository(User).findOne({
          where: {
            id: payload.userId,
            deletedAt: IsNull(),
          },
        });

        if (!user) {
          return responses.notFound('Verify user exists');
        }
        userId = user.id;
      }

      const [REDIRECT_URI, CLIENT_ID, SCOPE] = [
        encodeURIComponent(this.getFacebookRedirect(payload.platform)),
       config.get('FACEBOOK_APP_ID'),
       config.get('FACEBOOK_SCOPE'),
      ];

      let authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${CLIENT_ID}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`;
      if (userId) {
        authUrl += `&state=${userId}`;
      }

      return responses.data(authUrl);
    } catch (err) {
      return responses.badRequest('Unable to call forgot password, please try again later');
    }
  }

  // Facebook
  public static async facebookAuthCallback(payload: MetaAuthCallbackRequestDto): Promise<MetaAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.FACEBOOK,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.FACEBOOK,
        });
      }

      const redirect = encodeURIComponent(config.get('FACEBOOK_REDIRECT_URI'));
      const accessTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${config.get('FACEBOOK_APP_ID')}&state=${payload.state}&client_secret=${config.get('FACEBOOK_APP_SECRET')}&code=${payload.code}&redirect_uri=${redirect}`;
      let tokenResponse = await axios.get(accessTokenUrl);

      let tokenStructure: FacebookTokenResponse = tokenResponse.data;
      socialProvider.token = tokenStructure.access_token;

      const LongLivedTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${config.get('FACEBOOK_APP_ID')}&client_secret=${config.get('FACEBOOK_APP_SECRET')}&grant_type=fb_exchange_token&fb_exchange_token=${tokenStructure.access_token}`;
      tokenResponse = await axios.get(LongLivedTokenUrl);
      tokenStructure = tokenResponse.data;

      socialProvider.longLivedToken = tokenStructure.access_token;
      socialProvider.expirationToken = tokenStructure.expires_in;

      socialProvider = await socialProvider.save();

      const profileUserGetUrl = `https://graph.facebook.com/me?access_token=${tokenStructure.access_token}&fields=id,name,email,picture`;
      const profileResponse = await axios.get(profileUserGetUrl);

      socialProvider.email = profileResponse?.data?.email;
      socialProvider.name = profileResponse?.data?.name;
      socialProvider.providerId = profileResponse?.data?.id;
      socialProvider.profilePicture = profileResponse?.data?.picture?.data?.url;

      socialProvider = await this.dbConnection.getRepository(SocialProvider).save(socialProvider);
      return responses.data(socialProvider.longLivedToken);
    } catch (err) {
      return responses.badRequest('An error ocurs on  SSO facebook at generate token');
    }
  }

  public static async setFacebookAuthToken(payload: SetMetaAuthTokenRequestDto): Promise<SetMetaAuthTokenResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.FACEBOOK,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = await this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.FACEBOOK,
        });
      }

      const LongLivedTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${config.get('FACEBOOK_APP_ID')}&client_secret=${config.get('FACEBOOK_APP_SECRET')}&grant_type=fb_exchange_token&fb_exchange_token=${payload.providerToken}`;
      const tokenResponse = await axios.get(LongLivedTokenUrl);
      const tokenStructure = tokenResponse.data;

      socialProvider.longLivedToken = tokenStructure.access_token;
      socialProvider.expirationToken = tokenStructure.expires_in;
      socialProvider.token = payload.providerToken;

      socialProvider = await socialProvider.save();

      const profileUserGetUrl = `https://graph.facebook.com/me?access_token=${tokenStructure.access_token}&fields=id,name,email,picture`;
      const profileResponse = await axios.get(profileUserGetUrl);

      socialProvider.email = profileResponse?.data?.email;
      socialProvider.name = profileResponse?.data?.name;
      socialProvider.providerId = profileResponse?.data?.id;
      socialProvider.profilePicture = profileResponse?.data?.picture?.data?.url;

      socialProvider = await socialProvider.save();
      const providerType = entityToProviderType[socialProvider.type];
      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
      };
      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to set token');
    }
  }

  public static async getFacebookAuthData(payload: UserIdAuthRequestDto): Promise<GetMetaAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists ans is active');
      }

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.FACEBOOK,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        return responses.notFound('Social provider info not found');
      }

      const providerType = entityToProviderType[socialProvider.type];
      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
      };
      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('Han error occurs when tries to get facebook data');
    }
  }

  public static getFacebookRedirect(platform: 'ios' | 'android'): string {
    const redirectURI =
      platform === 'ios' ?config.get('FACEBOOK_IOS_REDIRECT_URI') :config.get('FACEBOOK_ANDROID_REDIRECT_URI');
    return redirectURI;
  }

  public static async getFacebookShortLivedToken(code: string, platform: 'ios' | 'android'): Promise<FacebookTokenResponse> {
    try {
      const [FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, REDIRECT_URI] = [
       config.get('FACEBOOK_APP_ID'),
       config.get('FACEBOOK_APP_SECRET'),
        encodeURIComponent(SocialService.getFacebookRedirect(platform)),
      ];

      const accessTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`;
      const tokenResponse = await axios.get(accessTokenUrl);
      return tokenResponse.data as FacebookTokenResponse;
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  public static async getFacebookLongLivedToken(accessToken: string): Promise<FacebookTokenResponse> {
    try {
      const [FACEBOOK_APP_ID, FACEBOOK_APP_SECRET] = [config.get('FACEBOOK_APP_ID'),config.get('FACEBOOK_APP_SECRET')];

      const LongLivedTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&grant_type=fb_exchange_token&fb_exchange_token=${accessToken}`;
      const tokenResponse = await axios.get(LongLivedTokenUrl);
      const tokenStructure = tokenResponse.data;
      return tokenStructure as FacebookTokenResponse;
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  public static async getFacebookMeObject(accessToken: string) {
    try {
      const profileUserGetUrl = `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`;
      const profileResponse = await axios.get(profileUserGetUrl);
      if (!profileResponse) return null;
      return profileResponse.data;
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  /**
   * Table Name Prefix:
   *    SP: Social Provider
   * Logic
   *    1. Fetch Short Lived AccessToken in exchanges with Authorization Code.
   *    2. Fetch Long Lived AccessToken in exchanges with Short Lived AccessToken.
   *    3. Fetch Facebook Me object.
   * @param userId
   * @param code
   * @param platform
   * @returns
   */
  public static async getFacebookData(userId: string, code: string, platform: 'ios' | 'android'): Promise<SocialProvider | null> {
    try {
      let socialProvider = this.dbConnection.getRepository(SocialProvider).create({
        type: SocialProviderType.FACEBOOK,
      });

      const shortLivedAccessToken: FacebookTokenResponse = await this.getFacebookShortLivedToken(code, platform);
      if (!shortLivedAccessToken) return null;

      socialProvider.token = shortLivedAccessToken.access_token;
      const longLivedAccessToken: FacebookTokenResponse = await this.getFacebookLongLivedToken(shortLivedAccessToken.access_token);
      socialProvider.longLivedToken = longLivedAccessToken.access_token;
      socialProvider.expirationToken = longLivedAccessToken.expires_in;
      socialProvider = await socialProvider.save();

      const meObject = await this.getFacebookMeObject(longLivedAccessToken.access_token);
      if (!meObject) {
        return null;
      }

      socialProvider.name = meObject.name;
      socialProvider.email = meObject.email;
      socialProvider.username = meObject.username;
      socialProvider.providerId = meObject.id;
      socialProvider.profilePicture = meObject.picture?.data?.url;
      socialProvider.user = { id: userId } as User;
      return await socialProvider.save();
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  // Instagram
  public static async getInstagramUser(payload: InstagramUserRequestDto): Promise<InstagramUserResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify that user already exists');

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });

      if (!socialProvider) return responses.notFound('Instagram provider not configured');

      return responses.data(socialProvider?.username);
    } catch (err) {
      return responses.badRequest('Unable to call forgot password, please try again later');
    }
  }

  public static async setInstagramUser(payload: InstagramUserRequestDto): Promise<InstagramUserResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify that user already exists');

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.INSTAGRAM,
        });
      }

      socialProvider.username = payload?.instagramUsername;
      socialProvider = await socialProvider.save();
      return responses.data(socialProvider?.username);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to set instagram token');
    }
  }

  public static async getInstagramAuthUrl(payload: GetMetaAuthUrlRequestDto): Promise<GetMetaAuthUrlResponse> {
    try {
      let userId: string | null = null;
      if (payload.userId && payload.userId != '') {
        const user: User = await this.dbConnection.getRepository(User).findOne({
          where: {
            id: payload.userId,
            deletedAt: IsNull(),
          },
        });

        if (!user) {
          return responses.notFound('Verify user exists');
        }
        userId = user.id;
      }

      const redirect =
        payload.platform === 'ios' ?config.get('INSTAGRAM_IOS_REDIRECT_URI') :config.get('INSTAGRAM_ANDROID_REDIRECT_URI');
      const APP_ID = encodeURIComponent(config.get('INSTAGRAM_APP_ID'));
      const scope =config.get('INSTAGRAM_SCOPE');
      let uri: string;
      if (userId) {
        uri = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${redirect}&scope=${scope}&response_type=code&state=${userId}`;
      } else {
        uri = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${redirect}&scope=${scope}&response_type=code`;
      }
      return responses.data(uri);
    } catch (err) {
      return responses.badRequest('Unable to call forgot password, please try again later');
    }
  }

  public static async instagramAuthCallback(payload: MetaAuthCallbackRequestDto): Promise<MetaAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });
      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.INSTAGRAM,
        });
      }
      const redirectURIs = {
        ios:config.get('INSTAGRAM_IOS_REDIRECT_URI'),
        android:config.get('INSTAGRAM_ANDROID_REDIRECT_URI'),
      };

      const redirect = redirectURIs[payload.platform];
      const client_id =config.get('INSTAGRAM_APP_ID');
      const client_secret =config.get('INSTAGRAM_APP_SECRET');

      const tokenResponse = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        querystring.stringify({
          client_id,
          client_secret,
          grant_type: 'authorization_code',
          redirect_uri: redirect,
          code: payload.code,
        }),
      );

      const tokenStructure: InstagramTokenResponse = tokenResponse.data;
      socialProvider.token = tokenStructure.access_token;

      const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${config.get('INSTAGRAM_APP_SECRET')}&access_token=${tokenStructure.access_token}`;
      const instagramTokenResponse = await axios.get(longLivedTokenUrl);
      const instagramTokenStructure = instagramTokenResponse.data;

      socialProvider.longLivedToken = instagramTokenStructure.access_token;
      socialProvider.expirationToken = instagramTokenStructure.expires_in;

      socialProvider = await socialProvider.save();

      const profileUserGetUrl = `https://graph.instagram.com/${tokenStructure.user_id}?fields=id,username,account_type,media_count&access_token=${instagramTokenStructure.access_token}`;
      const profileResponse = await axios.get(profileUserGetUrl);

      socialProvider.email = profileResponse?.data?.email;
      socialProvider.name = profileResponse?.data?.name;
      socialProvider.username = profileResponse?.data?.username;
      socialProvider.providerId = profileResponse?.data?.id;
      socialProvider.profilePicture = profileResponse?.data?.picture?.data?.url;
      socialProvider.mediaCount = profileResponse?.data?.media_count;
      socialProvider.accountType = profileResponse?.data?.account_type;

      socialProvider = await this.dbConnection.getRepository(SocialProvider).save(socialProvider);
      return responses.data(socialProvider.longLivedToken);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to get instagram data');
    }
  }

  public static async instagramRedirect(payload: MetaAuthCallbackRequestDto): Promise<MetaAuthCallbackResponse> {
    try {
      const tokenResponse = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        querystring.stringify({
          client_id:config.get('INSTAGRAM_APP_ID'),
          client_secret:config.get('INSTAGRAM_APP_SECRET'),
          grant_type: 'authorization_code',
          redirect_uri:config.get('INSTAGRAM_REDIRECT_URI'),
          code: payload.code,
        }),
      );

      const tokenStructure: InstagramTokenResponse = tokenResponse.data;
      const LongLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${config.get('INSTAGRAM_APP_SECRET')}&access_token=${tokenStructure.access_token}`;
      const instagramTokenResponse = await axios.get(LongLivedTokenUrl);
      const instagramTokenStructure = instagramTokenResponse.data;
      return responses.data(instagramTokenStructure.access_token);
    } catch (err) {
      return responses.badRequest('Unknown error occured, please try again');
    }
  }

  public static async setInstagramAuthToken(payload: SetMetaAuthTokenRequestDto): Promise<SetMetaAuthTokenResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.INSTAGRAM,
        });
      }

      const longLivedTokenUrl = `https://graph.instagram.com/access_token?client_id=${config.get('INSTAGRAM_APP_ID')}&client_secret=${config.get('INSTAGRAM_APP_SECRET')}&grant_type=ig_exchange_token&access_token=${payload.providerToken}`;

      const instagramTokenResponse = await axios.get(longLivedTokenUrl);
      const instrgramTokenStructure = instagramTokenResponse.data;

      socialProvider.longLivedToken = instrgramTokenStructure.access_token;
      socialProvider.expirationToken = instrgramTokenStructure.expires_in;

      socialProvider = await socialProvider.save();

      const profileUserGetUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${instrgramTokenStructure.access_token}`;
      const profileResponse = await axios.get(profileUserGetUrl);

      socialProvider.email = profileResponse?.data?.email;
      socialProvider.name = profileResponse?.data?.name;
      socialProvider.username = profileResponse?.data?.username;
      socialProvider.providerId = profileResponse?.data?.id;
      socialProvider.profilePicture = profileResponse?.data?.picture?.data?.url;
      socialProvider.mediaCount = profileResponse?.data?.media_count;
      socialProvider.accountType = profileResponse?.data?.account_type;

      socialProvider = await socialProvider.save();

      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };
      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to set instagram token');
    }
  }

  public static async getInstagramAuthData(payload: UserIdAuthRequestDto): Promise<GetMetaAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists and is active');
      }

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        return responses.notFound('Social provider info not found');
      }
      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };

      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to get instagram data');
    }
  }

  public static async getInstagramData(userId: string, code: string, platform: 'ios' | 'android'): Promise<SocialProvider | null> {
    try {
      let socialProvider = this.dbConnection.getRepository(SocialProvider).create({
        type: SocialProviderType.INSTAGRAM,
      });

      const instagramToken = await this.getInstagramShortLivedToken(code, platform);
      if (!instagramToken) return null;

      const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${config.get('INSTAGRAM_APP_SECRET')}&access_token=${instagramToken.access_token}`;
      const instagramTokenResponse = await axios.get(longLivedTokenUrl);
      const instrgramTokenStructure = instagramTokenResponse.data;

      socialProvider.longLivedToken = instrgramTokenStructure.access_token;
      socialProvider.expirationToken = instrgramTokenStructure.expires_in;
      socialProvider = await socialProvider.save();

      const profileUserGetUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${instrgramTokenStructure.access_token}`;
      const profileResponse = await axios.get(profileUserGetUrl);

      let followerCount: number | null = null;
      let name = profileResponse?.data?.name;
      if (profileResponse?.data?.username) {
        const instagApiProfile = await this.getInstagramProfile(profileResponse?.data?.username);
        followerCount = instagApiProfile.follower_count;
        if (!name) {
          name = instagApiProfile.full_name;
        }
      }

      socialProvider.email = profileResponse?.data?.email;
      socialProvider.name = name;
      socialProvider.username = profileResponse?.data?.username;
      socialProvider.providerId = profileResponse?.data?.id;
      socialProvider.profilePicture = profileResponse?.data?.picture?.data?.url;
      socialProvider.mediaCount = profileResponse?.data?.media_count;
      socialProvider.accountType = profileResponse?.data?.account_type;
      socialProvider.user = { id: userId } as User;

      let socialStats: SocialStats = await this.dbConnection.getRepository(SocialStats).findOne({
        where: {
          user: {
            id: userId,
          },
        },
      });

      if (!socialStats) {
        socialStats = await this.dbConnection.getRepository(SocialStats).save({ user: { id: userId } });
      }

      socialStats.instagramFollowersCount = followerCount;
      await socialStats.save();

      return await socialProvider.save();
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  public static async getInstagramShortLivedToken(code: string, platform: 'ios' | 'android'): Promise<InstagramTokenResponse | null> {
    try {
      const tokenResponse = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        querystring.stringify(
          {
            client_id:config.get('INSTAGRAM_APP_ID'),
            client_secret:config.get('INSTAGRAM_APP_SECRET'),
            grant_type: 'authorization_code',
            redirect_uri:
              platform === 'ios' ?config.get('INSTAGRAM_IOS_REDIRECT_URI') :config.get('INSTAGRAM_ANDROID_REDIRECT_URI'),
            code,
          },
          null,
          null,
          { encodeURIComponent: querystring.unescape },
        ),
      );

      return tokenResponse.data as InstagramTokenResponse;
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  public static async getInstagramProfile(username: string): Promise<InstagAPIUserProfileResponse | null> {
    try {
      const options = {
        method: 'GET',
        url: `https://api.instagapi.com/userinfo/${username}`,
        headers: {
          'X-InstagAPI-Key':config.get('INSTAG_API_KEY'),
        },
      };
      const response = await axios.request(options);
      const data = response.data.data as InstagAPIUserProfileResponse;
      return data;
    } catch (err) {
      return null;
    }
  }

  // Google
  public static async getGoogleAuthData(payload: UserIdAuthRequestDto): Promise<GetMetaAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists and is active');
      }

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.GOOGLE,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        return responses.notFound('Social provider info not found');
      }
      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };

      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to get google data');
    }
  }

  public static async getGoogleAuthUrl(payload: UserIdAuthRequestDto): Promise<GetGoogleAuthUrlResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      const REDIRECT_URI =config.get('GOOGLE_REDIRECT_URI');
      const CLIENT_ID =config.get('GOOGLE_CLIENT_ID');

      const scope =config.get('GOOGLE_SCOPE').split(',').join(' ');

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope,
        access_type: 'offline',
        prompt: 'consent',
        state: user.id,
      });

      const uri = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return responses.data(uri);
    } catch (err) {
      return responses.badRequest('Unable to call forgot password, please try again later');
    }
  }

  public static async googleAuthCallback(payload: GoogleAuthCallbackRequestDto): Promise<GoogleAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.GOOGLE,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.GOOGLE,
        });
      }

      let socialStats: SocialStats = await this.dbConnection.getRepository(SocialStats).findOne({
        where: {
          user: {
            id: user.id,
          },
        },
      });

      if (!socialStats) {
        socialStats = this.dbConnection.getRepository(SocialStats).create({
          user: user,
        });
      }

      const redirect =config.get('GOOGLE_REDIRECT_URI');
      const client_id =config.get('GOOGLE_CLIENT_ID');
      const client_secret =config.get('GOOGLE_CLIENT_SECRET');

      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code: payload.code,
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirect,
        grant_type: 'authorization_code',
      });

      const tokenStructure = tokenResponse.data;

      socialProvider.token = tokenStructure.access_token;
      socialProvider.refreshToken = tokenStructure.refresh_token;
      socialProvider.expirationToken = tokenStructure.expires_in;
      socialProvider = await socialProvider.save();
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          Authorization: `Bearer ${tokenStructure.access_token}`,
        },
      });
      const userGoogle = userInfoResponse.data;

      socialProvider.email = userGoogle?.email;
      socialProvider.name = userGoogle?.name;
      socialProvider.providerId = userGoogle?.id;
      socialProvider.profilePicture = userGoogle?.picture;
      socialProvider = await this.dbConnection.getRepository(SocialProvider).save(socialProvider);

      //Get Youtube susbcribers
      const userStatsResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true', {
        headers: {
          Authorization: `Bearer ${tokenStructure.access_token}`,
        },
      });

      const userStats = userStatsResponse?.data?.items || [];

      socialStats.youtubeFollowersCount =
        userStats.length == 0
          ? 0
          : userStats.reduce((acc, item) => {
              return acc + parseInt(item?.statistics?.subscriberCount || '0');
            }, 0);

      await this.dbConnection.getRepository(SocialStats).save(socialStats);

      return responses.data(socialProvider.token);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to changes code for token in google auth');
    }
  }

  // LinkedIn
  public static async getLinkedInAuthUrl(payload: LinkedInUserIdAuthRequestDto): Promise<GetLinkedInAuthUrlResponse> {
    try {
      let userId: string | null = null;
      if (payload.userId && payload.userId != '') {
        const user: User = await this.dbConnection.getRepository(User).findOne({
          where: {
            id: payload.userId,
            deletedAt: IsNull(),
          },
        });

        if (!user) {
          return responses.notFound('Verify user exists');
        }
        userId = user.id;
      }

      const [REDIRECT_URI, CLIENT_ID, scope] = [
        this.getLinkedRedirect(payload.platform),
       config.get('LINKEDIN_CLIENT_ID'),
       config.get('LINKEDIN_SCOPE'),
      ];

      let authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
      if (userId) {
        authUrl += `&state=${userId}`;
      }

      return responses.data(authUrl);
    } catch (err) {
      return responses.badRequest('Invalid url generated');
    }
  }

  public static async linkedInAuthCallback(payload: LinkedInAuthCallbackRequestDto): Promise<LinkedInAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.LINKEDIN,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.LINKEDIN,
        });
      }

      const LINKEDIN_REDIRECT_URL =config.get('LINKEDIN_REDIRECT_URL');
      const LINKEDIN_CLIENT_ID =config.get('LINKEDIN_CLIENT_ID');
      const LINKEDIN_CLIENT_SECRET =config.get('LINKEDIN_CLIENT_SECRET');

      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        querystring.stringify({
          grant_type: 'authorization_code',
          code: payload.code,
          redirect_uri: LINKEDIN_REDIRECT_URL,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { access_token } = tokenResponse.data;

      socialProvider.token = access_token;

      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const profile = profileResponse.data;
      socialProvider.email = profile.email;
      socialProvider.profilePicture = profile.picture;
      socialProvider.providerId = profile.sub;
      socialProvider.name = profile.name;

      socialProvider = await socialProvider.save();
      return responses.data(socialProvider.token);
    } catch (err) {
      return responses.badRequest('An error happens when tries to request token  from linkedin');
    }
  }

  public static async getLinkedInAuthData(payload: UserIdAuthRequestDto): Promise<GetLinkedInAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists and is active');
      }

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.LINKEDIN,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        return responses.notFound('Error when tries to get information from linkedin auth data');
      }
      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };

      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('Error when tries to get auth data from linkedin');
    }
  }

  public static getLinkedRedirect(platform: 'ios' | 'android'): string {
    const redirectURI =
      platform === 'ios' ?config.get('LINKEDIN_IOS_REDIRECT_URI') :config.get('LINKEDIN_ANDROID_REDIRECT_URI');
    return redirectURI;
  }

  public static async getLinkedInAccessToken(authorizationCode: string, platform: 'ios' | 'android'): Promise<LinkedInTokenResponse> {
    try {
      const [LINKEDIN_REDIRECT_URL, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET] = [
        this.getLinkedRedirect(platform),
       config.get('LINKEDIN_CLIENT_ID'),
       config.get('LINKEDIN_CLIENT_SECRET'),
      ];

      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        querystring.stringify({
          grant_type: 'authorization_code',
          code: authorizationCode,
          redirect_uri: LINKEDIN_REDIRECT_URL,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const response = tokenResponse.data;

      return response;
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  public static async getLinkedInUserInfo(accessToken: string): Promise<LinkedInUserInfoResponse> {
    try {
      const url = `https://api.linkedin.com/v2/userinfo`;
      const userInfo = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `application/json` },
      });

      return userInfo.data;
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  /**
   * Table Name Prefix:
   *    SP: Social Provider
   * Logic
   *    1. Fetch AccessToken in exchanges with Authorization Code.
   *    2. Fetch UserInfo.
   *    3. Save SocialProvider data.
   * @param userId
   * @param code
   * @param platform
   * @returns
   */
  public static async getLinkedInData(userId: string, code: string, platform: 'ios' | 'android'): Promise<SocialProvider | null> {
    try {
      const socialProvider = this.dbConnection.getRepository(SocialProvider).create({
        type: SocialProviderType.LINKEDIN,
      });

      const linkedInAccessToken: LinkedInTokenResponse = await this.getLinkedInAccessToken(code, platform);
      if (!linkedInAccessToken) return null;

      const linkedInUserInfo: LinkedInUserInfoResponse = await this.getLinkedInUserInfo(linkedInAccessToken.access_token);

      socialProvider.token = linkedInAccessToken.access_token;
      socialProvider.expirationToken = linkedInAccessToken.expires_in;
      socialProvider.email = linkedInUserInfo.email;
      socialProvider.profilePicture = linkedInUserInfo.picture;
      socialProvider.providerId = linkedInUserInfo.sub;
      socialProvider.name = linkedInUserInfo.name;
      socialProvider.user = { id: userId } as User;

      return await socialProvider.save();
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.response);
      return null;
    }
  }

  // TikTok
  public static async getTiktokAuthUrl(payload: UserIdAuthRequestDto): Promise<GetTiktokAuthUrlResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      const REDIRECT_URI =config.get('TIKTOK_REDIRECT_URL');
      const TIKTOK_CLIENT_KEY =config.get('TIKTOK_CLIENT_KEY');
      const TIKTOK_SCOPE =config.get('TIKTOK_SCOPE');

      let authUrl = 'https://www.tiktok.com/v2/auth/authorize/';
      authUrl += '?client_key=' + TIKTOK_CLIENT_KEY;
      authUrl += '&scope=' + TIKTOK_SCOPE;
      authUrl += '&response_type=code';

      authUrl += '&state=' + user.id;
      authUrl += '&redirect_uri=' + REDIRECT_URI;

      return responses.data(authUrl);
    } catch (err) {
      return responses.badRequest('An error occurs at get auth from tiktok');
    }
  }

  public static async tiktokAuthCallback(payload: TiktokAuthCallbackRequestDto): Promise<TiktokAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.TIKTOK,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.TIKTOK,
        });
      }

      const TIKTOK_APP_SECRET =config.get('TIKTOK_APP_SECRET');
      const TIKTOK_CLIENT_KEY =config.get('TIKTOK_CLIENT_KEY');
      const redirect =config.get('TIKTOK_REDIRECT_URL');

      const tokenResponse = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        querystring.stringify({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_APP_SECRET,
          code: payload.code,
          grant_type: 'authorization_code',
          redirect_uri: redirect,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { data } = tokenResponse;

      if (data && tokenResponse.status === 200) {
        const { access_token, refresh_token, open_id, expires_in } = data;
        socialProvider.token = access_token;
        socialProvider.refreshToken = refresh_token;
        socialProvider.expirationToken = expires_in;
        socialProvider.providerId = open_id;
        socialProvider = await this.dbConnection.getRepository(SocialProvider).save(socialProvider);

        const followerCount: number = await this.getTiktokFollowerCount(socialProvider.token);
        let socialStats: SocialStats | null = await this.dbConnection.getRepository(SocialStats).findOne({
          where: {
            user: {
              id: user.id,
            },
          },
        });

        if (!socialStats) {
          socialStats = this.dbConnection.getRepository(SocialStats).create({
            user: user,
          });
        }
        socialStats.tiktokFollowersCount = followerCount;
        await this.dbConnection.getRepository(SocialStats).save(socialStats);

        return responses.data(socialProvider.token);
      } else {
        return responses.badRequest('Error when request tiktok info');
      }
    } catch (err) {
      return responses.badRequest('An error happens when tries to request token ');
    }
  }

  public static async getTiktokAuthData(payload: UserIdAuthRequestDto): Promise<GetTiktokAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.TIKTOK,
        },
        relations: ['user'],
      });

      if (!socialProvider) return responses.notFound('Social provider info not found');
      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };

      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to get user data tiktok form  database');
    }
  }

  /**
   * Function to fetch Tiktok Follower Count
   * @param token
   * @returns number
   */
  public static async getTiktokFollowerCount(token: string): Promise<number> {
    try {
      const options = {
        method: 'get',
        url: 'https://open.tiktokapis.com/v2/user/info/?fields=follower_count',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const userInfo = await axios.request(options);

      const { data } = userInfo;

      if (data.error.code !== 'ok') {
        throw data.error;
      }

      return data.data.user.follower_count;
    } catch (err) {
      throw err;
    }
  }

  // X
  public static async getXAuthUrl(payload: UserIdAuthRequestDto): Promise<GetXAuthUrlResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) {
        return responses.notFound('Verify user exists');
      }

      const REDIRECT_URI =config.get('X_REDIRECT_URL');
      const CLIENT_ID =config.get('X_CLIENT_ID');

      const scope =config.get('X_SCOPE').split(',').join(' ');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      //delete any previous unused code verifier
      await this.dbConnection.getRepository(XAuthSession).softDelete({ userId: user.id, deletedAt: IsNull() });
      //persist to use in the next X request
      await this.dbConnection.getRepository(XAuthSession).save({ userId: user.id, codeVerifier });

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        state: user.id,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope,
      });

      const qs = new URLSearchParams(params).toString();
      const uri = `https://twitter.com/i/oauth2/authorize?${qs}`;
      return responses.data(uri);
    } catch (err) {
      return responses.badRequest('Unable to call X auth, please try again later');
    }
  }

  public static async xAuthCallback(payload: XAuthCallbackRequestDto): Promise<XAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.X,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.X,
        });
      }

      let socialStats: SocialStats = await this.dbConnection.getRepository(SocialStats).findOne({
        where: {
          user: {
            id: user.id,
          },
        },
      });

      if (!socialStats) {
        socialStats = this.dbConnection.getRepository(SocialStats).create({
          user: user,
        });
      }

      const X_CLIENT_ID =config.get('X_CLIENT_ID');
      const X_REDIRECT_URL =config.get('X_REDIRECT_URL');

      const xAuthSession = await this.dbConnection.getRepository(XAuthSession).findOne({
        where: {
          userId: user.id,
          deletedAt: IsNull(),
        },
      });

      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        querystring.stringify({
          client_id: X_CLIENT_ID,
          code: payload.code,
          grant_type: 'authorization_code',
          redirect_uri: X_REDIRECT_URL,
          code_verifier: xAuthSession.codeVerifier,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { data } = tokenResponse;
      //no longer needed
      await this.dbConnection.getRepository(XAuthSession).softRemove(xAuthSession);

      if (data) {
        const { access_token, refresh_token } = data;

        const profileResponse = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const profile = profileResponse.data.data;

        socialProvider.token = access_token;
        socialProvider.refreshToken = refresh_token;
        socialProvider.email = profile.email;
        socialProvider.profilePicture = profile.profile_image_url;
        socialProvider.providerId = profile.id;
        socialProvider.username = profile?.username;
        socialProvider.name = profile.name;

        socialProvider = await this.dbConnection.getRepository(SocialProvider).save(socialProvider);

        socialStats.xFollowersCount = profile.public_metrics?.followers_count || 0;
        await this.dbConnection.getRepository(SocialStats).save(socialStats);

        return responses.data(socialProvider.token);
      } else {
        return responses.badRequest('Error when request X info');
      }
    } catch (err) {
      return responses.badRequest('An error happens when tries to request token from X');
    }
  }

  public static async getXAuthData(payload: UserIdAuthRequestDto): Promise<GetXAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.X,
        },
        relations: ['user'],
      });

      if (!socialProvider) return responses.notFound('Social provider info not found');
      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };

      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to get user data form database');
    }
  }

  // Snapchat

  public static async getSnapchatAuthUrl(payload: UserIdAuthRequestDto): Promise<GetSnapchatAuthUrlResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      const REDIRECT_URI =config.get('SNAPCHAT_REDIRECT_URL');
      const SNAPCHAT_CLIENT_ID =config.get('SNAPCHAT_CLIENT_ID');
      const scope =config.get('SNAPCHAT_SCOPE').split(',').join(' ');
      const params = new URLSearchParams({
        client_id: SNAPCHAT_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        state: user.id,
        response_type: 'code',
        scope,
      });
      const qs = new URLSearchParams(params).toString();
      const authUrl = `https://accounts.snapchat.com/accounts/oauth2/auth?${qs}`;
      return responses.data(authUrl);
    } catch (err) {
      return responses.badRequest('An error occurs at get auth from snapchat');
    }
  }

  public static async snapchatAuthCallback(payload: SnapchatAuthCallbackRequestDto): Promise<SnapchatAuthCallbackResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.state,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.SNAPCHAT,
        },
        relations: ['user'],
      });

      if (!socialProvider) {
        socialProvider = this.dbConnection.getRepository(SocialProvider).create({
          user: user,
          type: SocialProviderType.SNAPCHAT,
        });
      }

      const SNAPCHAT_CLIENT_SECRET =config.get('SNAPCHAT_CLIENT_SECRET');
      const SNAPCHAT_CLIENT_ID =config.get('SNAPCHAT_CLIENT_ID');
      const SNAPCHAT_REDIRECT_URL =config.get('SNAPCHAT_REDIRECT_URL');
      const params = {
        grant_type: 'authorization_code',
        code: payload.code,
        redirect_uri: SNAPCHAT_REDIRECT_URL,
        client_id: SNAPCHAT_CLIENT_ID,
      };
      const authorizationHeader = `${SNAPCHAT_CLIENT_ID}:${SNAPCHAT_CLIENT_SECRET}`;

      const tokenResponse = await axios.post('https://accounts.snapchat.com/accounts/oauth2/token', null, {
        params,
        headers: {
          Authorization: `Basic ${Buffer.from(authorizationHeader).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const { access_token, expires_in, refresh_token } = tokenResponse.data;
      const profileResponse = await axios({
        method: 'post',
        url: 'https://kit.snapchat.com/v1/me',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + access_token,
        },
        data: {
          query: '{me{displayName bitmoji{avatar} externalId}}',
        },
      });

      socialProvider.token = access_token;
      const profile = profileResponse.data.data.me;
      socialProvider.name = profile.displayName;
      socialProvider.profilePicture = profile.bitmoji?.avatar;
      socialProvider.providerId = profile.externalId;
      socialProvider.expirationToken = expires_in;
      socialProvider.refreshToken = refresh_token;
      socialProvider = await this.dbConnection.getRepository(SocialProvider).save(socialProvider);
      return responses.data(socialProvider.token);
    } catch (err) {
      return responses.badRequest('An error happens when tries to request token ');
    }
  }

  public static async getSnapchatAuthData(payload: GetSnapchatAuthDataRequestDto): Promise<GetSnapchatAuthDataResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.userId,
          deletedAt: IsNull(),
        },
      });

      if (!user) return responses.notFound('Verify user exists and is active');

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: payload.userId,
          },
          type: SocialProviderType.SNAPCHAT,
        },
        relations: ['user'],
      });

      if (!socialProvider) return responses.notFound('Social provider info not found');
      const providerType = entityToProviderType[socialProvider.type];

      const resp: ProviderAuth = {
        userId: user.id,
        providerType: providerType,
        providerToken: socialProvider.token,
        providerLongLivedToken: socialProvider.longLivedToken,
        providerUserId: socialProvider.providerId,
        providerUserEmail: socialProvider.email,
        providerUserName: socialProvider.name,
        providerUserProfilePicture: socialProvider.profilePicture,
        mediaCount: socialProvider.mediaCount,
        accountType: socialProvider.accountType,
      };

      return responses.data(resp);
    } catch (err) {
      return responses.badRequest('An error occurs when tries to get user data snapchat form  database');
    }
  }

  public static async syncSocialStats(userId: UserIdAuthRequestDto): Promise<SocialMediaStatsResponse> {
    try {
      const socialProvider = await this.dbConnection.getRepository(SocialProvider).find({
        where: {
          user: {
            id: userId.userId,
          },
        },
      });
      if (socialProvider && socialProvider.length > 0) {
        const result = await Promise.all(
          socialProvider.map(async (provider) => {
            if (provider.type === SocialProviderType.INSTAGRAM) {
              const profile = await this.getInstagramProfile(provider.username);
              return {
                socialProviderType: provider.type as unknown as ProviderType,
                followersCount: profile.follower_count,
              };
            } else {
              // TODO: Implement sync for other social media followers count
              return {
                socialProviderType: provider.type as unknown as ProviderType,
                followersCount: await this.dbConnection.getRepository(SocialStats)
                  .findOne({
                    where: {
                      user: { id: userId.userId },
                    },
                  })
                  .then((stats) => {
                    if (provider.type === SocialProviderType.GOOGLE) {
                      return stats?.youtubeFollowersCount;
                    } else {
                      return stats?.[`${provider.type.toLowerCase()}FollowersCount`];
                    }
                  }),
              };
            }
          }),
        );

        await Promise.all(
          result.map(async (stat) => {
            const updateData = {};
            switch (stat.socialProviderType) {
              case ProviderType.FACEBOOK:
                updateData['facebookFollowersCount'] = stat.followersCount;
                break;
              case ProviderType.INSTAGRAM:
                updateData['instagramFollowersCount'] = stat.followersCount;
                break;
              case ProviderType.GOOGLE:
                updateData['youtubeFollowersCount'] = stat.followersCount;
                break;
              case ProviderType.TIKTOK:
                updateData['tiktokFollowersCount'] = stat.followersCount;
                break;
              case ProviderType.LINKEDIN:
                updateData['linkedinFollowersCount'] = stat.followersCount;
                break;
              case ProviderType.X:
                updateData['xFollowersCount'] = stat.followersCount;
                break;
              case ProviderType.SNAPCHAT:
                updateData['snapchatFollowersCount'] = stat.followersCount;
                break;
              default:
                break;
            }
            await this.dbConnection.getRepository(SocialStats).update({ user: { id: userId.userId } }, updateData);
          }),
        );
        return responses.data(result);
      } else {
        return responses.notFound('Social provider info not found');
      }
    } catch (err) {
      return responses.badRequest('An error happens when tries to sync social stats');
    }
  }
}
