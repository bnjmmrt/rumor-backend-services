import { FindOptionsWhere, ILike, In } from 'typeorm';
import database from '../database'
import config from '../config';

import {
  ForgotPasswordRequestDto,
  CheckAgeRequestDto,
  CheckEmailRequestDto,
  PhoneNumberRequestDto,
  HostSignUpRequestDto,
  MemberSignUpRequestDto,
  OAuthRequestDto,
  ValidateRequestDto,
  UserInvitationsRequestDto,
  SaveOrUpdateProviderAuthRequestDto,
  MemberLoginRequestDto,
  UpdateUserProfilePictureRequestDto,
  UpdateUserProfileRequestDto,
  BioProfileRequestDto,
  ListUsersByTypeRequestDto,
  CreateNonMemberUserRequestDto,
  InviteNewMemberRequestDto,
  ManageFollowHostRequestDto,
  CustomUsersListRequestDto,
  ManageCustomUsersListRequestDto,
  ManageFavoriteUserRequestDto,
  ValidatePasswordTokenRequestDto,
  SetHostPasswordRequestDto,
  UpdateHostPasswordRequestDto,
  ContactsListRequestDto,
  GetUserWithRolesByEmailRequestDto,
  NonMemberSignUpRequestDto,
  InviteNewHostRequestDto,
  LoginVerificationRequestDto,
  UpdateCustomUsersListRequestDto,
} from 'rumor-utils/shared/users/dtos/auth.dto';

