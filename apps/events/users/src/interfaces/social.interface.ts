export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

export interface InstagAPIUserProfileResponse {
  follower_count: number;
  full_name: string;
  id: string;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
}

export interface LinkedInUserInfoResponse {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  name: string;
  picture: string;
  sub: string;
}
