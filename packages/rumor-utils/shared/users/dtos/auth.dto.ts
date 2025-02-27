import { IsArray, IsBoolean, IsEmail, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import {
  CheckAgeRequest,
  CheckEmaiLRequest,
  PhoneNumberRequest,
  ForgotPasswordRequest,
  Gender,
  HostSignUpRequest,
  LoginRequest,
  MemberAddress,
  MemberLoginRequest,
  MemberSignUpRequest,
  OAuthRedirectRequest,
  SaveOrUpdateProviderAuthRequest,
  UserInvitationsRequest,
  AdminSignUpRequest,
  ValidateRequest,
  UpdateUserProfilePictureRequest,
  UpdateUserProfileRequest,
  MemberAddressUpdate,
  BioProfileRequest,
  ListUsersByTypeRequest,
  CreateNonMemberUserRequest,
  InviteNewMemberRequest,
  ManageFollowHostRequest,
  CustomUsersListRequest,
  ManageCustomUsersListRequest,
  ManageFavoriteUserRequest,
  UpdateUserStatusRequest,
  ValidatePasswordTokenRequest,
  SetHostPasswordRequest,
  UpdateHostPasswordRequest,
  ContactsListRequest,
  GetUserWithRolesByEmailRequest,
  InviteNewHostRequest,
  LoginVerificationRequest,
  UpdateCustomUsersListRequest,
} from '../grpc/auth/auth.pb';
import { Type } from 'class-transformer';
import { NewUserStatus, ProviderType } from '../grpc/auth/shared.pb';
import { IsPasswordMatch, IsStrongPassword } from '../../../decorators';

export class AdminSignUpRequestDto implements AdminSignUpRequest {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;
  @IsStrongPassword({
    message: 'Password must be at least 8 characters long and include at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 special character.',
  })
  @IsNotEmpty()
  password: string;
}

export class LoginRequestDto implements LoginRequest {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ValidateRequestDto implements ValidateRequest {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ForgotPasswordRequestDto implements ForgotPasswordRequest {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class OAuthRequestDto implements OAuthRedirectRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class LoginVerificationRequestDto implements LoginVerificationRequest {
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class PhoneNumberRequestDto implements PhoneNumberRequest {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class CheckEmailRequestDto implements CheckEmaiLRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CheckAgeRequestDto implements CheckAgeRequest {
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;
}

export class MemberAddressDto implements MemberAddress {
  @IsString()
  @IsNotEmpty()
  placeId: string;
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class MemberAddressUpdateDto implements MemberAddressUpdate {
  @IsString()
  @IsOptional()
  placeId: string;
  @IsString()
  @IsOptional()
  address: string;
  @IsString()
  @IsOptional()
  regionCode: string;
}

export class MemberSignUpRequestDto implements MemberSignUpRequest {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MemberAddressDto)
  address: MemberAddressDto;
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  focusIds: string[];
  @IsString()
  @IsOptional()
  instagramAccessToken?: string;
  @IsString()
  @IsOptional()
  socialUrl?: string;
  @IsIn(['ios', 'android'])
  @IsNotEmpty()
  platform: 'ios' | 'android';
  @IsString()
  @IsOptional()
  facebookAccessToken?: string;
  @IsString()
  @IsOptional()
  linkedInAccessToken?: string;
  @IsString()
  @IsOptional()
  instagramUserName?: string;
}

export class HostSignUpRequestDto implements HostSignUpRequest {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsString()
  @IsNotEmpty()
  companyName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @IsInt()
  @IsNotEmpty()
  eventsPerYear: number;
  @IsString()
  @IsOptional()
  website?: string;
  @IsString()
  @IsOptional()
  referredBy?: string;
  @IsString()
  @IsOptional()
  bio?: string;
}

export class UserInvitationsRequestDto implements UserInvitationsRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  phoneNumbers: string[];
}

export class InviteNewMemberRequestDto implements InviteNewMemberRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  @IsString()
  @IsOptional()
  referralCode?: string;
}

export class InviteNewHostRequestDto implements InviteNewHostRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class SaveOrUpdateProviderAuthRequestDto implements SaveOrUpdateProviderAuthRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsString()
  @IsOptional()
  providerUserId?: string;
  @IsString()
  @IsOptional()
  providerUserEmail?: string;
  @IsString()
  @IsOptional()
  providerUserName?: string;
  @IsString()
  @IsOptional()
  providerUserUsername?: string;
  @IsString()
  @IsOptional()
  providerUserProfilePicture?: string;
  @IsString()
  @IsOptional()
  accountType?: string;
  @IsString()
  @IsOptional()
  mediaCount?: number;
  @IsEnum(ProviderType)
  @IsNotEmpty()
  providerType: ProviderType;
}

export class MemberLoginRequestDto implements MemberLoginRequest {
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  isExist: boolean;
}

export class UpdateUserProfilePictureRequestDto implements UpdateUserProfilePictureRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  profilePicture: string;
}

export class UpdateUserProfileRequestDto implements UpdateUserProfileRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
  @IsString()
  @IsOptional()
  birthDate?: string;
  @IsString()
  @IsOptional()
  mobilePhone?: string;
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
  @IsOptional()
  @ValidateNested()
  @Type(() => MemberAddressUpdateDto)
  address?: MemberAddressUpdateDto;
}

export class BioProfileRequestDto implements BioProfileRequest {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsString()
  bio: string;
}

export class ListUsersByTypeRequestDto implements ListUsersByTypeRequest {
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class CreateNonMemberUserRequestDto implements CreateNonMemberUserRequest {
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class ManageFollowHostRequestDto implements ManageFollowHostRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  hostId: string;

  @IsBoolean()
  @IsNotEmpty()
  follow: boolean;
}

export class CustomUsersListRequestDto implements CustomUsersListRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  query: string;
}

export class ManageCustomUsersListRequestDto implements ManageCustomUsersListRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  customName: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  userIds: string[];
}

export class ManageFavoriteUserRequestDto implements ManageFavoriteUserRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  targetUserId: string;

  @IsBoolean()
  @IsNotEmpty()
  favorite: boolean;
}

export class UpdateCustomUsersListRequestDto implements UpdateCustomUsersListRequest {
  @IsUUID()
  @IsNotEmpty()
  hostId: string;

  @IsUUID()
  @IsOptional()
  customListId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  userIds: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  mappingIds: string[];
}

export class UpdateUserStatusRequestDto implements UpdateUserStatusRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsEnum(NewUserStatus)
  @IsNotEmpty()
  status: NewUserStatus;
}

export class ValidatePasswordTokenRequestDto implements ValidatePasswordTokenRequest {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SetHostPasswordRequestDto implements SetHostPasswordRequest {
  @IsString()
  @IsNotEmpty()
  token: string;
  @IsStrongPassword({
    message: 'Password must be at least 8 characters long and include at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 special character.',
  })
  @IsNotEmpty()
  password: string;
  @IsPasswordMatch('password', { message: 'Passwords do not match' })
  @IsNotEmpty()
  repeatedPassword: string;
}

export class UpdateHostPasswordRequestDto implements UpdateHostPasswordRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
  @IsStrongPassword({
    message: 'Password must be at least 8 characters long and include at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 special character.',
  })
  @IsNotEmpty()
  newPassword: string;
}

export class ContactsListRequestDto implements ContactsListRequest {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  contacts: string[];
}

export class GetUserWithRolesByEmailRequestDto implements GetUserWithRolesByEmailRequest {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class NonMemberSignUpRequestDto implements CreateNonMemberUserRequest {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  id: string;
}

export class VerifyCodeRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
