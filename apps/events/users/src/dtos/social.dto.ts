import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  UserIdAuthRequest,
  GetMetaAuthUrlRequest,
  GoogleAuthCallbackRequest,
  LinkedInAuthCallbackRequest,
  MetaAuthCallbackRequest,
  SetMetaAuthTokenRequest,
  SnapchatAuthCallbackRequest,
  TiktokAuthCallbackRequest,
  XAuthCallbackRequest,
  InstagramUserRequest,
  LinkedInUserIdAuthRequest,
} from '../grpc/auth/social.pb';

// Meta
export class MetaAuthCallbackRequestDto implements MetaAuthCallbackRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
  @IsString()
  @IsNotEmpty()
  state: string;
  @IsIn(['ios', 'android'])
  @IsOptional()
  platform: 'ios' | 'android';
}

export class SetMetaAuthTokenRequestDto implements SetMetaAuthTokenRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsString()
  @IsNotEmpty()
  providerToken: string;
}

export class InstagramUserRequestDto implements InstagramUserRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsString()
  @IsOptional()
  instagramUsername?: string;
}

export class GetMetaAuthUrlRequestDto implements GetMetaAuthUrlRequest {
  @IsString()
  @IsOptional()
  userId: string;
  @IsIn(['ios', 'android'])
  @IsNotEmpty()
  platform: 'ios' | 'android';
}
export class LinkedInUserIdAuthRequestDto implements LinkedInUserIdAuthRequest {
  @IsString()
  @IsOptional()
  userId: string;
  @IsIn(['ios', 'android'])
  @IsNotEmpty()
  platform: 'ios' | 'android';
}

export class UserIdAuthRequestDto implements UserIdAuthRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

// Google
export class GoogleAuthCallbackRequestDto implements GoogleAuthCallbackRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
  @IsString()
  @IsNotEmpty()
  state: string;
}

// LinkedIn
export class LinkedInAuthCallbackRequestDto implements LinkedInAuthCallbackRequest {
  @IsNotEmpty()
  @IsString()
  code: string;
  @IsNotEmpty()
  @IsString()
  state: string;
}

// TikTok
export class TiktokAuthCallbackRequestDto implements TiktokAuthCallbackRequest {
  @IsOptional()
  @IsString()
  code: string;
  @IsNotEmpty()
  @IsString()
  state: string;
}

export class XAuthCallbackRequestDto implements XAuthCallbackRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class SnapchatAuthCallbackRequestDto implements SnapchatAuthCallbackRequest {
  @IsNotEmpty()
  @IsString()
  code: string;
  @IsNotEmpty()
  @IsString()
  state: string;
}

export class GetSnapchatAuthDataRequestDto implements UserIdAuthRequest {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