import {
  ForgotPasswordResponse,
  LoginSSOResponse,
  OAuthRedirectResponse,
  LoginResponse,
  ValidateResponse,
  ValidityResponse,
  SaveOrUpdateProviderAuthResponse,
  MemberResponse,
  UpdateUserProfilePictureResponse,
  UpdateUserProfileResponse,
  BioProfileResponse,
  ListUsersByTypeResponse,
  CreateNonMemberUserResponse,
  GetFollowedHostsResponse,
  CustomUsersListsResponse,
  CustomUsersListResponse,
  CurrentUserResponse,
  ConfirmedMembersResponse,
  SimpleUserResponse,
  GetUserWithRolesByEmailResponse,
  CreateUserResponse,
  GetUsersResponse,
  UserResponseData,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb';

import { TemporaryLoginCode } from 'rumor-utils/shared/users/entities/temporary-login-code.entity';
import { Invitation } from 'rumor-utils/shared/users/entities/invitation.entity';
import { HostCustomUsersLists } from 'rumor-utils/shared/users/entities/host-custom-users-lists.entity';
import { HostFavorite } from 'rumor-utils/shared/users/entities/host-favorite.entity';
import { Address } from 'rumor-utils/shared/users/entities/address.entity';
import { TemporaryPasswordToken } from "rumor-utils/shared/users/entities/temporary-password-token.entity";

import {
  LoginRequest,
  ForgotPasswordRequest,
  PasswordlessStartRequest,
  ChangePasswordRequest,
} from '@fusionauth/typescript-client';

import { newAddress, newHost, newMember } from '../utils/auth.util';
import {
  entityToGender,
  genderToEntity,
  toConfirmedMember,
  toCreateUser,
  toCurrentMember,
  toCurrentUser,
  toSimpleUser,
  toUserDataSimple,
  toUser
} from 'rumor-utils/shared/users/mappers/auth.mapper';

// import { PlatformClient } from 'rumor-utils/clients/platform.client';
import { hasPagination, TokenRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import { ProviderAuth } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { AdditionalHostInformation, Gender, RoleType } from 'rumor-utils/shared/users/interfaces/auth.interface';
import { SocialService } from './social.service';
import { UserSource, UserStatus } from 'rumor-utils/shared/users/interfaces/shared.interface';
import { entityToProviderType, providerTypeToEntity } from 'rumor-utils/shared/users/mappers/social.mapper';
import { AddressValidationClient } from '@googlemaps/addressvalidation';
import { JWT as GoogleAuthJWT } from 'google-auth-library/build/src/auth/jwtclient';
import { ListUsersInviteesDto } from 'rumor-utils/shared/users/dtos/guest.dto';
import { ParsedQs } from 'qs';
import { GoogleAddressClient } from '../utils/google';
import { getCityNameFromAddressComponents } from 'rumor-utils/shared/events/utils/event.utils';

//-----------------Admin Imports

import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { Brackets, IsNull, Repository } from 'typeorm';

import { IdRequestDto, PaginatedRequestDto, UserAndIdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import {
  BasicHostProfileResponse,
  GetHostsResponse,
  GetMembersResponse,
  HostProfileResponse,
  MemberProfileResponse,
  SignUpResponse,
  TokenResponse,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb';
import { parse } from 'qs';
import { toHost, toMember } from 'rumor-utils/shared/users/mappers/auth.mapper';
import { responses } from '../common/responses.common';
import { LoginRequestDto, AdminSignUpRequestDto, UpdateUserStatusRequestDto } from 'rumor-utils/shared/users/dtos/auth.dto';
import { UserRole } from 'rumor-utils/shared/users/entities/roles/user-role.entity';
import FusionAuthClient, { RegistrationRequest } from '@fusionauth/typescript-client';
import { RawHost } from 'rumor-utils/shared/users/interfaces/auth.interface';
import { toBasicHostProfile, toHostProfile, toMemberProfile } from 'rumor-utils/shared/users/mappers/admin.mapper';
import { UpdateHostProfileRequestDto } from 'rumor-utils/shared/users/dtos/admin.dto';
import { generateRandomPassword, generateTemporaryToken, hostToUpdate } from '../utils/auth.util';
import { entityToUserSource, entityToUserStatus, newUserStatusTosUserStatus } from 'rumor-utils/shared/users/mappers/shared.mapper';
import { RoleService } from './role.service';
import { SocialProviderType } from 'rumor-utils/shared/users/interfaces/shared.interface';
import { GenericResponse, NewUserStatus } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
// import { CommunicationClient } from 'rumor-utils/clients/communication.client';
import { HostFollowing } from 'rumor-utils/shared/users/entities/host-following.entity';
import { SocialProvider } from 'rumor-utils/shared/users/entities/social-provider.entity';

import * as dayjs from 'dayjs';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as utc from 'dayjs/plugin/utc';
import * as tz from 'dayjs/plugin/timezone';
import { TemporaryPassword } from 'rumor-utils/shared/users/entities/temporary-password.entity';
import { Role } from 'rumor-utils/shared/users/entities/roles/role.entity';
import { HostUserMapping } from 'rumor-utils/shared/users/entities/host-user-mapping.entity';
import { BadRequestError, NotFoundError } from 'rumor-utils/errors';
import { HostCustomUsersListsUsers } from 'rumor-utils/shared/users/entities/host-custom-users-lists-users.entity';
import * as serviceMesh from 'rumor-utils/service-mesh';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(tz);


export class AuthService {
  public static googleAuthClient = new GoogleAuthJWT();

  constructor() {
    const GOOGLE_MAPS_API_KEY = config.get('GOOGLE_MAPS_API_KEY');
    AuthService.googleAuthClient.fromAPIKey(GOOGLE_MAPS_API_KEY);
  }

  public static dbConnection = database;

  public static fusionAuthClient = new FusionAuthClient(config.get('FUSIONAUTH_API_KEY'), config.get('FUSIONAUTH_BASE_URL'));

  public static async login(payload: LoginRequestDto): Promise<LoginResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: { email: payload.email, deletedAt: IsNull() },
      });

      if (!user) {
        return responses.forbidden('Verify your password and email');
      }
      const loginUserRequest: LoginRequest = {
        loginId: payload.email,
        password: payload.password,
      };

      const loginUser = await this.fusionAuthClient.login(loginUserRequest);

      if (loginUser.statusCode > 299 || loginUser.statusCode < 200) {
        return responses.forbidden('User or password not valid.');
      }

      if (loginUser?.response?.user?.passwordChangeRequired) {
        return responses.forbidden('User must to reset its password.');
      }

      if (!loginUser?.response?.user?.active) {
        return responses.forbidden('User is not active.');
      }

      if (!loginUser?.response?.user?.verified) {
        return responses.forbidden('User is not verified.');
      }

      return responses.data({
        token: loginUser.response.token,
        user: {
          username: loginUser?.response?.user?.username || '',
          email: loginUser?.response?.user?.email || '',
          firstName: loginUser?.response?.user?.firstName || '',
          lastName: loginUser?.response?.user?.lastName || '',
          active: !!loginUser?.response?.user?.active,
          birthDate: loginUser?.response?.user?.birthDate || '',
          mobilePhone: loginUser?.response?.user?.mobilePhone || '',
          verified: !!loginUser?.response?.user?.verified,
          status: entityToUserStatus[UserStatus.UNRECOGNIZED],
          roles: [],
        },
      });
    } catch (err) {
      if (err?.statusCode == 423) {
        return responses.forbidden('User is locked.');
      }
      if (err.statusCode == 404) {
        return responses.forbidden('Verify your password and email.');
      }
      return responses.forbidden('Unable to login.');
    }
  }

  public static async validate({ token }: ValidateRequestDto): Promise<ValidateResponse> {
    try {
      const findUser = await this.fusionAuthClient.retrieveUserUsingJWT(token);
      if (!findUser?.response?.user?.active) {
        return responses.forbidden('User is not active');
      }
      return responses.data({
        userId: findUser.response.user.id,
        user: {
          username: findUser?.response?.user?.username || '',
          email: findUser?.response?.user?.email || '',
          firstName: findUser?.response?.user?.firstName || '',
          lastName: findUser?.response?.user?.lastName || '',
          active: !!findUser?.response?.user?.active,
          birthDate: findUser?.response?.user?.birthDate || '',
          mobilePhone: findUser?.response?.user?.mobilePhone || '',
          verified: !!findUser?.response?.user?.verified,
          roles: [],
        },
      });
    } catch (err) {
      if (err?.statusCode == 423) {
        return responses.forbidden('User is locked.');
      }
      if (err.statusCode == 404) {
        return responses.forbidden('Verify your password and email.');
      }
      return responses.badRequest('Unable to validate user.');
    }
  }

  public static async memberSignUp(payload: MemberSignUpRequestDto): Promise<SignUpResponse> {
    try {
      let nonMember: UserRole | null = null;
      const user = await this.dbConnection.getRepository(User).findOne({
        where: [
          { phoneNumber: payload.phoneNumber, deletedAt: IsNull() },
          { email: payload.email, deletedAt: IsNull() },
        ],
        relations: {
          roles: { role: true },
        },
      });

      if (user) {
        nonMember = user.roles.find((item) => {
          if (item.role.name == 'non_member') return item;
        });
        if (!nonMember) {
          if (user.phoneNumber === payload.phoneNumber) {
            return responses.badRequest('Phone number is already in use, please try with a different phone number.');
          }

          if (user.email === payload.email) {
            return responses.badRequest('Email is already in use, please try with a different email.');
          }
        }
      }

      /* eslint-disable @typescript-eslint/no-explicit-any */
      let placeLocation: any = null;
      if (payload.address.placeId) {
        placeLocation = await GoogleAddressClient.geodecodePlaceId(payload.address.placeId);
      }
      const userAddress = await newAddress(payload.address, placeLocation);
      const address = await this.dbConnection.getRepository(Address).save(userAddress);
      let newUser = newMember(payload, address);

      if (payload.socialUrl) {
        newUser.additionalMemberInformation = {
          socialUrl: payload.socialUrl,
        };
      }
      if (nonMember) {
        newUser.id = user.id;
        await RoleService.revokeRoleFromUser({ userId: user.id, roleName: 'non_member' });
      } else {
        newUser = this.dbConnection.getRepository(User).create(newUser);
      }

      if (payload.instagramAccessToken) {
        await SocialService.getInstagramData(newUser.id, payload.instagramAccessToken, payload.platform);
      } else if (payload.linkedInAccessToken) {
        await SocialService.getLinkedInData(newUser.id, payload.linkedInAccessToken, payload.platform);
      } else if (payload.facebookAccessToken) {
        SocialService.getFacebookData(newUser.id, payload.linkedInAccessToken, payload.platform);
      }

      const registrationRequest: RegistrationRequest = {
        registration: {
          applicationId: config.get('FUSIONAUTH_APP_ID'),
          username: payload.email.split('@')[0],
        },
        sendSetPasswordEmail: false,
        user: {
          username: payload.email.split('@')[0],
          birthDate: payload.dateOfBirth,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          mobilePhone: payload.phoneNumber,
          password: generateRandomPassword(12),
          verified: true,
          active: true,
        },
      };

      const fusionAuthUser = await this.fusionAuthClient.register(newUser.id, registrationRequest);
      if (fusionAuthUser.statusCode !== 200) {
        return responses.conflict(`There was an issue creating your user: ${fusionAuthUser.exception.name}`);
      }

      newUser.id = fusionAuthUser.response?.user?.id;
      newUser = await this.dbConnection.getRepository(User).save(newUser);
      await RoleService.assignRoleToUser({ userId: newUser.id, roleName: 'member' });

      // Micro-service call - need to shift the focus from platfrom to users
      //await this.platformClient.saveFocusesForUser(newUser.id, payload.focusIds, this.logger);

      // await this.dbConnection.getRepository(Invitation).update({ phoneNumber: newUser.phoneNumber }, { signUpComplete: true });

      // Micro-service call - need to shift this call to notifications services, right now at commununication service

      // await this.communicationClient.sendEmailFromTemplate(
      //   [
      //     {
      //       key: 'link_to_application',
      //       value: config.get('RUMOR_WEBSITE') + `users/${newUser.id}/new-applicant`,
      //     },
      //   ],
      //   'Super Admin - New Member Application',
      //   ['admin@therumor.com'],
      //   null,
      //   this.logger,
      // );

      return responses.data(fusionAuthUser.response.token);
    } catch (err) {
      return responses.badRequest(`Unkown error occured, please try again later: ${err}`);
    }
  }

  public static async hostSignUp(payload: HostSignUpRequestDto): Promise<SignUpResponse> {
    try {
      let nonMember: UserRole | null;
      const user = await this.dbConnection.getRepository(User).findOne({
        where: [
          { phoneNumber: payload.phoneNumber, deletedAt: IsNull() },
          { email: payload.email, deletedAt: IsNull() },
        ],
        relations: {
          roles: { role: true },
        },
      });

      if (user) {
        nonMember = user.roles.find((item) => {
          if (item.role.name == 'non_member') return item;
        });
        if (!nonMember) {
          if (user.phoneNumber === payload.phoneNumber) {
            return responses.badRequest('Phone number is already in use, please try with a different phone number.');
          }

          if (user.email === payload.email) {
            return responses.badRequest('Email is already in use, please try with a different email.');
          }
        }
      }

      let newUser = newHost(payload);
      if (nonMember) {
        newUser.id = user.id;
        await RoleService.revokeRoleFromUser({ userId: user.id, roleName: 'non_member' });
      }
      newUser = await this.dbConnection.getRepository(User).save(newUser);

      await RoleService.assignRoleToUser({ userId: newUser.id, roleName: 'host' }, UserSource.SIGN_UP_FORM);

      // Micro-service call

      // await this.communicationClient.sendEmailFromTemplate(
      //   [
      //     {
      //       key: 'first_name',
      //       value: payload?.firstName || '',
      //     },
      //   ],
      //   'Host Application Submitted',
      //   [payload.email],
      //   null,
      //   this.logger,
      // );
      // await this.communicationClient.sendEmailFromTemplate(
      //   [
      //     {
      //       key: 'link_to_application',
      //       value: config.get('RUMOR_WEBSITE') + `hosts/${newUser.id}/new-applicant`,
      //     },
      //   ],
      //   'Super Admin - New Host Application',
      //   ['admin@therumor.com'],
      //   null,
      //   this.logger,
      // );

      return responses.data('');
    } catch (err) {
      return responses.badRequest('Unkown error occured, please try again later.');
    }
  }

  public static async logout(payload: TokenRequestDto): Promise<SignUpResponse> {
    try {
      const response = await this.fusionAuthClient.logout(false, payload.token);
      if (!response.wasSuccessful()) return responses.badRequest('Invalid session token');
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Unkown error occured, please try again later.');
    }
  }

  public static async validatePasswordToken(payload: ValidatePasswordTokenRequestDto): Promise<ValidityResponse> {
    try {
      const temporaryPasswordToken = await this.dbConnection.getRepository(TemporaryPasswordToken).findOne({ where: { token: payload.token } });
      if (!temporaryPasswordToken) return responses.data({ isValid: false });
      const expirationDate = dayjs.utc(temporaryPasswordToken.expiresAt).tz('America/New_York');
      const currentTime = dayjs.utc(new Date()).tz('America/New_York');
      const isValid = dayjs(currentTime).isSameOrBefore(expirationDate);
      return responses.data({ isValid });
    } catch (err) {
      return responses.badRequest('Unknown error occurred, please try again later.');
    }
  }

  public static async setHostPassword(payload: SetHostPasswordRequestDto): Promise<GenericResponse> {
    try {
      if (payload.password !== payload.repeatedPassword) return responses.badRequest('Passwords do not match.');

      const temporaryPasswordToken = await this.dbConnection.getRepository(TemporaryPasswordToken).findOne({
        where: { token: payload.token },
        relations: { user: true },
      });
      if (!temporaryPasswordToken) return responses.badRequest('Unable to set password, please try again later.');

      const expirationDate = dayjs.utc(temporaryPasswordToken.expiresAt).tz('America/New_York');
      const currentTime = dayjs.utc(new Date()).tz('America/New_York');
      const isValid = dayjs(currentTime).isSameOrBefore(expirationDate);
      if (!isValid) return responses.badRequest('Token has expired');

      const temporaryPassword = await this.dbConnection.getRepository(TemporaryPassword).findOne({ where: { user: { id: temporaryPasswordToken.user.id } } });
      if (!temporaryPassword) return responses.badRequest('Unable to set password, please try again later.');

      const user = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: temporaryPasswordToken.user.id,
        },
        relations: {
          temporaryPassword: true,
          temporaryPasswordToken: true,
        },
      });

      const request: ChangePasswordRequest = {
        applicationId: config.get('FUSIONAUTH_APP_ID'),
        loginId: temporaryPasswordToken.user.email,
        currentPassword: temporaryPassword.password,
        password: payload.password,
      };

      await this.fusionAuthClient.changePasswordByIdentity(request);

      // Deleting one-to-one relationships can be tricky, we need to nullify the relationship first before deleting entities.
      // Nullify relationships
      user.temporaryPassword = null;
      user.temporaryPasswordToken = null;
      await this.dbConnection.getRepository(User).save(user);

      // Delete entities successfully
      await this.dbConnection.getRepository(TemporaryPassword).delete(temporaryPassword.id);
      await this.dbConnection.getRepository(TemporaryPasswordToken).delete(temporaryPasswordToken.id);
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Unknown error occurred, please try again later.');
    }
  }

  public static async updateHostPassword(payload: UpdateHostPasswordRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: {
          id: payload.id,
        },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      const hostRole = user.roles.find((role) => role.role.name === 'host' || role.role.name === 'co_host');
      if (hostRole === undefined) return responses.notFound('Host not found');

      const request: ChangePasswordRequest = {
        applicationId: config.get('FUSIONAUTH_APP_ID'),
        loginId: user.email,
        password: payload.newPassword,
      };

      await this.fusionAuthClient.changePasswordByIdentity(request);

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Unkown error occured, please try again later.');
    }
  }

  public static async forgot(payload: ForgotPasswordRequestDto): Promise<ForgotPasswordResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: { email: payload.email, deletedAt: null },
        relations: {
          roles: {
            role: true,
          },
        },
      });
      if (!user) {
        return responses.notFound('No user found');
      }
      const passwordResetRequest: ForgotPasswordRequest = {
        applicationId: config.get('FUSIONAUTH_APP_ID'),
        email: payload.email,
        sendForgotPasswordEmail: false,
      };
      const forgotPasswordResponse = await this.fusionAuthClient.forgotPassword(passwordResetRequest);
      const token = forgotPasswordResponse.response?.changePasswordId;
      if (!token) {
        return responses.badRequest('Unable to call forgot password, please try again later.');
      }
      const redirectPath = `auth/reset-password/${token}`;

      // Micro-service call

      // const mailServiceResponse = await this.communicationClient.sendEmailFromTemplate(
      //   [
      //     {
      //       key: 'user_name',
      //       value: user?.firstName,
      //     },
      //     {
      //       key: 'reset_url',
      //       value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
      //     },
      //   ],
      //   'Reset Password',
      //   [payload.email],
      //   null,
      //   this.logger,
      // );
      // if (!mailServiceResponse) {
      //   return responses.badRequest('Unable to send mail, please try again later.');
      // }
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Unable to call forgot password, please try again later.');
    }
  }

  public static async setPassword(payload: SetHostPasswordRequestDto): Promise<TokenResponse> {
    try {
      const { password, token, repeatedPassword } = payload;
      if (password !== repeatedPassword) return responses.badRequest('Passwords do not match.');
      const changePasswordRequest: ChangePasswordRequest = {
        password: payload.password,
      };
      const fusionAuthResponse = await this.fusionAuthClient.retrieveUserByChangePasswordId(token);
      const email = fusionAuthResponse?.response?.user?.email;
      if (!email) {
        return responses.badRequest('Unable to find user, please try again later.');
      }
      const changePasswordFusionAuthResponse = await this.fusionAuthClient.changePassword(token, changePasswordRequest);
      if (changePasswordFusionAuthResponse?.statusCode !== 200) {
        return responses.badRequest('Unable to reset password, please try again later.');
      }
      return await this.hostLogin({ email, password });
    } catch (err) {
      return responses.badRequest('Unable to reset password, please try again later.');
    }
  }

  public static async loginSSO(): Promise<LoginSSOResponse> {
    try {
      const uri = `${config.get('FUSIONAUTH_BASE_URL')}oauth2/authorize?client_id=${config.get('FUSIONAUTH_APP_ID')}&response_type=code&redirect_uri=${encodeURIComponent(config.get('FUSIONAUTH_GATEWAY_URI') + 'v1/auth/oauth-redirect')}`;

      return responses.data(uri);
    } catch (err) {
      return responses.badRequest('Unable to call login sso, please try again later.');
    }
  }

  public static async oAuthRedirect(payload: OAuthRequestDto): Promise<OAuthRedirectResponse> {
    try {
      const accesToken = await this.fusionAuthClient.exchangeOAuthCodeForAccessToken(
        payload.code,
        config.get('FUSIONAUTH_APP_ID'),
        config.get('FUSIONAUTH_CLIENT_SECRET'),
        config.get('FUSIONAUTH_GATEWAY_URI') + 'v1/auth/oauth-redirect',
      );

      return responses.data(accesToken.response.access_token);
    } catch (err) {
      return responses.badRequest('Invalid SSO sesion redirect.');
    }
  }

  public static async checkPhoneNumber(payload: PhoneNumberRequestDto): Promise<ValidityResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: {
          phoneNumber: payload.phoneNumber,
          deletedAt: IsNull(),
        },
      });
      if (user) return responses.data({ isValid: false });

      //Micro-service call
      //await this.communicationClient.sendVerificationCode(payload.phoneNumber, this.logger);
      return responses.data({ isValid: true });
    } catch (err) {
      return responses.badRequest('Invalid phone number provided.');
    }
  }

  public static async checkEmail(payload: CheckEmailRequestDto): Promise<ValidityResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({ where: { email: payload.email, deletedAt: IsNull() } });
      if (user) return responses.conflict('This email is already taken, please try a different one.');
      return responses.data({ isValid: true });
    } catch (err) {
      return responses.badRequest('Invalid email provided.');
    }
  }

  public static async checkAge(payload: CheckAgeRequestDto): Promise<ValidityResponse> {
    try {
      if (dayjs(new Date()).diff(payload.dateOfBirth, 'year') < 18) {
        return responses.badRequest('Error. Age requirement not met.');
      }
      return responses.data({ isValid: true });
    } catch (err) {
      return responses.badRequest('Error. Age requirement not met.');
    }
  }

  public static async sendInvitations(payload: UserInvitationsRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');

      // const invitations = await Promise.all(
      //   payload.phoneNumbers.map(async (phoneNumber) => {
      //     try {
      //       const existingInvitation = await this.dbConnection.getRepository(Invitation).findOneBy({ phoneNumber });
      //       if (existingInvitation) return existingInvitation;

      //       const invitation = new Invitation();
      //       invitation.phoneNumber = phoneNumber;
      //       invitation.inviteeUser = user;
      //       return await this.dbConnection.getRepository(Invitation).save(invitation);
      //     } catch (err) {
      //       return null;
      //     }
      //   }),
      // );
      //const successfulInvitations = invitations.filter((invitation) => invitation).map((invitation) => invitation.phoneNumber);

      //Micro-service call
      // const success = await this.communicationClient.sendInvitationMessages(successfulInvitations, user.firstName);      
      // if (!success) return responses.badRequest('An error occured while sending invitations, please try again.');

      return responses.ok;
    } catch (err) {
      return responses.badRequest('An error occured while sending invitations, please try again.');
    }
  }

  public static async saveInvitations(payload: UserInvitationsRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');

      // await Promise.all(
      //   payload.phoneNumbers.map(async (phoneNumber) => {
      //     try {
      //       const existingInvitation = await this.dbConnection.getRepository(Invitation).findOneBy({ phoneNumber });
      //       if (existingInvitation) return existingInvitation;

      //       const invitation = new Invitation();
      //       invitation.phoneNumber = phoneNumber;
      //       invitation.inviteeUser = user;
      //       return await this.dbConnection.getRepository(Invitation).save(invitation);
      //     } catch (err) {
      //       return null;
      //     }
      //   }),
      // );
      return responses.ok;
    } catch (err) {
      return responses.badRequest('An error occured while saving invitations, please try again.');
    }
  }

  public static async inviteNewMember(payload: InviteNewMemberRequestDto): Promise<GenericResponse> {
    try {
      const invitee = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!invitee) return responses.notFound('User not found!');

      const existingUser = await this.dbConnection.getRepository(User).findOne({
        where: [{ phoneNumber: payload.phoneNumber }, { email: payload.email }],
      });

      if (existingUser) {
        if (existingUser.phoneNumber === payload.phoneNumber) {
          return responses.badRequest(`Phone number is already in use by ${existingUser.firstName} ${existingUser.lastName}`);
        }

        if (existingUser.email === payload.email) {
          return responses.badRequest(`Email is already in use by ${existingUser.firstName} ${existingUser.lastName}.`);
        }
      }

      // const invitation = new Invitation();
      // invitation.phoneNumber = payload.phoneNumber;
      // invitation.email = payload.email;
      // invitation.referralCode = payload.referralCode;
      // invitation.inviteeUser = invitee;

      // await this.dbConnection.getRepository(Invitation).save(invitation);

      if (payload.phoneNumber) {
        const message =
          `Hi, ${invitee.firstName} would like to invite you to join Rumor. Download the app here. ` +
          (payload.referralCode ? `Referral code: ${payload.referralCode}.` : ``);

        //Micro-service call
        // const success = await this.communicationClient.sendTextMessage(payload.phoneNumber, message);
        // if (!success) {
        //   return responses.badRequest('An error occured while sending SMS invitation, please try again.');
        // }
      }

      if (payload.email) {
        const params = [
          {
            key: 'invitee_first_name',
            value: payload.name,
          },
        ];

        if (payload.referralCode) {
          params.push({
            key: 'referral_code',
            value: payload.referralCode,
          });
        }

        //Micro-service call
        // const success = await this.communicationClient.sendEmailFromTemplate(params, 'Invite New Member', [payload.email], null, this.logger);
        // if (!success) {
        //   return responses.badRequest('An error occured while sending Email invitation, please try again.');
        // }
      }

      return responses.ok;
    } catch (err) {
      return responses.badRequest('An error occured while sending invitation, please try again.');
    }
  }

  public static async inviteNewHost(payload: InviteNewHostRequestDto): Promise<GenericResponse> {
    try {
      const invitee = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!invitee) return responses.notFound('User not found!');

      const whereCondition: FindOptionsWhere<User>[] = [{ email: payload.email }];
      if (payload.phoneNumber) {
        whereCondition.push({ phoneNumber: payload.phoneNumber });
      }

      const existingUser = await this.dbConnection.getRepository(User).findOne({
        where: whereCondition,
      });

      if (existingUser) {
        if (payload.phoneNumber && existingUser.phoneNumber === payload.phoneNumber) {
          return responses.badRequest(`Phone number is already in use by ${existingUser.firstName} ${existingUser.lastName}`);
        }

        if (existingUser.email === payload.email) {
          return responses.badRequest(`Email is already in use by ${existingUser.firstName} ${existingUser.lastName}.`);
        }
      }

      // const invitation = new Invitation();
      // invitation.phoneNumber = payload.phoneNumber;
      // invitation.email = payload.email;
      // invitation.inviteeUser = invitee;

      // await this.dbConnection.getRepository(Invitation).save(invitation);

      const params = [
        {
          key: 'invitee_first_name',
          value: payload.name,
        },
      ];

      // Micro-service call
      // const success = await this.communicationClient.sendEmailFromTemplate(params, 'Host Invited by Rumor Admin', [payload.email], null, this.logger);
      // if (!success) {
      //   return responses.badRequest('An error occured while sending Email invitation, please try again.');
      // }

      return responses.ok;
    } catch (err) {
      return responses.badRequest('An error occured while sending invitation, please try again.');
    }
  }

  public static async saveOrUpdateProvider(payload: SaveOrUpdateProviderAuthRequestDto): Promise<SaveOrUpdateProviderAuthResponse> {
    const payloadClone = { ...payload };
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: {
        id: payload.userId,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      return responses.notFound('Verify user exists and is active.');
    }

    let socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
      where: {
        user: {
          id: payload.userId,
        },
        type: SocialProviderType.GOOGLE,
      },
      relations: ['user'],
    });

    const providerType = providerTypeToEntity[payload.providerType];

    if (!socialProvider) {
      socialProvider = this.dbConnection.getRepository(SocialProvider).create({
        user: user,
        type: providerType,
      });
    }

    delete payloadClone.userId;
    delete payloadClone.providerType;
    for (const [key, val] of Object.entries(payloadClone)) {
      socialProvider[key] = val;
    }

    socialProvider = await socialProvider.save();

    const providerTypeResponse = entityToProviderType[socialProvider.type];

    const resp: ProviderAuth = {
      userId: user.id,
      providerType: providerTypeResponse,
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
  }

  public static async checkMemberLogin(payload: LoginVerificationRequestDto): Promise<ValidityResponse> {
    try {
      const isEmailLogin = !!payload.email;
      const loginIdentifier = isEmailLogin ? payload.email : payload.phoneNumber;

      if (!loginIdentifier) {
        return responses.badRequest('Email or phone number is required.');
      }

      // Search for user by email or phone number
      let user: User | null = null;
      if (isEmailLogin) {
        user = await this.dbConnection.getRepository(User).findOne({
          where: [{ email: payload.email, deletedAt: IsNull() }],
        });
      } else {
        user = await this.dbConnection.getRepository(User).findOne({
          where: [{ phoneNumber: payload.phoneNumber, deletedAt: IsNull() }],
        });
      }

      // Micro-service call
      // if (!user) {
      //   if (isEmailLogin) {
      //     await this.sendVerificationCodeByEmail(payload.email);
      //   } else {
      //     await this.communicationClient.sendVerificationCode(payload.phoneNumber, this.logger);
      //   }
      //   return responses.data({ isValid: false });
      // }

      const request: PasswordlessStartRequest = {
        applicationId: config.get('FUSIONAUTH_APP_ID'),
        loginId: user.email,
      };

      // Remove all previous login attempts (both email and phone)
      const existingLoginAttempts = await this.dbConnection.getRepository(TemporaryLoginCode).find({ where: { phoneNumber: payload.phoneNumber, email: payload.email } });
      // const existingLoginAttempts = await this.dbConnection.getRepository(TemporaryLoginCode).find({ where: { phoneNumber: payload.phoneNumber } });

      if (existingLoginAttempts.length) {
        await Promise.all(
          existingLoginAttempts.map(async (attempt) => {
            await this.dbConnection.getRepository(TemporaryLoginCode).delete(attempt.id);
          }),
        );
      }

      // Start a new login and save the code
      const code = await this.fusionAuthClient.startPasswordlessLogin(request);
      const temporaryLoginCode = new TemporaryLoginCode();
      temporaryLoginCode.email = payload.email;
      temporaryLoginCode.phoneNumber = payload.phoneNumber;
      temporaryLoginCode.code = code.response.code;
      await this.dbConnection.getRepository(TemporaryLoginCode).save(temporaryLoginCode);

      if (isEmailLogin) {
        //TODO: change and proper format

        // Micro-service call
        // await this.communicationClient.sendEmailFromTemplate(
        //   [
        //     {
        //       key: 'first_name',
        //       value: code.response.code,
        //     },
        //   ],
        //   'Host Application Submitted',
        //   [payload.email],
        //   null,
        //   this.logger,
        // );
      } else {
        // Send verification text for phone login unless bypass conditions are met
        if (config.get('APP_REVIEW_PHONE_NUMBER') !== payload.phoneNumber || !config.get('BYPASS_VERIFICATION_CODE')) {
          const message = 'Your Rumor verification code: ' + code.response.code;
          // await this.communicationClient.sendTextMessage(payload.phoneNumber, message, this.logger);
        }
      }

      return responses.data({ isValid: true });
    } catch (err) {
      return responses.badRequest('Invalid email or phone number provided.');
    }
  }

  public static async memberLogin(payload: MemberLoginRequestDto): Promise<TokenResponse> {
    try {
      const isEmailLogin = !!payload.email;
      const loginIdentifier = isEmailLogin ? payload.email : payload.phoneNumber;

      // Search for user by email or phone number
      let user: User | null = null;
      if (isEmailLogin) {
        user = await this.dbConnection.getRepository(User).findOne({
          where: [{ email: payload.email, deletedAt: IsNull() }],
          relations: { roles: { role: true } },
        });
      } else {
        user = await this.dbConnection.getRepository(User).findOne({
          where: [{ phoneNumber: payload.phoneNumber, deletedAt: IsNull() }],
          relations: { roles: { role: true } },
        });
      }

      // If user is not found, verify OTP and create a new user entry
      if (!user && !payload.isExist) {
        const verificationResult = isEmailLogin
        // Micro-servc
        // ? await this.verifyCodeByEmail(payload.email, payload.code)
        // : await this.communicationClient.verifyPhoneNumber(payload.phoneNumber, payload.code, this.logger);

        if (!verificationResult) {
          return responses.notFound('Invalid or expired verification code, please try again.');
        }

        // Check for invitation and set flags
        // const invitation = await this.dbConnection.getRepository(Invitation).findOne({
        //   where: { phoneNumber: payload.phoneNumber, email: payload.email },
        // });
        const isSignUpCompleted = false //invitation?.signUpComplete || false;
        const isInvited = false //!!invitation;

        const role: Role[] = await this.dbConnection.getRepository(Role).find({ where: { name: 'non_member' } });

        return responses.data({
          token: '',
          roles: [
            {
              roleName: role[0].name,
              roleId: role[0].id,
            },
          ],
          isSignUpCompleted,
          isInvited,
        });
      }

      // Handle bypass verification logic for testing or review environment
      if (config.get('APP_REVIEW_LOGIN') === loginIdentifier || config.get('BYPASS_VERIFICATION_CODE')) {
        const temporaryCode = await this.dbConnection.getRepository(TemporaryLoginCode).findOne({ where: { phoneNumber: payload.phoneNumber, email: payload.email } });
        if (!temporaryCode) return responses.notFound('Unable to login, please try again.');

        const completedLogin = await this.fusionAuthClient.passwordlessLogin({ code: temporaryCode.code });
        if (completedLogin.statusCode > 299) {
          return responses.badRequest(`Unable to login: ${completedLogin.exception.message}`);
        }

        await this.dbConnection.getRepository(TemporaryLoginCode).delete(temporaryCode.id);

        return responses.data({
          token: completedLogin.response.token,
          roles: user.roles.map((item) => ({
            roleName: item.role.name,
            roleId: item.role.id,
          })),
        });
      } else {
        const temporaryCode = await this.dbConnection.getRepository(TemporaryLoginCode).findOne({
          where: {
            [isEmailLogin ? 'email' : 'phoneNumber']: loginIdentifier,
            code: payload.code,
          },
        });
        if (!temporaryCode) return responses.notFound('Unable to login, please try again.');

        const completedLogin = await this.fusionAuthClient.passwordlessLogin({ code: payload.code });
        if (completedLogin.statusCode > 299) {
          return responses.badRequest(`Unable to login: ${completedLogin.exception.message}`);
        }

        await this.dbConnection.getRepository(TemporaryLoginCode).delete(temporaryCode.id);

        return responses.data({
          token: completedLogin.response.token,
          roles: user.roles.map((item) => ({
            roleName: item.role.name,
            roleId: item.role.id,
          })),
        });
      }
    } catch (err) {
      return responses.badRequest('Unable to login, please try again.');
    }
  }

  public static async hostLogin(payload: LoginRequestDto): Promise<TokenResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: {
          email: payload.email,
          deletedAt: IsNull(),
          roles: {
            role: {
              name: RoleType.Host,
            },
          },
        },
        relations: {
          roles: { role: true },
        },
      });
      if (!user) return responses.notFound('Host with this email was not found.');

      const request: LoginRequest = {
        loginId: user.email,
        password: payload.password,
      };
      const authenticatedUser = await this.fusionAuthClient.login(request);
      const additionalHostInformation = user.additionalHostInformation;
      return responses.data({
        token: authenticatedUser.response.token,
        roles: user.roles.map((item) => {
          return { roleName: item.role.name, roleId: item.role.id };
        }),
        hostDetails: {
          companyLogo: additionalHostInformation?.companyLogo || '',
          companyName: additionalHostInformation?.companyName || '',
          id: user.id,
        },
      });
    } catch (err) {
      return responses.badRequest(`Unable to login, please try again.`);
    }
  }

  public static async getCurrentMember(payload: IdRequestDto): Promise<MemberResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id },
        relations: { address: true, socialProviders: true, roles: { role: true } },
      });

      if (!user) return responses.notFound('User not found!');

      const memberRole = user.roles.find((role) => role.role.name === 'member');

      if (memberRole === undefined) return responses.notFound('User not found!');

      // Mirco-service call
      // const focuses = await this.platformClient.getUserFocuses(user.id, this.logger);

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });

      return responses.data(toCurrentMember(user, [{ id: "1", name: "focuses" }], memberRole, socialProvider?.username));
    } catch (err) {
      return responses.badRequest('Unable to get user, please try again.');
    }
  }

  public static async getUser(payload: IdRequestDto): Promise<SimpleUserResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id },
        relations: { address: true, socialProviders: true, roles: { role: true } },
      });

      if (!user) return responses.notFound('User not found!');

      const memberRole = user.roles.find((role) => role.role.name === 'member' || role.role.name === 'host');

      if (memberRole === undefined) return responses.notFound('User not found!');

      return responses.data(toSimpleUser(user, memberRole));
    } catch (err) {
      return responses.badRequest('Unable to get user, please try again.');
    }
  }

  public static async getCurrentUser(payload: IdRequestDto): Promise<CurrentUserResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id },
        relations: { address: true, socialProviders: true, roles: { role: true } },
      });
      if (!user) return responses.notFound('User not found!');
      if (!user.roles.length) return responses.forbidden('You do not have sufficient permisissions to access this resource!');

      //Micro-service call
      //const focuses = await this.platformClient.getUserFocuses(user.id, this.logger);
      return responses.data(user.roles.map((role) => toCurrentUser(user, [{ id: "1", name: "focuses" }], role)));
    } catch (err) {
      return responses.badRequest('Unable to get user, please try again.');
    }
  }

  public static async updateUserProfile(payload: UpdateUserProfileRequestDto): Promise<UpdateUserProfileResponse> {
    try {
      const GOOGLE_MAPS_API_KEY = config.get('GOOGLE_MAPS_API_KEY');
      const actualUser = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: null },
        relations: ['address'],
      });
      if (!actualUser) return responses.notFound('User not found!');
      const updateUserPayload: Partial<User> = {};

      for (const [key, val] of Object.entries(payload)) {
        if (key == 'gender') {
          const genderKey = val as keyof typeof genderToEntity;
          updateUserPayload[key] = genderToEntity[genderKey];
        } else if (key == 'birthDate') {
          updateUserPayload.dateOfBirth = payload.birthDate;
        } else if (key !== 'address') {
          updateUserPayload[key] = val;
        }
      }
      //Verify if address is in payload
      if (payload?.address) {
        //Verifies if already or not has the PlaceID

        if (!payload?.address?.placeId) {
          if (payload.address.address) {
            const request = {
              address: {
                regionCode: payload.address.regionCode || 'US',
                addressLines: [payload.address.address],
              },
            };
            //Verifies if it is a valid Place
            const addressValidationClient = new AddressValidationClient({ authClient: this.googleAuthClient });
            const validations = await addressValidationClient.validateAddress(request);
            const addressUserValidated = validations[0]?.result?.address?.formattedAddress || null;
            if (addressUserValidated) {
              //Request for Google Places ID

              const placeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(addressUserValidated)}&inputtype=textquery&fields=place_id&key=${GOOGLE_MAPS_API_KEY}`,
              );
              const placeData = await placeResponse.json();
              const placeId = placeData.candidates[0].place_id;

              const placeLocation = await GoogleAddressClient.geodecodePlaceId(placeId);
              const geoLocation = placeLocation?.results[0]?.geometry?.location;
              const addressComponents = placeLocation?.results[0]?.address_components || [];
              const city = getCityNameFromAddressComponents(addressComponents);

              //Verifies if user already has an id of address
              if (actualUser.address) {
                await this.dbConnection.getRepository(Address).update(
                  { id: actualUser.address.id },
                  {
                    address: payload.address.address,
                    googlePlaceId: placeId,
                    city,
                    latitude: geoLocation?.lat,
                    longitude: geoLocation?.lng,
                  },
                );
                updateUserPayload.address = actualUser.address;
              } else {
                const savedAddress = this.dbConnection.getRepository(Address).create({
                  address: payload.address.address,
                  googlePlaceId: placeId,
                  city,
                  latitude: geoLocation?.lat,
                  longitude: geoLocation?.lng,
                });
                const saved = await this.dbConnection.getRepository(Address).save(savedAddress);
                updateUserPayload.address = saved;
              }
            }
          }
        } else {
          //Gets the address based on Google place id
          const placeResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${payload.address.placeId}&key=${GOOGLE_MAPS_API_KEY}`);
          const placeDetailsData = await placeResponse.json();
          const placeId = payload.address.placeId;

          const placeLocation = await GoogleAddressClient.geodecodePlaceId(placeId);
          const geoLocation = placeLocation?.results[0]?.geometry?.location;
          const addressComponents = placeLocation?.results[0]?.address_components || [];
          const city = getCityNameFromAddressComponents(addressComponents);

          //Verifies if user already has a place to update
          if (actualUser.address) {
            await this.dbConnection.getRepository(Address).update(
              { id: actualUser.address.id },
              {
                address: placeDetailsData.result.formatted_address,
                googlePlaceId: placeId,
                city,
                latitude: geoLocation?.lat,
                longitude: geoLocation?.lng,
              },
            );
            updateUserPayload.address = actualUser.address;
          } else {
            const savedAddress = this.dbConnection.getRepository(Address).create({
              address: placeDetailsData.result.formatted_address,
              googlePlaceId: placeId,
              city,
              latitude: geoLocation?.lat,
              longitude: geoLocation?.lng,
            });
            const saved = await this.dbConnection.getRepository(Address).save(savedAddress);
            updateUserPayload.address = saved;
          }
        }
      }

      await this.dbConnection.getRepository(User).update({ id: payload.id }, updateUserPayload);
      const responseUser = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: null },
        relations: {
          address: true,
          roles: {
            role: true,
          },
        },
      });

      const memberRole = responseUser.roles.find((role) => role.role.name === 'member');
      if (memberRole === undefined) return responses.notFound('User not found!');

      return responses.data({
        firstName: responseUser.firstName || null,
        email: responseUser.email || null,
        lastName: responseUser.lastName || null,
        dateOfBirth: responseUser.dateOfBirth || null,
        phoneNumber: responseUser.phoneNumber || null,
        gender: entityToGender[responseUser.gender || 'NOT_APPLICABLE'],
        status: entityToUserStatus[memberRole.status],
        source: memberRole.source ? entityToUserSource[memberRole.source] : null,
        address: responseUser.address
          ? {
            id: responseUser.address.id,
            address: responseUser.address?.address,
            googlePlaceId: responseUser.address.googlePlaceId,
            latitude: String(responseUser.address.latitude),
            longitude: String(responseUser.address.longitude),
            city: responseUser.address.city,
          }
          : null,
      });
    } catch (err) {
      return responses.badRequest('Unknown error occurred, please try again later.');
    }
  }

  public static async updateUserProfilePicture(payload: UpdateUserProfilePictureRequestDto): Promise<UpdateUserProfilePictureResponse> {
    try {
      let actualUser = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: null },
        relations: ['address'],
      });
      if (!actualUser) return responses.notFound('User not found!');
      await this.dbConnection.getRepository(User).update(
        { id: payload.id },
        {
          profilePicture: payload.profilePicture,
        },
      );
      actualUser = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: null },
        relations: ['address'],
      });
      return responses.data({ profilePicture: actualUser.profilePicture });
    } catch (err) {
      return responses.badRequest('Unkown error occured, please try again later.');
    }
  }

  public static async getBioProfile(payload: IdRequestDto): Promise<BioProfileResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.id });
      if (!user) return responses.notFound('User not found!');
      const additionalInfo = user.additionalHostInformation;
      return responses.data(additionalInfo);
    } catch (err) {
      return responses.badRequest('Error at get bio profile.');
    }
  }

  public static async createBioProfile(payload: BioProfileRequestDto): Promise<BioProfileResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');
      const { bio } = payload;
      let additionalInfo: AdditionalHostInformation;
      if (user.additionalHostInformation) {
        additionalInfo = user.additionalHostInformation;
        additionalInfo.bio = bio;
        user.additionalHostInformation = additionalInfo;
      } else {
        additionalInfo = {
          bio,
          companyName: '',
          companyLogo: '',
          eventsPerYear: 0,
          website: '',
          referredBy: '',
          socialMedia: {},
        };

        user.additionalHostInformation = additionalInfo;
      }
      await user.save();
      return responses.data(additionalInfo);
    } catch (err) {
      return responses.badRequest('Error at create bio profile.');
    }
  }

  public static async updateBioProfile(payload: BioProfileRequestDto): Promise<BioProfileResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
      if (!user) return responses.notFound('User not found!');
      const { bio } = payload;
      let additionalInfo: AdditionalHostInformation;
      if (user.additionalHostInformation) {
        additionalInfo = user.additionalHostInformation;
        additionalInfo.bio = bio;
        user.additionalHostInformation = additionalInfo;
      } else {
        additionalInfo = {
          bio,
          companyName: '',
          companyLogo: '',
          eventsPerYear: 0,
          website: '',
          referredBy: '',
          socialMedia: {},
        };

        user.additionalHostInformation = additionalInfo;
      }
      await user.save();
      return responses.data(additionalInfo);
    } catch (err) {
      return responses.badRequest('Error at update bio profile.');
    }
  }

  public static async approveMember(payload: IdRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: null },
        relations: { roles: { role: true } },
      });
      if (!user) return responses.notFound('User not found!');

      const memberRole = user.roles.find((role) => role.role.name === 'member');
      if (memberRole === undefined) return responses.notFound('User not found!');

      await RoleService.updateUserStatus(memberRole.id, UserStatus.ACTIVE);
      await user.save();
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at active user.');
    }
  }

  public static async listUsersByType(payload: ListUsersByTypeRequestDto): Promise<ListUsersByTypeResponse> {
    try {
      const users = await this.dbConnection.getRepository(User).find({
        where: {
          deletedAt: null,
          roles: {
            role: {
              name: payload.type,
            },
          },
        },
      });
      const userList = users.map((user) => {
        return toUserDataSimple(user);
      });
      return responses.data(userList);
    } catch (err) {
      return responses.badRequest('Error at get user list.');
    }
  }

  public static async createNonMemberUser(payload: CreateNonMemberUserRequestDto): Promise<CreateNonMemberUserResponse> {
    try {
      const exists = await this.dbConnection.getRepository(User).findOne({ where: [{ email: payload.email }, { phoneNumber: payload.phoneNumber }] });
      if (exists) return responses.badRequest('User already exists');
      let user = new User();
      user.email = payload.email;
      user.firstName = payload.firstName || 'NA';
      user.lastName = payload.lastName || 'NA';
      user.phoneNumber = payload.phoneNumber || '';
      user = await this.dbConnection.getRepository(User).save(user);
      await RoleService.assignRoleToUser({ userId: user.id, roleName: 'non_member' });
      return responses.data({ userId: user.id });
    } catch (err) {
      return responses.badRequest('Error at get user list.');
    }
  }

  public static async getMembersOrNonMembers(payload: ListUsersInviteesDto): Promise<GetMembersResponse> {
    const parsedQuery = parse(payload.query) as ParsedQs;
    const hostId = payload.userId;
    const pagination = hasPagination(parsedQuery)
      ? {
        take: parseInt(parsedQuery.take),
        skip: parseInt(parsedQuery.skip),
      }
      : {};
    const where: unknown = { deletedAt: null };
    let customListName = parsedQuery.customListName;
    if (typeof customListName === 'string' && customListName.trim() !== '') {
      customListName = customListName.trim();
    } else {
      customListName = null;
    }
    if (customListName && customListName.length) {
      if (typeof customListName === 'string') {
        const customList = await this.dbConnection.getRepository(HostCustomUsersLists).findOne({
          where: { listName: customListName },
          relations: ['users'],
        });
        if (customList) {
          const customListUserIds = customList.usersLists.map((listUser) => listUser.user.id);
          const existingUserIds = Array.isArray(parsedQuery.usersIds)
            ? parsedQuery.usersIds.filter((id): id is string => typeof id === 'string')
            : typeof parsedQuery.usersIds === 'string'
              ? parsedQuery.usersIds.split(',')
              : [];

          parsedQuery.usersIds = [...existingUserIds, ...customListUserIds];
        }
      }
    }
    const followed = parsedQuery.followed === 'true' ? true : parsedQuery.followed === 'false' ? false : false;
    const favorite = parsedQuery.favorite === 'true' ? true : parsedQuery.favorite === 'false' ? false : false;
    if (followed) {
      where['following'] = { host: { id: hostId } };
    }
    if (favorite) {
      where['favoritedByHosts'] = { host: { id: hostId } };
    }
    if (parsedQuery.usersIds) {
      where['id'] = In(
        String(parsedQuery.usersIds)
          .split(',')
          .map((id) => id.trim()),
      );
    }
    let users = await this.dbConnection.getRepository(User).find({
      where,
      relations: {
        roles: { role: true },
        socialProviders: true,
        address: true,
        socialStats: true,
      },
      ...pagination,
    });
    users = users.filter(
      (user) => user.roles.find((role) => role.role.name === 'member' && role.status === 'ACTIVE') || user.roles.find((role) => role.role.name === 'non_member'),
    );
    const members = await Promise.all(
      users.map(async (user) => {

        // Micro-service call
        // const focuses = await this.platformClient.getUserFocuses(user.id, this.logger);
        // const interests = await this.platformClient.getUserInterests(user.id, this.logger);


        const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
          where: {
            user: {
              id: user.id,
            },
            type: SocialProviderType.FACEBOOK,
          },
          relations: ['user'],
        });

        return toMember(user, [], [], user.roles[0], undefined, socialProvider?.username);

        //return toMember(user, focuses, interests, user.roles[0], undefined, socialProvider?.username);
      }),
    );
    return responses.data(members);
  }

  public static async manageFollowHost(payload: ManageFollowHostRequestDto): Promise<GenericResponse> {
    try {
      const { userId, hostId, follow } = payload;

      const [follower, host] = await this.findUsers(userId, hostId);
      if (!follower) return responses.notFound('User not found!');
      if (!host) return responses.notFound('Host not found!');
      const validateRoleHost = host.roles.find((role) => role.role.name === 'host');
      if (!validateRoleHost) return responses.notFound('User is not a host!');
      if (follower.id === host.id) return responses.badRequest('You cannot follow yourself!');

      const followHost = await this.dbConnection.getRepository(HostFollowing).findOne({
        where: {
          follower: { id: follower.id },
          host: { id: host.id },
        },
      });

      if (follow) {
        if (followHost) return responses.badRequest('You are already following this host!');
        await this.addFollowHost(follower, host);
      } else {
        if (!followHost) return responses.badRequest('You are not following this host!');
        await this.dbConnection.getRepository(HostFollowing).delete({ follower, host });
      }

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at follow user.');
    }
  }

  public static async findUsers(userId: string, hostId: string): Promise<[User, User]> {
    const follower = await this.dbConnection.getRepository(User).findOne({
      where: { id: userId },
      relations: { roles: { role: true } },
    });

    const host = await this.dbConnection.getRepository(User).findOne({
      where: { id: hostId },
      relations: { roles: { role: true } },
    });
    return [follower, host];
  }

  public static async addFollowHost(follower: User, host: User): Promise<void> {
    const followHost = { follower, host }
    await this.dbConnection.getRepository(HostFollowing).save(followHost);
  }

  public static async addFavoriteHost(member: User, host: User): Promise<void> {
    try {
      const favoriteHost = { member, host }
      await this.dbConnection.getRepository(HostFavorite).save(favoriteHost);
    } catch (err) {
      console.log("🚀 ~ AuthService ~ addFavoriteHost ~ err:", err)
    }
  }

  public static async getFollowedHosts(payload: PaginatedRequestDto): Promise<GetFollowedHostsResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
      const name = parsedQuery?.name ? String(parsedQuery.name).toLowerCase() : undefined;

      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.userId },
        relations: { following: { host: true } },
      });

      if (!user) return responses.notFound('User not found!');

      const followingIds = user.following.map((follow) => follow.host.id);

      let hostsFollowing = await this.dbConnection.getRepository(User).find({
        where: [{ id: In(followingIds) }],
        relations: { roles: { role: true } },
        take,
        skip,
      });

      hostsFollowing = hostsFollowing.filter((host) => host.roles.some((role) => role.role.name === 'host'));

      const transformedHosts = hostsFollowing.map((item) => {
        const hostProfile = toBasicHostProfile(
          item,
          entityToUserStatus[item.roles.find((el) => el.role.name === 'host').status],
          entityToUserSource[item.roles.find((el) => el.role.name === 'host').source],
        );

        return hostProfile;
      });

      if (name) {
        return responses.data({
          hosts: transformedHosts.filter((host) => host.companyName.toLowerCase().includes(name)).slice(skip, skip + take),
        });
      }

      return responses.data({ hosts: transformedHosts });
    } catch (err) {
      return responses.badRequest('Error at get follow hosts.');
    }
  }

  public static async getCustomUsersLists(payload: CustomUsersListRequestDto): Promise<CustomUsersListsResponse> {
    const { userId } = payload;
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined; try {


      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: userId },
        relations: {
          customLists: { usersLists: true },
          favoritedMembers: true,
          followers: true,
        },
        order: {
          customLists: { createdAt: 'DESC' },
        },
      });

      if (!user) {
        return responses.data({ count: 0, list: [] });
      }

      const allLists = [
        { id: null, name: 'Followed', count: user.followers.length, users: [] },
        { id: null, name: 'Favorite', count: user.favoritedMembers.length, users: [] },
        ...user.customLists.map((list) => ({
          id: list.id,
          name: list.listName,
          count: list.usersLists.length,
          users: [],
        })),
      ];

      return responses.data({
        count: allLists.length,
        list: allLists.slice(skip, take ? skip + take : undefined),
      });

    } catch (err) {
      return responses.badRequest('Error at get custom users list.');
    }
  }

  public static async getCustomUsersList(payload: CustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    const parsedQuery = parse(payload.query) as ParsedQs;
    const customListId = payload.id;
    const hostId = payload.userId;
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const type = parsedQuery?.type;
    const gender = parsedQuery?.gender;
    const focuses = parsedQuery.category;
    const baseCity = parsedQuery.basecity;
    const interest = parsedQuery.interest;
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: hostId, deletedAt: IsNull() },
      relations: {
        customLists: {
          usersLists: {
            user: {
              address: true,
              roles: { role: true },
              socialProviders: true,
              hostedEvents: true,
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const customList = user.customLists.find((list) => list.id === customListId);
    if (!customList) {
      throw new NotFoundError("CustomList");
    }

    const userIds = customList.usersLists.map((listUser) => listUser.user.id);
    const queryBuilder = this.dbConnection.getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('user.socialProviders', 'socialProviders')
      .leftJoinAndSelect('user.hostedEvents', 'hostedEvents')
      .innerJoin('host_custom_users_lists_users', 'usersList', 'user.id = usersList.user_id')
      .innerJoin('host_custom_users_lists', 'customList', 'usersList.list_id = customList.id')
      .where('customList.host_id = :hostId', { hostId: hostId })
      .andWhere('customList.id = :listId', { listId: customListId });

    let userTypes: string[] = [];
    if (type && typeof type === 'string') {
      userTypes = type.split(',').map((name) => name.trim());
    }
    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.addOrderBy('user.firstName', sortDirection).addOrderBy('user.lastName', sortDirection);
    } else {
      queryBuilder.orderBy('usersList.createdAt', 'DESC');
    }
    await this.applyUserFilters(queryBuilder, parsedQuery, searchValue, focuses, interest, gender, baseCity, hostId, userTypes);

    const [allUsers, totalCount] = await queryBuilder.getManyAndCount();
    let paginatedUsers = allUsers;
    if (take !== undefined && skip !== undefined) {
      paginatedUsers = allUsers.slice(skip, skip + take);
    }


    const favorites = await this.dbConnection.getRepository(HostFavorite).find({
      where: { host: { id: hostId } },
      relations: ['member'],
    });
    const favoriteUserIds = favorites.map((fav) => fav.member.id);
    this.dbConnection.getRepository(HostCustomUsersListsUsers).find
    const userMappingIds = await this.dbConnection.getRepository(HostCustomUsersListsUsers).find({
      where: {
        list: { id: customListId },
        user: In(userIds),
      },
      relations: ['user'],
      select: ['id', 'user'],
    });

    const mappingIdMap: { [key: string]: string } = {};
    userMappingIds.forEach((mapping) => {
      mappingIdMap[mapping.user.id] = mapping.id;
    });

    const users = await Promise.all(
      paginatedUsers.map(async (user) => {
        const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), user.id);
        const interests = await serviceMesh.getUserInterests(config.get('API_BASE_URL'), user.id);

        const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
          where: {
            user: {
              id: user.id,
            },
            type: SocialProviderType.INSTAGRAM,
          },
          relations: ['user'],
        });

        const socialProviderUsername = socialProvider?.username || null;

        const userData = toUser(user, focuses, interests, user.roles[0], {
          INSTAGRAM: socialProviderUsername,
        });
        userData.isFavourite = favoriteUserIds.includes(user.id);
        const mappingId = mappingIdMap[user.id];
        userData.listMappingId = mappingId;
        return userData;
      }),
    );

    return responses.data({
      name: customList.listName,
      id: customList.id,
      count: totalCount,
      users: users,
    });
  }

  public static async deleteCustomUsersList(payload: UserAndIdRequestDto): Promise<GenericResponse> {
    const { userId, id } = payload;

    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: { customLists: true },
    });
    if (!user) {
      throw new NotFoundError("User");
    }
    const customList = user.customLists.find((list) => list.id === id);
    if (!customList) {
      throw new NotFoundError("Custom List");
    }
    await this.dbConnection.getRepository(HostCustomUsersLists).delete({ id: customList.id });
    return responses.ok;
  }

  public static async createCustomUsersList(payload: ManageCustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    const { userId, customName, userIds } = payload;
    if (!customName) {
      return responses.badRequest('Custom list name is required.');
    }
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: { customLists: true },
    });
    if (!user) {
      throw new NotFoundError("User");
    }
    const existingList = user.customLists.find((list) => list.listName === customName);
    if (existingList) {
      throw new BadRequestError("existingList");
    }
    const validUsers = await this.dbConnection.getRepository(User).find({
      where: { id: In(userIds) },
    });
    if (validUsers.length !== userIds.length) {
      throw new BadRequestError("userIds");
    }

    const customList = new HostCustomUsersLists();
    customList.listName = customName;
    customList.host = user;
    const savedCustomList = await this.dbConnection.getRepository(HostCustomUsersLists).save(customList);
    const userListEntries = validUsers.map((validUser) => {
      const listUser = new HostCustomUsersListsUsers();
      listUser.user = validUser;
      listUser.list = customList;
      return listUser;
    });

    await this.dbConnection.getRepository(HostCustomUsersListsUsers).save(userListEntries);

    const customListSaved = await this.getCustomUsersList({
      userId: userId,
      id: savedCustomList.id,
      query: 'take=10&skip=0',
    });
    return responses.data(customListSaved.data);

  }

  public static async updateCustomUsersList(payload: UpdateCustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    const { hostId, name, userIds, customListId, mappingIds } = payload;
    if (!name) {
      throw new BadRequestError("CustomName");
    }
    const host = await this.dbConnection.getRepository(User).findOne({
      where: { id: hostId, deletedAt: IsNull() },
      relations: { customLists: { usersLists: { user: true } } },
    });
    if (!host) {
      throw new NotFoundError("Host");
    }
    const customList = host.customLists.find((list) => list.id === customListId);
    if (!customList) {
      throw new NotFoundError("customList");
    }

    if (customList.listName !== name) {
      customList.listName = name;
      await this.dbConnection.getRepository(HostCustomUsersLists).save(customList);
    }

    const existingUserIds = customList.usersLists.map((listUser) => listUser.user.id);
    const userIdsToAdd = userIds.filter((id) => !existingUserIds.includes(id));

    if (userIdsToAdd.length) {
      const validUsers = await this.dbConnection.getRepository(User).find({ where: { id: In(userIdsToAdd) } });

      if (validUsers.length !== userIdsToAdd.length) {
        throw new NotFoundError("InvalidIds");
      }

      const userListEntries = validUsers.map((validUser) => {
        const listUser = new HostCustomUsersListsUsers();
        listUser.user = validUser;
        listUser.list = customList;
        return listUser;
      });

      await this.dbConnection.getRepository(HostCustomUsersListsUsers).save(userListEntries);
    }

    if (mappingIds.length) {
      const existingMappings = await this.dbConnection.getRepository(HostCustomUsersListsUsers).find({
        where: { id: In(mappingIds) },
      });

      const existingMappingIds = existingMappings.map((mapping) => mapping.id);
      const invalidMappingIds = mappingIds.filter((id) => !existingMappingIds.includes(id));

      if (invalidMappingIds.length) {
        throw new NotFoundError("invalidMappingIds");
      }

      await this.dbConnection.getRepository(HostCustomUsersListsUsers).delete({
        id: In(existingMappingIds),
      });
    }

    const customListSaved = await this.getCustomUsersList({
      userId: hostId,
      id: customList.id,
      query: 'take=10&skip=0',
    });
    return responses.data(customListSaved.data);
  }

  public static async manageFavoriteUser(payload: ManageFavoriteUserRequestDto): Promise<GenericResponse> {
    try {
      const { userId, targetUserId, favorite } = payload;

      const [targetUser, host] = await this.findUsers(targetUserId, userId);
      if (!targetUser) return responses.notFound('User not found!');
      if (!host) return responses.notFound('Host not found!');
      const validateRoleHost = host.roles.find((role) => role.role.name === 'host');
      if (!validateRoleHost) return responses.notFound('User is not a host!');
      if (targetUser.id === host.id) return responses.badRequest('You cannot mark yourself as favorite!');

      const favoriteByHosts = await this.dbConnection.getRepository(HostFavorite).findOne({
        where: {
          member: { id: targetUser.id },
          host: { id: host.id },
        },
      });

      if (favorite) {
        if (favoriteByHosts) return responses.badRequest('You already marked this user as favorite!');
        await this.addFavoriteHost(targetUser, host);
      } else {
        if (!favoriteByHosts) return responses.badRequest('User was not found in your favorite list!');
        await this.dbConnection.getRepository(HostFavorite).delete({ member: targetUser, host });
      }
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at favorite user.');
    }
  }

  public static async getFavoriteUsers(payload: PaginatedRequestDto): Promise<GetMembersResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
      const name = parsedQuery?.name ? parsedQuery.name : undefined;
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.userId },
        relations: { favoritedMembers: { member: true } },
      });
      if (!user) return responses.badRequest('User not found!');
      const favoriteIds = user.favoritedMembers.map((favorite) => favorite.member.id);
      const whereCondition: any = { id: In(favoriteIds) };
      if (name) {
        whereCondition.firstName = ILike(`%${name}%`);
      }
      const favoriteUsers = await this.dbConnection.getRepository(User).find({
        where: [whereCondition, { lastName: ILike(`%${name}%`) }],
        relations: {
          address: true,
          roles: { role: true },
          socialProviders: true,
          hostedEvents: true,
          socialStats: true,
        },
        take,
        skip,
      });
      const members = await Promise.all(
        favoriteUsers.map(async (user) => {

          //Micro-service call
          // const focuses = await this.platformClient.getUserFocuses(user.id, this.logger);
          // const interests = await this.platformClient.getUserInterests(user.id, this.logger);

          const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
            where: {
              user: {
                id: user.id,
              },
              type: SocialProviderType.FACEBOOK,
            },
            relations: ['user'],
          });

          return toMember(user, [], [], user.roles[0], undefined, socialProvider?.username);
          //return toMember(user, focuses, interests, user.roles[0], undefined, socialProvider?.username);
        }),
      );
      return responses.data(members);
    } catch (err) {
      return responses.badRequest('Error at get favorite users.');
    }
  }

  public static async getConfirmedMembers(payload: ContactsListRequestDto): Promise<ConfirmedMembersResponse> {
    try {
      const emails = payload.contacts.filter((c) => c.indexOf('@') > 0);
      const phoneNumbers = payload.contacts.filter((c) => c.indexOf('@') < 0);

      const queryBuilder = this.dbConnection.getRepository(User).createQueryBuilder('user').innerJoinAndSelect('user.roles', 'user_role');

      if (emails.length > 0 && phoneNumbers.length > 0) {
        queryBuilder.where(
          new Brackets((qb) => {
            qb.where('user.email IN (:...emails)', { emails }).orWhere('user.phone_number IN (:...numbers)', { numbers: phoneNumbers });
          }),
        );
      } else if (phoneNumbers.length > 0) {
        queryBuilder.where('user.phone_number IN (:...phoneNumbers)', { phoneNumbers });
      } else {
        queryBuilder.where('user.email IN (:...emails)', { emails });
      }

      queryBuilder.andWhere('user_role.status = :memberStatus', { memberStatus: UserStatus.ACTIVE });

      const users = await queryBuilder.getMany();

      if (!users || users.length == 0) {
        return responses.notFound('No members found');
      }

      const members = users.map(toConfirmedMember);

      return responses.data(members);
    } catch (err) {
      return responses.badRequest(`Unkown error occured, please try again later: ${err}`);
    }
  }

  public static async getUserWithRolesByEmail(payload: GetUserWithRolesByEmailRequestDto): Promise<GetUserWithRolesByEmailResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: { email: payload.email, deletedAt: null },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      if (!user) {
        return responses.notFound('No user found');
      }

      return responses.data({
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        id: user.id,
        profilePicture: user.profilePicture,
        roles: user.roles.map((item) => {
          return {
            name: item.role.name,
            status: item.status,
            id: item.role.id,
          };
        }),
      });
    } catch (err) {
      {
        return responses.badRequest(`Unkown error occured, please try again later: ${err}`);
      }
    }
  }

  /**
   * Functionality to create an invited guest as a user with the non_member role if they don't exist.
   * Logic:
   *    1. Check if user exists by email/phone.
   *    2. If found, return as SimpleUserResponse.
   *    3. If not found, create as nonmember and return as SimpleUserResponse.
   * @param payload
   * @returns SimpleUserResponse
   */
  public static async registerInvitesAsNonMember(payload: NonMemberSignUpRequestDto): Promise<SimpleUserResponse> {
    try {
      let user: User | null = null;
      const userFindOptionWhere: FindOptionsWhere<User>[] = [];
      if (payload.email) {
        userFindOptionWhere.push({ email: payload.email, deletedAt: IsNull() });
      } else {
        userFindOptionWhere.push({ phoneNumber: payload.phoneNumber, deletedAt: IsNull() });
      }
      user = await this.dbConnection.getRepository(User).findOne({ where: userFindOptionWhere });

      const newUser: User | null = new User();
      if (!user) {
        newUser.email = payload.email;
        newUser.firstName = payload.firstName;
        newUser.lastName = payload.lastName;
        newUser.phoneNumber = payload.phoneNumber;
        this.dbConnection.getRepository(User).create(newUser);
        user = await this.dbConnection.getRepository(User).save(newUser);
        await RoleService.assignRoleToUser({ userId: user.id, roleName: RoleType.NonMember });
      }

      return responses.data(toSimpleUser(user));
    } catch (err: any) {
      return responses.badRequest(`Unkown error occured, please try again later: ${err}`);
    }
  }

  public static async createUser(payload: NonMemberSignUpRequestDto): Promise<UserResponseData> {
    // Check if the user exists by email or phone concurrently
    const [userByEmail, userByPhone] = await Promise.all([
      payload.email ? this.dbConnection.getRepository(User).findOne({ where: { email: payload.email, deletedAt: IsNull() } }) : null,
      payload.phoneNumber ? this.dbConnection.getRepository(User).findOne({ where: { phoneNumber: payload.phoneNumber, deletedAt: IsNull() } }) : null
    ]);
    const hasEmail = !!userByEmail;
    const hasPhone = !!userByPhone;
    // If user exists by either email or phone
    if (userByEmail || userByPhone) {
      const existingUser = userByEmail || userByPhone;
      const existingMapping = await this.dbConnection.getRepository(HostUserMapping).find({
        where: { host: { id: payload.id }, user: { id: existingUser.id } },
      });

      if (existingMapping.length > 0) {
        return {
          message: 'User already exists',
          hasEmail,
          hasPhone,
          user: toCreateUser(existingUser),
        };
      }

      const host = await this.dbConnection.getRepository(User).findOne({ where: { id: payload.id } });
      const hostCreated = this.dbConnection.getRepository(HostUserMapping).create({
        user: existingUser,
        host: host,
      });

      await this.dbConnection.getRepository(HostUserMapping).save(hostCreated);

      return {
        message: 'User created successfully.',
        hasEmail,
        hasPhone,
        user: toCreateUser(existingUser),
      };
    }
    // If user doesn't exist, create a new user
    const newUser = this.dbConnection.getRepository(User).create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
    });

    const user = await this.dbConnection.getRepository(User).save(newUser);
    const host = await this.dbConnection.getRepository(User).findOne({ where: { id: payload.id } });

    const hostCreated = this.dbConnection.getRepository(HostUserMapping).create({
      user: user,
      host: host,
    });

    await this.dbConnection.getRepository(HostUserMapping).save(hostCreated);
    await RoleService.assignRoleToUser({ userId: user.id, roleName: RoleType.NonMember });

    return {
      message: 'User created successfully.',
      hasEmail,
      hasPhone,
      user: toCreateUser(user),
    };
  }

  public static async sendVerificationCodeByEmail(email: string): Promise<GenericResponse> {
    try {
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Micro-service Call
      // Send the verification code to the user's email
      // await this.communicationClient.sendEmailFromTemplate(
      //   [
      //     {
      //       key: 'first_name',
      //       value: verificationCode,
      //     },
      //   ],
      //   'Host Application Submitted',
      //   [email],
      //   null,
      //   this.logger,
      // );

      // Save the verification code and email into the TemporaryLoginCode entity
      const temporaryLoginCode = new TemporaryLoginCode();
      temporaryLoginCode.email = email;
      temporaryLoginCode.code = verificationCode;
      await this.dbConnection.getRepository(TemporaryLoginCode).save(temporaryLoginCode);

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Unknown error occurred, please try again');
    }
  }

  public static async verifyCodeByEmail(email: string, code: string) {
    try {
      // Retrieve the stored code from the database for the given email
      const storedCodeRecord = await this.dbConnection.getRepository(TemporaryLoginCode).findOne({
        where: { email },
      });

      if (!storedCodeRecord) {
        return responses.badRequest('Verification code not found or expired');
      }

      const isValid = storedCodeRecord.code === code;

      if (isValid) {
        await this.dbConnection.getRepository(TemporaryLoginCode).remove(storedCodeRecord);
      }

      return isValid;
    } catch (err) {
      return responses.badRequest('Unknown error occurred, please try again');
    }
  }

  public static async getAllusers(payload: ListUsersInviteesDto): Promise<GetUsersResponse> {
    const parsedQuery = parse(payload.query) as ParsedQs;
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const eventId = parsedQuery?.eventId;
    const hostId = payload.userId;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const type = parsedQuery?.type;
    const gender = parsedQuery?.gender;
    const focuses = parsedQuery.category;
    const baseCity = parsedQuery.basecity;
    const interest = parsedQuery.interest;
    const customListName = parsedQuery.list;
    const customListId = parsedQuery?.customListId ? (parsedQuery.customListId as string) : undefined;
    const systemDefaultLists = ['myFavourites-systemDefault', 'myFollowers-systemDefault'];
    let favorite = false;
    let followed = false;
    let customListNames: string[] = [];
    if (customListName && customListName.length) {
      if (customListName && typeof customListName === 'string') {
        const allListNames = customListName.split(',').map((name) => name.trim());
        // Separate system default lists and update customListName
        const separatedLists = allListNames.filter((item) => systemDefaultLists.includes(item));
        customListNames = allListNames.filter((item) => !systemDefaultLists.includes(item));
        favorite = separatedLists.includes('myFavourites-systemDefault');
        followed = separatedLists.includes('myFollowers-systemDefault');
      }
    }

    const idsResult = await this.dbConnection.getRepository(HostUserMapping).find({
      where: { host: { id: hostId } },
      relations: ['user'],
    });
    const ids = idsResult.map((result) => result.user.id);

    const usersQuery = this.dbConnection.getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'userRole')
      .innerJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('user.socialProviders', 'socialProvider')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .leftJoinAndSelect('user.address', 'address')
      .where('user.deletedAt IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('role.name = :roleName', { roleName: 'member' }).orWhere(
            new Brackets((subQb) => {
              subQb.where('role.name = :nonMemberRole', { nonMemberRole: 'non_member' });
              if (ids.length > 0) {
                subQb.andWhere('user.id IN (:...ids)', { ids });
              } else {
                subQb.andWhere('user.id IS NULL');
              }
            }),
          );
        }),
      )
      .skip(skip)
      .take(take);
    if (eventId) {
      usersQuery.andWhere(
        `NOT EXISTS (
            SELECT 1 FROM guest WHERE guest.user_id = user.id AND guest.event_id = :eventId
          )`,
        { eventId },
      );
    }
    let userTypes = [];
    if (type && typeof type === 'string') {
      userTypes = type.split(',').map((name) => name.trim());
    }
    if (userTypes.length) {
      usersQuery.andWhere(
        new Brackets((qb) => {
          qb.where('role.name IN (:...roleNames)', { roleNames: userTypes }); // Separate condition for userTypes
        }),
      );
    }

    // Apply OR conditions for followed, favorite, and custom lists
    if (favorite || followed || customListNames.length > 0) {
      usersQuery.andWhere(
        new Brackets((qb) => {
          if (favorite) {
            qb.orWhere((subQb) => {
              const subQuery = subQb
                .subQuery()
                .select('hostFavorite.member.id')
                .from(HostFavorite, 'hostFavorite')
                .where('hostFavorite.host.id = :hostId', { hostId })
                .getQuery();
              return `user.id IN ${subQuery}`;
            });
          }
          if (followed) {
            qb.orWhere((subQb) => {
              const subQuery = subQb
                .subQuery()
                .select('hostFollow.follower.id')
                .from(HostFollowing, 'hostFollow')
                .where('hostFollow.host.id = :hostId', { hostId })
                .getQuery();
              return `user.id IN ${subQuery}`;
            });
          }
          if (customListNames.length > 0) {
            qb.orWhere((subQb) => {
              const subQuery = subQb
                .subQuery()
                .select('listUsers.id')
                .from(HostCustomUsersLists, 'customList')
                .innerJoin('customList.users', 'listUsers')
                .where('customList.listName IN (:...customListNames)', { customListNames })
                .andWhere('customList.host.id = :hostId', { hostId })
                .getQuery();
              return `user.id IN ${subQuery}`;
            });
          }
        }),
      );
    }
    // Apply AND conditions for other filters
    if (searchValue) {
      usersQuery.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName ILIKE :searchValue', { searchValue: `%${searchValue}%` }).orWhere('user.lastName ILIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          });
        }),
      );
    }
    if (focuses && typeof focuses === 'string') {
      const focusIds = focuses.split(',').map((id) => id.trim());
      usersQuery.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('focus_users_user.userId')
          .from('focus_users_user', 'focus_users_user')
          .where('focus_users_user.focusId IN (:...focusIds)', { focusIds })
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
    }
    if (interest && typeof interest === 'string') {
      const interestFilter = interest.split(',').map((interestName) => interestName.trim());
      usersQuery.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('interest_users_user.userId')
          .from('interest_users_user', 'interest_users_user')
          .where('interest_users_user.interestId IN (:...interestFilter)', { interestFilter })
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
    }
    if (gender && typeof gender === 'string') {
      const genderFilter = gender.split(',').map((g) => g.trim().toUpperCase());
      const validGenders = Object.values(Gender) as string[];
      const filteredGenders = genderFilter.filter((g) => validGenders.includes(g)) as Gender[];
      if (filteredGenders.length > 0) {
        usersQuery.andWhere('user.gender IN (:...filteredGenders)', { filteredGenders });
      }
    }

    if (baseCity && typeof baseCity === 'string') {
      const placeIds = baseCity.split(',').map((id) => id.trim());
      if (placeIds.length > 0) {
        usersQuery.andWhere((qb) => {
          const subQuery = qb.subQuery().select('address.id').from('address', 'address').where('address.google_place_id IN (:...placeIds)', { placeIds }).getQuery();
          return `user.address_id IN ${subQuery}`;
        });
      }
    }
    if (parsedQuery.ageFrom || parsedQuery.ageTo) {
      const ageFrom = parsedQuery.ageFrom && typeof parsedQuery.ageFrom === 'string' && parsedQuery.ageFrom.trim() ? parseInt(parsedQuery.ageFrom, 10) : 0; // Default minimum age is 0
      const ageTo =
        parsedQuery.ageTo && typeof parsedQuery.ageTo === 'string' && parsedQuery.ageTo.trim() && parsedQuery.ageTo !== 'No Max' ? parseInt(parsedQuery.ageTo, 10) : null; // Null indicates no upper limit
      const ageQuery = `EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(user.date_of_birth, 'MM/DD/YYYY')))`;
      const conditions: string[] = [`${ageQuery} >= :ageFrom`];
      if (ageTo !== null) {
        conditions.push(`${ageQuery} <= :ageTo`);
      }
      usersQuery.andWhere(conditions.join(' AND '), { ageFrom, ageTo });
    }
    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      usersQuery.addOrderBy('user.firstName', sortDirection).addOrderBy('user.lastName', sortDirection);
    } else {
      usersQuery.orderBy('user.createdAt', 'DESC');
    }

    const [allUsers, totalCount] = await usersQuery.getManyAndCount();

    const favorites = await this.dbConnection.getRepository(HostFavorite).find({
      where: { host: { id: hostId } },
      relations: ['member'],
    });
    const favoriteUserIds = favorites.map((fav) => fav.member.id);

    let listUserIds: string[] = [];
    if (customListId) {
      const customListUsers = await this.dbConnection.getRepository(HostCustomUsersListsUsers).find({
        where: { list: { id: customListId } },
        relations: ['user'],
      });

      listUserIds = customListUsers.map((listUser) => listUser.user.id);
    }

    const users = await Promise.all(
      allUsers.map(async (user) => {
        const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), user.id);
        const interests = await serviceMesh.getUserInterests(config.get('API_BASE_URL'), user.id);
        const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
          where: {
            user: {
              id: user.id,
            },
            type: SocialProviderType.INSTAGRAM,
          },
          relations: ['user'],
        });

        const socialProviderUsername = socialProvider?.username || null;

        const userData = toUser(user, focuses, interests, user.roles[0], {
          INSTAGRAM: socialProviderUsername,
        });
        userData.isFavourite = favoriteUserIds.includes(user.id);
        if (customListId) {
          userData.isInCustomList = listUserIds.includes(user.id);
        }
        return userData;
      }),
    );
    return responses.data({ users, totalCount });
  }

  // ADMIN Sevice Code

  public static async getMembers(payload: PaginatedRequestDto): Promise<any > { //GetMembersResponse
    try {
      const parsedQuery = parse(payload.query);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
      const socialNetworkNames = parsedQuery?.socialNetworkNames ? parsedQuery.socialNetworkNames : undefined;
      const followerCountFrom = parsedQuery?.followerCountFrom ? parseInt(parsedQuery.followerCountFrom as string) : undefined;
      const followerCountTo = parsedQuery?.followerCountTo ? parseInt(parsedQuery.followerCountTo as string) : undefined;
      const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
      const { error: validationError, response: validation } = this.validateFilters(payload.query);

      if (validationError) return responses.badRequest(validation);
      let socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {};
      if (typeof socialNetworkNames === 'string') {
        const socialNetworkArray = socialNetworkNames.split(',').map((name) => name.trim().toUpperCase());
        socialNetworkObject = socialNetworkArray.reduce(
          (acc, name) => {
            acc[name] = SocialProviderType[name as keyof typeof SocialProviderType];
            return acc;
          },
          {} as { [key in keyof typeof SocialProviderType]?: string },
        );
      }
      const usersQuery = this.dbConnection.getRepository(User)
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.roles', 'userRole')
        .innerJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('user.socialProviders', 'socialProvider')
        .leftJoinAndSelect('user.socialStats', 'socialStats')
        .leftJoinAndSelect('user.address', 'address')
        .where('role.name = :roleName', { roleName: 'member' })
        .andWhere('user.deletedAt IS NULL')
        .groupBy('user.id')
        .addGroupBy('userRole.id')
        .addGroupBy('role.id')
        .addGroupBy('socialProvider.id')
        .addGroupBy('socialStats.id')
        .addGroupBy('address.id')
        .addGroupBy('userRole.role.id')
        .offset(skip)
        .limit(take)
        .orderBy('user.createdAt', 'DESC');
      if (searchValue) {
        usersQuery.andWhere(
          new Brackets((qb) => {
            qb.where('user.firstName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.lastName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.email ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.username ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.phoneNumber ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('address.city ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('address.address ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('CAST(userRole.status AS TEXT) ILIKE :searchValue', { searchValue: `%${searchValue}%` });
          }),
        );
      }

      if (Object.keys(socialNetworkObject).length > 0) {
        const socialConditions = Object.keys(socialNetworkObject).map((networkKey) => {
          const columnName = `${networkKey.toLowerCase()}FollowersCount`;
          return `(socialStats.${columnName} BETWEEN :followerCountFrom AND :followerCountTo)`;
        });

        usersQuery.andWhere(
          new Brackets((qb) => {
            qb.where(socialConditions.join(' OR '), {
              followerCountFrom: followerCountFrom || 0,
              followerCountTo: followerCountTo || Number.MAX_SAFE_INTEGER,
            });
          }),
        );
      }

      const users = await usersQuery.getMany();
      const members = await Promise.all(
        users.map(async (user) => {

          // Micro-service call
          const focuses = [] //await this.platformClient.getUserFocuses(user.id, this.logger);
          const interests = [] //await this.platformClient.getUserInterests(user.id, this.logger);

          const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
            where: {
              user: {
                id: user.id,
              },
              type: SocialProviderType.INSTAGRAM,
            },
          });

          return toMember(user, focuses, interests, user.roles[0], socialNetworkObject, socialProvider?.username);
        }),
      );
      return responses.data(members);
    } catch (err) {
      return responses.badRequest('Unkown error occured, please try again later.');
    }
  }

  public static async getHosts(payload: PaginatedRequestDto): Promise<GetHostsResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
      const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;

      const allEventsQuery = `
      SELECT e.owner_id, COUNT(e.owner_id) FROM event e WHERE e.deleted_at IS NULL 
      GROUP BY e.owner_id
    `;
      const upcomingEventsQuery = `
      SELECT e.owner_id, COUNT(e.owner_id) FROM event e WHERE e.status='APPROVED_STATUS' 
      AND e.deleted_at IS NULL AND e.start_date > now() GROUP BY e.owner_id
    `;
      const pastEventsQuery = `
      SELECT e.owner_id, COUNT(e.owner_id) FROM event e WHERE e.status='APPROVED_STATUS' 
      AND e.deleted_at IS NULL AND e.end_date < now() GROUP BY e.owner_id
    `;
      const declinedEventsQuery = `
      SELECT e.owner_id, COUNT(e.owner_id) FROM event e WHERE e.status='DECLINED_STATUS' 
      AND e.deleted_at IS NULL GROUP BY e.owner_id
    `;
      const draftEventsQuery = `
      SELECT e.owner_id, COUNT(e.owner_id) FROM event e WHERE e.status='DRAFT_STATUS' 
      AND e.deleted_at IS NULL GROUP BY e.owner_id
    `;
      const pendingEventsQuery = `
      SELECT e.owner_id, COUNT(e.owner_id) FROM event e WHERE e.status='PENDING_STATUS' 
      AND e.deleted_at IS NULL GROUP BY e.owner_id
    `;

      const queryBuilder = this.dbConnection.getRepository(User)
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.roles', 'user_role')
        .innerJoinAndSelect('user_role.role', 'role')
        .leftJoinAndSelect('user.address', 'address')
        .where('role.name = :roleName', { roleName: 'host' })
        .leftJoin(`(${allEventsQuery})`, 'all_events', 'user.id = all_events.owner_id')
        .addSelect('all_events.count', 'all_events_count')
        .leftJoin(`(${upcomingEventsQuery})`, 'upcoming_events', 'user.id = upcoming_events.owner_id')
        .addSelect('upcoming_events.count', 'upcoming_events_count')
        .leftJoin(`(${pastEventsQuery})`, 'past_events', 'user.id = past_events.owner_id')
        .addSelect('past_events.count', 'past_events_count')
        .leftJoin(`(${declinedEventsQuery})`, 'declined_events', 'user.id = declined_events.owner_id')
        .addSelect('declined_events.count', 'declined_events_count')
        .leftJoin(`(${draftEventsQuery})`, 'draft_events', 'user.id = draft_events.owner_id')
        .addSelect('draft_events.count', 'draft_events_count')
        .leftJoin(`(${pendingEventsQuery})`, 'pending_events', 'user.id = pending_events.owner_id')
        .addSelect('pending_events.count', 'pending_events_count')
        .offset(skip)
        .limit(take);

      if (searchValue) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('user.firstName ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('user.lastName ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('user.email ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('address.city ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('CAST(user_role.status AS TEXT) ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('user.phoneNumber ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` })
              .orWhere('CAST(user_role.source AS TEXT) ILIKE :searchValue', { searchValue: `%${parsedQuery.searchValue}%` });
          }),
        );
      }
      const users = await queryBuilder.getRawMany();
      const hosts = users.map((user) => {
        return toHost(user as RawHost);
      });

      return responses.data(hosts);
    } catch (err) {
      return responses.badRequest('Unkown error occured, please try again later.');
    }
  }

  public static async adminLogin(payload: LoginRequestDto): Promise<TokenResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: { email: payload.email, deletedAt: IsNull() },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      if (!user) return responses.forbidden('Invalid credentials');

      const userRoles = await this.dbConnection.getRepository(UserRole).find({
        where: { user: { id: user.id } },
        relations: ['role', 'role.parentRole'],
      });

      const isAllowed = userRoles.find((role) => role.role.name === 'admin' || role.role.parentRole.name === 'admin');
      if (isAllowed === undefined) return responses.forbidden('Invalid credentials');

      const loginResponse = await this.fusionAuthClient.login({ loginId: payload.email, password: payload.password });

      if (loginResponse.statusCode > 299 || loginResponse.statusCode < 200) {
        return responses.forbidden('Invalid credentials');
      }

      if (loginResponse?.response?.user?.passwordChangeRequired) {
        return responses.forbidden('Password change is required');
      }

      return responses.data({
        token: loginResponse.response.token,
        roles: user.roles.map((item) => {
          return { roleName: item.role.name, roleId: item.role.id };
        }),
      });
    } catch (err) {
      return responses.badRequest('Unable to login.');
    }
  }

  public static async createAdmin(payload: AdminSignUpRequestDto): Promise<SignUpResponse> {
    try {
      let nonMember: UserRole | null;
      try {
        const response = await this.fusionAuthClient.retrieveUserByEmail(payload.email);
        if (response.statusCode == 200 && response?.response?.user) {
          return responses.conflict('The user with provided email already exists.');
        }
      } catch (e) {
        if (e.statusCode != 404) {
          return responses.conflict('An error happens when trying register an user ' + e + '.');
        }
      }

      let user = await this.dbConnection.getRepository(User).findOne({
        where: { email: payload.email, deletedAt: IsNull() },
        relations: {
          roles: { role: true },
        },
      });
      if (user) {
        nonMember = user.roles.find((item) => {
          if (item.role.name == 'non_member') return item;
        });

        if (!nonMember) {
          if (user.phoneNumber === payload.phoneNumber) {
            return responses.badRequest('Phone number is already in use, please try with a different phone number.');
          }

          if (user.email === payload.email) {
            return responses.badRequest('Email is already in use, please try with a different email.');
          }
        }
      } else {
        const newUser = new User();

        if (nonMember) {
          newUser.id = user.id;
          await RoleService.revokeRoleFromUser({ userId: user.id, roleName: 'non_member' });
        }

        newUser.email = payload.email;
        newUser.firstName = payload.firstName;
        newUser.lastName = payload.lastName;
        newUser.dateOfBirth = payload.dateOfBirth;
        newUser.phoneNumber = payload.phoneNumber;
        user = this.dbConnection.getRepository(User).create(newUser);
      }

      const registrationRequest: RegistrationRequest = {
        registration: {
          applicationId: config.get('FUSIONAUTH_APP_ID'),
          username: payload.email.split('@')[0],
        },
        sendSetPasswordEmail: false,
        user: {
          id: user.id,
          username: payload.email.split('@')[0],
          birthDate: payload.dateOfBirth,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          mobilePhone: payload.phoneNumber,
          password: payload.password,
          verified: true,
          active: true,
        },
      };

      const newUser = await this.fusionAuthClient.register(user.id, registrationRequest);
      if (newUser.statusCode !== 200) {
        return responses.conflict(`There wass an issue creating an admin: ${newUser.exception.name}`);
      }

      user.id = newUser.response?.user?.id;
      await this.dbConnection.getRepository(User).save(user);

      await RoleService.assignRoleToUser({ userId: user.id, roleName: 'admin' });

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Unable to sign up, please try again later.');
    }
  }

  public static async getHostProfile(payload: UserAndIdRequestDto): Promise<HostProfileResponse> {
    console.log('getHostProfile() payload: ', payload);

    try {
      const memberId = payload.userId; //Only valid if endpoint was called by a member
      let isMemberFollowingHost = false;

      const host: User = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: IsNull() },
        relations: {
          hostedEvents: true,
        },
      });
      if (!host) return responses.notFound('Host not found.');

      const userRoles = await this.dbConnection.getRepository(UserRole).find({
        where: { user: { id: host.id } },
        relations: {
          role: true,
        },
      });

      const hostRole = userRoles.find((role) => role.role.name === 'host');
      if (hostRole === undefined) return responses.notFound('Host not found');

      if (memberId !== host.id) {
        const hostFollowing = await this.dbConnection.getRepository(HostFollowing).findOne({
          where: {
            follower: { id: memberId },
            host: { id: host.id },
          },
        });

        if (hostFollowing) isMemberFollowingHost = true;
      }

      return responses.data(toHostProfile(host, entityToUserStatus[hostRole.status], entityToUserSource[hostRole.source], isMemberFollowingHost));
    } catch (err) {
      return responses.badRequest(`Unable to get host profile: ${err}`);
    }
  }

  public static async updateHostProfile(payload: UpdateHostProfileRequestDto): Promise<BasicHostProfileResponse> {
    try {
      const host: User = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: IsNull() },
      });

      if (!host) return responses.notFound('Host not found.');

      if (payload?.email) {
        const existingUser = await this.dbConnection.getRepository(User).findOne({
          where: [{ email: payload.email }],
        });

        if (existingUser && host.id !== existingUser.id) {
          return responses.badRequest('Email is already in use, please use different email.');
        }
      }

      if (payload?.phoneNumber) {
        const existingUser = await this.dbConnection.getRepository(User).findOne({
          where: [{ phoneNumber: payload.phoneNumber }],
        });
        if (existingUser && host.id !== existingUser.id) {
          return responses.badRequest('Phone number is already in use, please use a different phone number.');
        }
      }

      const updatedUser = await this.dbConnection.getRepository(User).save(hostToUpdate(host, payload));

      const userRoles = await this.dbConnection.getRepository(UserRole).find({
        where: { user: { id: updatedUser.id } },
        relations: {
          role: true,
        },
      });

      const hostRole = userRoles.find((role) => role.role.name === 'host');
      if (hostRole === undefined) return responses.notFound('Host not found');

      await this.dbConnection.getRepository(UserRole).update(hostRole.id, { profileSetupCompleted: true });

      return responses.data(toBasicHostProfile(updatedUser, entityToUserStatus[hostRole.status], entityToUserSource[hostRole.source]));
    } catch (err) {
      return responses.badRequest(`Unable to get host profile: ${err}`);
    }
  }

  public static async getBasicHostProfile(payload: IdRequestDto): Promise<BasicHostProfileResponse> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id, deletedAt: IsNull() },
      });
      if (!user) return responses.notFound('Host not found.');

      const userRoles = await this.dbConnection.getRepository(UserRole).find({
        where: { user: { id: user.id } },
        relations: {
          role: true,
        },
      });

      const hostRole = userRoles.find((role) => role.role.name === 'host');
      if (hostRole === undefined) return responses.notFound('Host not found');

      return responses.data(toBasicHostProfile(user, entityToUserStatus[hostRole.status], entityToUserSource[hostRole.source]));
    } catch (err) {
      return responses.badRequest(`Unable to get host profile: ${err}`);
    }
  }

  public static validateFilters(query: string): { error: boolean; response: string } {
    const parsedFilters = parse(query);
    const socialNetworkNames = parsedFilters?.socialNetworkNames ? parsedFilters.socialNetworkNames : undefined;
    const followerCountFrom = parsedFilters?.followerCountFrom ? parseInt(parsedFilters.followerCountFrom as string) : undefined;
    const followerCountTo = parsedFilters?.followerCountTo ? parseInt(parsedFilters.followerCountTo as string) : undefined;
    const searchValue = parsedFilters?.searchValue ? parsedFilters.searchValue : undefined;
    if (searchValue) {
      if (typeof searchValue !== 'string' || searchValue.length === 0) {
        return { error: true, response: 'searchValue must be a string.' };
      }
    }

    if (socialNetworkNames) {
      if (followerCountFrom === undefined || followerCountTo === undefined) {
        return {
          error: true,
          response: `Please provide both ‘Follower Count From’ and ‘Follower Count To’ when selecting one or more social networks.`,
        };
      }
      if (followerCountFrom > followerCountTo) {
        return { error: true, response: 'followerCountFrom must be less than or equal to followerCountTo.' };
      }

      if (typeof socialNetworkNames === 'string') {
        const socialNetworkArray = socialNetworkNames.split(',').map((name) => name.trim().toUpperCase());

        const invalidNames = socialNetworkArray.filter((name) => !(name in SocialProviderType));

        if (invalidNames.length > 0) {
          return { error: true, response: `Invalid social network names: ${invalidNames.join(', ')}` };
        }

        return { error: false, response: socialNetworkArray.join(',') };
      }
    }
    return { error: false, response: '' };
  }

  public static async updateHostStatus(payload: UpdateUserStatusRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      const hostRole = user.roles.find((role) => role.role.name === 'host' || role.role.name === 'co_host');
      if (hostRole === undefined) return responses.notFound('Host not found');

      const userRole = await this.dbConnection.getRepository(UserRole).findOne({ where: { id: hostRole.id } });
      if (!hostRole) return responses.notFound('Host not found');

      userRole.status = newUserStatusTosUserStatus[payload.status];
      await this.dbConnection.getRepository(UserRole).save(userRole);

      if (payload.status === NewUserStatus.APPROVE) {
        const users = await this.fusionAuthClient.searchUsersByIds([user.id]);
        if (users.response.total === 0) {
          await this.approveHost(user);
          const token = await this.generateToken(user);

          // Micro-service call
          // await this.communicationClient.sendEmailFromTemplate(
          //   [
          //     {
          //       key: 'first_name',
          //       value: user.firstName,
          //     },
          //     {
          //       key: 'company_name',
          //       value: user.additionalHostInformation?.companyName ?? user.firstName,
          //     },
          //     {
          //       key: 'password_token',
          //       value: this.configService.get<string>('RUMOR_WEBSITE') + `token/${token}`,
          //     },
          //   ],
          //   'Host Application Approved',
          //   [user.email],
          //   null,
          //   this.logger,
          // );
        }
      } else if (payload.status === NewUserStatus.WAITLIST) {
        // Micro-service call
        // await this.communicationClient.sendEmailFromTemplate([], 'Host Application Denied', [user.email], null, this.logger);
      } else if (payload.status === NewUserStatus.DEACTIVATE) {
        const today = new Date();
        const afterThirtyDays = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const fullMonthName = afterThirtyDays.toLocaleString('default', { month: 'long' });
        // example December 31, 2024, at 11:59PM EST
        const reactivateBeforeTimestamp = `${fullMonthName} ${afterThirtyDays.getDate()}, ${afterThirtyDays.getFullYear()}, at 11:59 PM EST`;
        // Micro-service call
        //   await this.communicationClient.sendEmailFromTemplate(
        //     [
        //       { key: 'first_name', value: user.firstName },
        //       { key: 'activate_before_datetime', value: reactivateBeforeTimestamp },
        //     ],
        //     'Account Deactivated',
        //     [user.email],
        //     null,
        //     this.logger,
        //   );
        // }

        return responses.ok;
      }
    } catch (err) {
      return responses.badRequest(`Unable to update host status: ${err}`);
    }
  }

  public static async approveHost(user: User): Promise<void> {
    try {
      const password = generateRandomPassword(12);
      const temporaryPassword = new TemporaryPassword();
      temporaryPassword.password = password;
      user.temporaryPassword = temporaryPassword;
      user = await this.dbConnection.getRepository(User).save(user);

      const registrationRequest: RegistrationRequest = {
        registration: {
          applicationId: config.get('FUSIONAUTH_APP_ID'),
          username: user.email.split('@')[0],
        },
        sendSetPasswordEmail: false,
        user: {
          id: user.id,
          username: user.email.split('@')[0],
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          mobilePhone: user.phoneNumber,
          password,
          verified: true,
          active: true,
        },
      };

      await this.fusionAuthClient.register(user.id, registrationRequest);
    } catch (err) {
      // throw new BadRequestException(`Unable to approve host: ${err}`);
    }
  }

  public static async generateToken(user: User): Promise<string> {
    try {
      const token = generateTemporaryToken(36);
      const temporaryPasswordToken = new TemporaryPasswordToken();
      temporaryPasswordToken.token = token;
      temporaryPasswordToken.expiresAt = dayjs().add(24, 'hours').toDate();
      user.temporaryPasswordToken = temporaryPasswordToken;
      await this.dbConnection.getRepository(User).save(user);
      return token;
    } catch (err) {
      // this.logger.error(`Unable to approve host: ${err}`);
      // throw new BadRequestException(`Unable to approve host: ${err}`);
    }
  }

  public static async updateMemberStatus(payload: UpdateUserStatusRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      const memberRole = user.roles.find((role) => role.role.name === 'member');
      if (memberRole === undefined) return responses.notFound('Member not found');

      const userRole = await this.dbConnection.getRepository(UserRole).findOne({ where: { id: memberRole.id } });
      if (!userRole) return responses.notFound('Member not found');

      userRole.status = newUserStatusTosUserStatus[payload.status];
      await this.dbConnection.getRepository(UserRole).save(userRole);

      return responses.ok;
    } catch (err) {
      // this.logger.error(err);
      return responses.badRequest(`Unable to update host status: ${err}`);
    }
  }

  public static async getMemberProfile(payload: IdRequestDto): Promise<MemberProfileResponse> {
    try {
      const user = await this.dbConnection.getRepository(User).findOne({
        where: { id: payload.id },
        relations: {
          roles: {
            role: true,
          },
          address: true,
          socialStats: true,
        },
      });

      const memberRole = user.roles.find((role) => role.role.name === 'member');
      if (memberRole === undefined) return responses.notFound('Member not found');

      const userRole = await this.dbConnection.getRepository(UserRole).findOne({ where: { id: memberRole.id } });
      if (!userRole) return responses.notFound('Member not found');

      // Micro-service call
      const focuses = []//await this.platformClient.getUserFocuses(user.id, this.logger);

      const socialProvider: SocialProvider = await this.dbConnection.getRepository(SocialProvider).findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.FACEBOOK,
        },
        relations: ['user'],
      });

      return responses.data(toMemberProfile(user, focuses, userRole, socialProvider?.username));
    } catch (err) {
      return responses.badRequest(`Unable to get host profile: ${err}`);
    }
  }
  public static async applyUserFilters(queryBuilder, parsedQuery, searchValue, focuses, interest, gender, baseCity, hostId, userTypes) {
    //Apply type filter
    if (userTypes.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('role.name IN (:...roleNames)', { roleNames: userTypes });
        }),
      );
    }

    // Apply search value filter
    if (searchValue) {
      const searchWords = searchValue.trim().split(/\s+/);
      queryBuilder.andWhere(
        new Brackets((qb) => {
          searchWords.forEach((word) => {
            qb.orWhere('user.firstName ILIKE :word', { word: `%${word}%` }).orWhere('user.lastName ILIKE :word', { word: `%${word}%` });
          });
        }),
      );
    }

    // Apply focuses filter
    if (focuses && typeof focuses === 'string') {
      const focusIds = focuses.split(',').map((id) => id.trim());
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('focus_users_user.userId')
          .from('focus_users_user', 'focus_users_user')
          .where('focus_users_user.focusId IN (:...focusIds)', { focusIds })
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
    }

    // Apply interests filter
    if (interest && typeof interest === 'string') {
      const interestFilter = interest.split(',').map((interestName) => interestName.trim());
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('interest_users_user.userId')
          .from('interest_users_user', 'interest_users_user')
          .where('interest_users_user.interestId IN (:...interestFilter)', { interestFilter })
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
    }

    // Apply gender filter
    if (gender && typeof gender === 'string') {
      const genderFilter = gender.split(',').map((g) => g.trim().toUpperCase());
      const validGenders = Object.values(Gender) as string[];
      const filteredGenders = genderFilter.filter((g) => validGenders.includes(g)) as Gender[];
      if (filteredGenders.length > 0) {
        queryBuilder.andWhere('user.gender IN (:...filteredGenders)', { filteredGenders });
      }
    }

    // Apply baseCity filter
    if (baseCity && typeof baseCity === 'string') {
      const placeIds = baseCity.split(',').map((id) => id.trim());
      if (placeIds.length > 0) {
        queryBuilder.andWhere((qb) => {
          const subQuery = qb.subQuery().select('address.id').from('address', 'address').where('address.google_place_id IN (:...placeIds)', { placeIds }).getQuery();
          return `user.address_id IN ${subQuery}`;
        });
      }
    }

    // Apply age filter
    if (parsedQuery.ageFrom || parsedQuery.ageTo) {
      const ageFrom = parsedQuery.ageFrom && typeof parsedQuery.ageFrom === 'string' && parsedQuery.ageFrom.trim() ? parseInt(parsedQuery.ageFrom, 10) : 0;
      const ageTo =
        parsedQuery.ageTo && typeof parsedQuery.ageTo === 'string' && parsedQuery.ageTo.trim() && parsedQuery.ageTo !== 'No Max' ? parseInt(parsedQuery.ageTo, 10) : null;
      const ageQuery = `EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(user.date_of_birth, 'MM/DD/YYYY')))`;
      const conditions: string[] = [`${ageQuery} >= :ageFrom`];
      if (ageTo !== null) {
        conditions.push(`${ageQuery} <= :ageTo`);
      }
      queryBuilder.andWhere(conditions.join(' AND '), { ageFrom, ageTo });
    }
    return queryBuilder;
  }
}
