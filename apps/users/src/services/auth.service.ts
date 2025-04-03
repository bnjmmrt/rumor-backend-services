import { FindOptionsWhere, ILike, In, QueryRunner } from 'typeorm';
import database from '../database';
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
  UpdateAdminPasswordRequestDto,
  ContactsListRequestDto,
  GetUserWithRolesByEmailRequestDto,
  NonMemberSignUpRequestDto,
  InviteNewHostRequestDto,
  LoginVerificationRequestDto,
  UpdateCustomUsersListRequestDto,
  FilterRequestDto,
  DuplicateCustomListRequestDto,
  ManageUserRequestDto,
  CreateHostCollaboratorRequestDto,
  HostFeedbackRequestDto,
  SendVerificationCodeByEmailRequestDto,
  VerifyCodeByEmailRequestDto,
  ReportUserRequestDto,
  BlockHostRequestDto,
  sendSupportEmailRequestDto,
  SwitchProfileDto,
  GetUserWithRolesByPhoneRequestDto,
  UpdateHostsStatusRequestDto,
  AddUserNoteRequestDto,
  ManageMulipleUsersRequestDto,
} from 'rumor-utils/shared/users/dtos/auth.dto';

import {
  LoginSSOResponse,
  OAuthRedirectResponse,
  ValidateResponse,
  SaveOrUpdateProviderAuthResponse,
  UserResponseData,
  customListData,
  ConfirmedMember,
  TokenResponseAndRoles,
  Validity,
  UsersData,
  MemberProfile,
  ReportData,
  Feedback,
  CustomUsersList,
  CustomUsersListsData,
  HostsProfile,
  Member,
  CurrentMember,
  SimpleUser,
  Data,
  CurrentUser,
  UserProfilePicture,
  UserProfile,
  Filter,
  HostFeedbackData,
  VerificationStatus,
  UserDataSimple,
  UserWithRoles,
  BasicHostProfile,
  UserIdWithRolesAndToken,
  AddUserNote,
  CheckEmaiLRequest,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb';

import { TemporaryLoginCode } from 'rumor-utils/shared/users/entities/temporary-login-code.entity';
import { Invitation } from 'rumor-utils/shared/users/entities/invitation.entity';
import { HostCustomUsersLists } from 'rumor-utils/shared/users/entities/host-custom-users-lists.entity';
import { HostFavorite } from 'rumor-utils/shared/users/entities/host-favorite.entity';
import { Address } from 'rumor-utils/shared/users/entities/address.entity';
import { TemporaryPasswordToken } from 'rumor-utils/shared/users/entities/temporary-password-token.entity';

import {
  LoginRequest,
  ForgotPasswordRequest,
  PasswordlessStartRequest,
  ChangePasswordRequest,
} from '@fusionauth/typescript-client';

import {
  formatDateToMMDDYYYYHHmm,
  newAddress,
  newHost,
  newMember,
  prepareQueryString,
} from '../utils/auth.util';
import {
  entityToGender,
  genderToEntity,
  toConfirmedMember,
  toCreateUser,
  toCurrentMember,
  toCurrentUser,
  toSimpleUser,
  toUserDataSimple,
  toUser,
  toMemberProfile,
} from 'rumor-utils/shared/users/mappers/auth.mapper';
import { SettingsService } from '../services/settings.service';

// import { PlatformClient } from 'rumor-utils/clients/platform.client';
import {
  hasPagination,
  ReportAndFeedbackRequestDto,
  TokenRequestDto,
  UpdateUsersStatusDto,
} from 'rumor-utils/shared/users/dtos/shared.dto';
import { NewUserStatus } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { ProviderAuth, UserIdData } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import {
  AdditionalHostInformation,
  FilterTypeValues,
  Gender,
  RoleType,
} from 'rumor-utils/shared/users/interfaces/auth.interface';
import { SocialService } from './social.service';
import { UserSource, UserStatus } from 'rumor-utils/shared/users/interfaces/shared.interface';
import {
  entityToProviderType,
  providerTypeToEntity,
} from 'rumor-utils/shared/users/mappers/social.mapper';
import { AddressValidationClient } from '@googlemaps/addressvalidation';
import { JWT as GoogleAuthJWT } from 'google-auth-library/build/src/auth/jwtclient';
import { ListUsersInviteesDto } from 'rumor-utils/shared/users/dtos/guest.dto';
import { ParsedQs } from 'qs';
import { GoogleAddressClient } from '../utils/google';
import { getCityNameFromAddressComponents } from 'rumor-utils/shared/events/utils/event.utils';
import fusionAuthClientHandler from '../utils/fusion-auth/fusionauth';

//-----------------Admin Imports

import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { Brackets, IsNull, Repository } from 'typeorm';

import {
  IdRequestDto,
  PaginatedRequestDto,
  UserAndIdRequestDto,
} from 'rumor-utils/shared/users/dtos/shared.dto';
import {
  BasicHostProfileResponse,
  GetHostsResponse,
  GetMembersResponse,
  HostProfileResponse,
  MemberProfileResponse,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb';
import { parse } from 'qs';
import { toHost, toMember } from 'rumor-utils/shared/users/mappers/auth.mapper';
import { responses } from '../common/responses.common';
import {
  LoginRequestDto,
  AdminSignUpRequestDto,
  UpdateUserStatusRequestDto,
} from 'rumor-utils/shared/users/dtos/auth.dto';
import { UserRole } from 'rumor-utils/shared/users/entities/roles/user-role.entity';
import { RegistrationRequest } from '@fusionauth/typescript-client';
import { RawHost } from 'rumor-utils/shared/users/interfaces/auth.interface';
import { toBasicHostProfile, toHostProfile } from 'rumor-utils/shared/users/mappers/admin.mapper';
import { UpdateHostProfileRequestDto } from 'rumor-utils/shared/users/dtos/admin.dto';
import { generateRandomPassword, generateTemporaryToken, hostToUpdate } from '../utils/auth.util';
import {
  entityToUserSource,
  entityToUserStatus,
  newUserStatusTosUserStatus,
} from 'rumor-utils/shared/users/mappers/shared.mapper';
import { RoleService } from './role.service';
import { SocialProviderType } from 'rumor-utils/shared/users/interfaces/shared.interface';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
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
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from 'rumor-utils/errors';
import { HostCustomUsersListsUsers } from 'rumor-utils/shared/users/entities/host-custom-users-lists-users.entity';
import { HostUserSettings } from 'rumor-utils/shared/users/entities/host-user-settings.entity';

import serviceMesh from '../server/helpers/serviceMeshHandler';
import { HostFeedback } from 'rumor-utils/shared/users/entities/host-feedback.entity';
import { Report } from 'rumor-utils/shared/users/entities/report.entity';
import { Block } from 'rumor-utils/shared/users/entities/block.entity';
import { Guest } from 'rumor-utils/shared/entities';
import { GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';
import { PlatformService } from './platform.service';
import { RestrictedInvites } from 'rumor-utils/shared/events/entities';
import { stringify } from 'csv-stringify';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import { isValidPhoneNumber } from 'rumor-utils/utils/file-utils';

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

  public static async login(payload: LoginRequestDto): Promise<Data> {
    try {
      const user: User = await this.dbConnection.getRepository(User).findOne({
        where: { email: payload.email, deletedAt: IsNull() },
      });

      if (!user) {
        throw new ForbiddenError('user');
      }
      const loginUserRequest: LoginRequest = {
        loginId: payload.email,
        password: payload.password,
      };

      const loginUser = await fusionAuthClientHandler.fusionAuthClient().login(loginUserRequest);

      if (loginUser.statusCode > 299 || loginUser.statusCode < 200) {
        throw new ForbiddenError('User or password not valid.');
      }

      if (loginUser?.response?.user?.passwordChangeRequired) {
        throw new ForbiddenError('User must to reset its password.');
      }

      if (!loginUser?.response?.user?.active) {
        throw new ForbiddenError('User is not active.');
      }

      if (!loginUser?.response?.user?.verified) {
        throw new ForbiddenError('User is not verified.');
      }

      return {
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
          roles: [],
        },
      };
    } catch (err) {
      if (err?.statusCode == 423) {
        throw new ForbiddenError('User is locked.');
      }
      if (err.statusCode == 404) {
        throw new ForbiddenError('Verify your password and email.');
      }
      throw new ForbiddenError('Unable to login.');
    }
  }

  public static async validate({ token }: ValidateRequestDto): Promise<ValidateResponse> {
    try {
      const findUser = await fusionAuthClientHandler.fusionAuthClient().retrieveUserUsingJWT(token);
      if (!findUser?.response?.user?.active) {
        throw new ForbiddenError('User is not active.');
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
        throw new ForbiddenError('User is locked.');
      }
      if (err.statusCode == 404) {
        throw new ForbiddenError('Verify your password and email.');
      }
      throw new BadRequestError('Unable to validate user.');
    }
  }

  public static async memberSignUp(
    payload: MemberSignUpRequestDto,
  ): Promise<UserIdWithRolesAndToken> {
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
    let existingUser: User | null = null;
    let fusionAuthUser = null;
    let requiresFusionAuthRegistration = false;
    let fusionAuthToken: string | null = null;

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
      existingUser = user;
      const isHost = user.roles.some(item => item.role.name === 'host');
      const isMember = user.roles.some(item => item.role.name === 'member');
      const isNonMember = user.roles.some(item => item.role.name === 'non_member');

      if (isMember) {
        throw new BadRequestError('You are already registered as a member.');
      }

      if (isHost) {
        const request: PasswordlessStartRequest = {
          applicationId: config.get('FUSIONAUTH_APP_ID'),
          loginId: user.email,
        };
        const code = await fusionAuthClientHandler
          .fusionAuthClient()
          .startPasswordlessLogin(request);
        const authenticatedUser = await fusionAuthClientHandler
          .fusionAuthClient()
          .passwordlessLogin({ code: code.response.code });
        fusionAuthToken = authenticatedUser.response.token;

        requiresFusionAuthRegistration = false;
      } else if (isNonMember) {
        try {
          const fusionAuthResponse = await fusionAuthClientHandler
            .fusionAuthClient()
            .retrieveUserByEmail(payload.email);
          requiresFusionAuthRegistration = fusionAuthResponse.statusCode !== 200;
        } catch (error) {
          requiresFusionAuthRegistration = true;
        }
      } else {
        requiresFusionAuthRegistration = true;
      }
    } else {
      requiresFusionAuthRegistration = true;
    }

    // Get address
    let placeLocation = null;
    if (payload.address.placeId) {
      placeLocation = await GoogleAddressClient.geodecodePlaceId(payload.address.placeId);
    }
    const userAddress = await newAddress(payload.address, placeLocation);
    const address = await this.dbConnection.getRepository(Address).save(userAddress);

    // Always use `newMember` for user creation
    let newUser = newMember(payload, address);

    // Retain ID if user exists
    if (existingUser) {
      newUser.id = existingUser.id;
    }

    if (payload.socialUrl) {
      newUser.additionalMemberInformation = { socialUrl: payload.socialUrl };
    }

    if (payload.instagramAccessToken) {
      await SocialService.getInstagramData(
        newUser.id,
        payload.instagramAccessToken,
        payload.platform,
      );
    } else if (payload.linkedInAccessToken) {
      await SocialService.getLinkedInData(
        newUser.id,
        payload.linkedInAccessToken,
        payload.platform,
      );
    } else if (payload.facebookAccessToken) {
      SocialService.getFacebookData(newUser.id, payload.linkedInAccessToken, payload.platform);
    }

    if (!existingUser || requiresFusionAuthRegistration) {
      const registrationRequest: RegistrationRequest = {
        registration: {
          applicationId: config.get('FUSIONAUTH_APP_ID'),
          username: payload.email,
        },
        sendSetPasswordEmail: false,
        user: {
          username: payload.email,
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

      fusionAuthUser = await fusionAuthClientHandler
        .fusionAuthClient()
        .register(newUser.id, registrationRequest);
      if (fusionAuthUser.statusCode !== 200) {
        throw new ConflictError(
          `There was an issue creating your user: ${fusionAuthUser.exception.name}`,
        );
      }
      newUser.id = fusionAuthUser.response?.user?.id;
      fusionAuthToken = fusionAuthUser.response.token; // Get token after registration
    }

    newUser = await this.dbConnection.getRepository(User).save(newUser);
    await RoleService.assignRoleToUser({ userId: newUser.id, roleName: 'non_member' });
    await PlatformService.saveFocusesForUser({
      userId: newUser.id,
      focusIds: payload.focusIds,
    });
    await PlatformService.saveInterestsForUser({
      userId: newUser.id,
      interestsIds: payload.interestsIds,
    });
    await this.dbConnection
      .getRepository(Invitation)
      .update({ phoneNumber: newUser.phoneNumber }, { signUpComplete: true });

    try {
      await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'applicants_name',
            value: `${newUser.firstName} ${newUser.lastName}`,
          },
        ],
        'Application Submitted',
        [newUser.email.trim()], // Send email to the member
        null,
      );
      await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'link_to_application',
            value: config.get('RUMOR_WEBSITE_ADMIN') + `users/${newUser.id}/new-applicant`,
          },
        ],
        'Super Admin - New Member Application',
        ['admin@therumor.com'],
        null,
      );
    } catch (error) {}

    const savedUser = await this.dbConnection.getRepository(User).findOne({
      where: { id: newUser.id },
      relations: { roles: { role: true } },
    });

    if (!savedUser) {
      throw new BadRequestError('Error retrieving user after sign-up.');
    }

    // Save FCM Token for the user
    SettingsService.savePushNotificationToken({
      userId: newUser.id,
      token: payload.fcmToken,
      deviceId: payload.deviceId,
    });

    try {
      const adminUsers: User[] = await this.dbConnection.getRepository(User).find({
        where: {
          deletedAt: IsNull(),
          roles: {
            role: {
              name: 'admin',
            },
          },
        },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      const adminUserIds = adminUsers.map(user => user.id);

      if (adminUserIds.length > 0)
        await serviceMesh
          .notificationService()
          .sendNotification(NotificationType.USER_APPLICATION, adminUserIds, null, newUser.id);
    } catch (error) {
      console.log('🚀 ~ AuthService ~ memberSignUp ~ error:', error);
    }

    return {
      id: savedUser.id,
      roles: savedUser.roles.map(role => ({
        roleName: role.role.name,
        roleId: role.role.id,
      })),
      token: fusionAuthToken, // Now token is set correctly
    };
  }

  public static async hostSignUp(payload: HostSignUpRequestDto): Promise<string> {
    payload.email = payload.email.toLowerCase();
    let userRoleAsMemberOrNonMember: UserRole | null, userRoleExistsAsHost: boolean | null;
    let userHasOtherRoles: boolean = false;
    let phoneNumberInUse = false, emailInUse = false;

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
      userRoleAsMemberOrNonMember = user.roles.find(item => item.role.name === 'non_member' || item.role.name === 'member');
      userRoleExistsAsHost = user.roles.some(item => item.role.name === 'host');
      userHasOtherRoles = user.roles.some(item => item.role.name !== 'non_member' && item.role.name !== 'member');

      phoneNumberInUse = user.phoneNumber === payload.phoneNumber;
      emailInUse = user.email === payload.email;

      if (userRoleExistsAsHost) {
        if (phoneNumberInUse && emailInUse) {
          throw new BadRequestError('This phone number and email are already associated with a host account. Please use different credentials.');
        } else if (phoneNumberInUse) {
          throw new BadRequestError('This phone number is already associated with a host account. Please use a different phone number.');
        } else if (emailInUse) {
          throw new BadRequestError('This email is already associated with a host account. Please use a different email address.');
        }
      }

      if (userHasOtherRoles) {
        throw new BadRequestError('Users with existing roles cannot sign up as a host.');
      }

    }

    let newUser = newHost(payload);
    if (userRoleAsMemberOrNonMember) {
      newUser.id = user.id;
    }

    newUser = await this.dbConnection.getRepository(User).save(newUser);

    await RoleService.assignRoleToUser(
      { userId: newUser.id, roleName: 'host' },
      UserSource.HOST_APPLICATION,
    );

    // Micro-service call

    try {
      await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'first_name',
            value: payload?.firstName || '',
          },
        ],
        'Host Application Submitted',
        [payload.email.trim()],
        null,
      );
      await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'link_to_application',
            value: config.get('RUMOR_WEBSITE_ADMIN') + `hosts/${newUser.id}/new-applicant`,
          },
        ],
        'Super Admin - New Host Application',
        ['admin@therumor.com'],
        null,
      );
    } catch (error) {}

    // Save FCM Token for the user
    SettingsService.savePushNotificationToken({
      userId: newUser.id,
      token: payload.fcmToken,
      deviceId: payload.deviceId,
    });

    try {
      const adminUsers: User[] = await this.dbConnection.getRepository(User).find({
        where: {
          deletedAt: IsNull(),
          roles: {
            role: {
              name: 'admin',
            },
          },
        },
        relations: {
          roles: {
            role: true,
          },
        },
      });

      const adminUserIds = adminUsers.map(user => user.id);

      if (adminUserIds.length > 0)
        await serviceMesh
          .notificationService()
          .sendNotification(NotificationType.HOST_APPLICATION, adminUserIds, null, newUser.id);
    } catch (error) {
      console.log('🚀 ~ AuthService ~ hostSignUp ~ error:', error);
    }
    return '';
  }

  public static async logout(payload: TokenRequestDto): Promise<string> {
    const response = await fusionAuthClientHandler.fusionAuthClient().logout(false, payload.token);

    if (!response.wasSuccessful()) {
      throw new BadRequestError('Invalid session token.');
    }
    return '';
  }

  public static async validatePasswordToken(
    payload: ValidatePasswordTokenRequestDto,
  ): Promise<Validity> {
    const temporaryPasswordToken = await this.dbConnection
      .getRepository(TemporaryPasswordToken)
      .findOne({ where: { token: payload.token } });
    if (!temporaryPasswordToken) return { isValid: false };
    const expirationDate = dayjs.utc(temporaryPasswordToken.expiresAt).tz('America/New_York');
    const currentTime = dayjs.utc(new Date()).tz('America/New_York');
    const isValid = dayjs(currentTime).isSameOrBefore(expirationDate);
    return { isValid };
  }

  public static async checkService() {
    let eventId = '4dffc9a4-8b42-4596-8827-ec99b64aaaf3';
    let announcementId = 'a12723ab-6b0c-4bc4-8198-db68cfd6d715';
    let response = await serviceMesh.eventService().announcementDetail(eventId, announcementId);
    return response;
  }

  public static async setHostPassword(payload: SetHostPasswordRequestDto): Promise<string> {
    if (payload.password !== payload.repeatedPassword) {
      throw new BadRequestError('Passwords do not match.');
    }

    const temporaryPasswordToken = await this.dbConnection
      .getRepository(TemporaryPasswordToken)
      .findOne({
        where: { token: payload.token },
        relations: { user: true },
      });
    if (!temporaryPasswordToken) {
      throw new BadRequestError('Unable to set password.');
    }

    const expirationDate = dayjs.utc(temporaryPasswordToken.expiresAt).tz('America/New_York');
    const currentTime = dayjs.utc(new Date()).tz('America/New_York');
    const isValid = dayjs(currentTime).isSameOrBefore(expirationDate);
    if (!isValid) {
      throw new BadRequestError('Token has expired');
    }

    const temporaryPassword = await this.dbConnection
      .getRepository(TemporaryPassword)
      .findOne({ where: { user: { id: temporaryPasswordToken.user.id } } });
    if (!temporaryPassword) {
      throw new BadRequestError('Unable to set password');
    }

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

    await fusionAuthClientHandler.fusionAuthClient().changePasswordByIdentity(request);

    // Deleting one-to-one relationships can be tricky, we need to nullify the relationship first before deleting entities.
    // Nullify relationships
    user.temporaryPassword = null;
    user.temporaryPasswordToken = null;
    await this.dbConnection.getRepository(User).save(user);

    // Delete entities successfully
    await this.dbConnection.getRepository(TemporaryPassword).delete(temporaryPassword.id);
    await this.dbConnection.getRepository(TemporaryPasswordToken).delete(temporaryPasswordToken.id);
    return '';
  }

  public static async updateHostPassword(payload: UpdateHostPasswordRequestDto): Promise<string> {
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

    const hostRole = user.roles.find(
      role => role.role.name === 'host' || role.role.name === 'co_host',
    );
    if (hostRole === undefined) {
      throw new NotFoundError('Host');
    }

    const request: ChangePasswordRequest = {
      applicationId: config.get('FUSIONAUTH_APP_ID'),
      loginId: user.email,
      password: payload.newPassword,
    };

    await fusionAuthClientHandler.fusionAuthClient().changePasswordByIdentity(request);
    return '';
  }

  public static async updateAdminPassword(payload: UpdateAdminPasswordRequestDto): Promise<string> {
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

    const adminRole = user.roles.find(role => role.role.name === 'admin');
    if (adminRole === undefined) {
      throw new NotFoundError('Admin');
    }

    const request: ChangePasswordRequest = {
      applicationId: config.get('FUSIONAUTH_APP_ID'),
      loginId: user.email,
      password: payload.newPassword,
    };

    await fusionAuthClientHandler.fusionAuthClient().changePasswordByIdentity(request);
    return '';
  }

  public static async forgot(payload: ForgotPasswordRequestDto): Promise<string> {
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: { email: payload.email, deletedAt: null },
      relations: {
        roles: {
          role: true,
        },
      },
    });
    if (!user) {
      throw new NotFoundError(
        "The email address you provided doesn't match any account in our system. Please check for any typos or try a different email.",
      );
    }
    const passwordResetRequest: ForgotPasswordRequest = {
      applicationId: config.get('FUSIONAUTH_APP_ID'),
      email: payload.email,
      sendForgotPasswordEmail: false,
    };
    const forgotPasswordResponse = await fusionAuthClientHandler
      .fusionAuthClient()
      .forgotPassword(passwordResetRequest);
    const token = forgotPasswordResponse.response?.changePasswordId;
    if (!token) {
      throw new BadRequestError('Unable to call forgot password, please try again later.');
    }
    const isAdmin: boolean = user?.roles?.some((role: UserRole) => role.role.name === 'admin');
    if (isAdmin) {
      const redirectPath = `new-password?token=${token}`;
      const mailServiceResponse = await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'reset_url',
            value: config.get('RUMOR_WEBSITE_ADMIN') + `${redirectPath}`,
          },
        ],
        'Super Admin - Reset Password',
        [payload.email.trim()],
        null,
        // this.logger,
      );
      if (!mailServiceResponse) {
        throw new BadRequestError('Unable to send mail, please try again later.');
      }
    } else {
      const redirectPath = `auth/reset-password/${token}`;
      const mailServiceResponse = await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'user_name',
            value: user?.additionalHostInformation?.companyName || 'Host',
          },
          {
            key: 'reset_url',
            value: config.get('RUMOR_WEBSITE_HOST') + `${redirectPath}`,
          },
        ],
        'Reset Password',
        [payload.email.trim()],
        null,
      );
      if (!mailServiceResponse) {
        throw new BadRequestError('Unable to send mail, please try again later.');
      }
    }
    return '';
  }

  public static async setPassword(
    payload: SetHostPasswordRequestDto,
  ): Promise<TokenResponseAndRoles> {
    const { password, token, repeatedPassword } = payload;
    if (password !== repeatedPassword) throw new BadRequestError('Passwords do not match.');
    const changePasswordRequest: ChangePasswordRequest = {
      password: payload.password,
    };
    const fusionAuthResponse = await fusionAuthClientHandler
      .fusionAuthClient()
      .retrieveUserByChangePasswordId(token);
    const email = fusionAuthResponse?.response?.user?.email;
    if (!email) {
      throw new BadRequestError(
        'The email address you provided does not match any account in our system. Please check for any typos or try a different email.',
      );
    }
    const changePasswordFusionAuthResponse = await fusionAuthClientHandler
      .fusionAuthClient()
      .changePassword(token, changePasswordRequest);
    if (changePasswordFusionAuthResponse?.statusCode !== 200) {
      throw new BadRequestError('Unable to reset password, please try again later.');
    }
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { email: email }, relations: { roles: { role: true } } });
    const isAdmin = user.roles.some(role => role.role.name === 'admin');
    const isHost = user.roles.some(role => role.role.name === 'host');

    if (isAdmin) {
      return await this.adminLogin({ email, password });
    } else if (isHost) {
      return await this.hostLogin({ email, password });
    }
  }

  public static async loginSSO(): Promise<LoginSSOResponse> {
    const uri = `${config.get('FUSIONAUTH_BASE_URL')}oauth2/authorize?client_id=${config.get('FUSIONAUTH_APP_ID')}&response_type=code&redirect_uri=${encodeURIComponent(config.get('FUSIONAUTH_GATEWAY_URI') + 'v1/auth/oauth-redirect')}`;
    return responses.data(uri);
  }

  public static async oAuthRedirect(payload: OAuthRequestDto): Promise<OAuthRedirectResponse> {
    const accesToken = await fusionAuthClientHandler
      .fusionAuthClient()
      .exchangeOAuthCodeForAccessToken(
        payload.code,
        config.get('FUSIONAUTH_APP_ID'),
        config.get('FUSIONAUTH_CLIENT_SECRET'),
        config.get('FUSIONAUTH_GATEWAY_URI') + 'v1/auth/oauth-redirect',
      );

    return responses.data(accesToken.response.access_token);
  }

  public static async checkPhoneNumber(payload: PhoneNumberRequestDto): Promise<Validity> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: {
        phoneNumber: payload.phoneNumber,
        deletedAt: IsNull(),
      },
    });
    if (user) return { isValid: false };

    //Micro-service call
    try {
      await serviceMesh.notificationService().sendVerificationCode(payload.phoneNumber);
    } catch (error) {}
    return { isValid: true };
  }

  public static async checkEmail(payload: CheckEmailRequestDto): Promise<Validity> {
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { email: payload.email, deletedAt: IsNull() } });
    if (user) {
      throw new ConflictError('This email is already taken');
    }
    return { isValid: true };
  }

  public static async checkAge(payload: CheckAgeRequestDto): Promise<Validity> {
    if (dayjs(new Date()).diff(payload.dateOfBirth, 'year') < 18) {
      throw new BadRequestError('Error. Age requirement not met.');
    }
    return { isValid: true };
  }

  public static async sendInvitations(payload: UserInvitationsRequestDto): Promise<string> {
    const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!user) {
      throw new NotFoundError('user');
    }

    const invitations = await Promise.all(
      payload.phoneNumbers.map(async phoneNumber => {
        try {
          const existingInvitation = await this.dbConnection
            .getRepository(Invitation)
            .findOneBy({ phoneNumber });
          if (existingInvitation) return existingInvitation;

          const invitation = new Invitation();
          invitation.phoneNumber = phoneNumber;
          invitation.inviteeUser = user;
          return await this.dbConnection.getRepository(Invitation).save(invitation);
        } catch (err) {
          return null;
        }
      }),
    );
    const successfulInvitations = invitations
      .filter(invitation => invitation)
      .map(invitation => invitation.phoneNumber);

    // Micro-service call
    try {
      const success = await serviceMesh
        .notificationService()
        .sendInvitationMessages(successfulInvitations, user.firstName);
      if (!success) {
        throw new BadRequestError('An error occured while sending invitations, please try again.');
      }
    } catch (error) {}

    return '';
  }

  public static async saveInvitations(payload: UserInvitationsRequestDto): Promise<string> {
    const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!user) {
      throw new NotFoundError('user');
    }

    await Promise.all(
      payload.phoneNumbers.map(async phoneNumber => {
        try {
          const existingInvitation = await this.dbConnection
            .getRepository(Invitation)
            .findOneBy({ phoneNumber });
          if (existingInvitation) return existingInvitation;

          const invitation = new Invitation();
          invitation.phoneNumber = phoneNumber;
          invitation.inviteeUser = user;
          return await this.dbConnection.getRepository(Invitation).save(invitation);
        } catch (err) {
          return null;
        }
      }),
    );
    return '';
  }

  public static async inviteNewMember(payload: InviteNewMemberRequestDto): Promise<string> {
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
    const invitee = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!invitee) {
      throw new NotFoundError('User');
    }

    const existingUser = await this.dbConnection.getRepository(User).findOne({
      where: [{ phoneNumber: payload.phoneNumber }, { email: payload.email }],
    });

    if (existingUser) {
      if (existingUser.phoneNumber === payload.phoneNumber) {
        throw new BadRequestError('This user is already a part of our database');
      }

      if (existingUser.email === payload.email) {
        throw new BadRequestError('This user is already a part of our database');
      }
    }

    const invitation = new Invitation();
    invitation.phoneNumber = payload.phoneNumber;
    invitation.email = payload.email;
    invitation.referralCode = payload.referralCode;
    invitation.inviteeUser = invitee;

    await this.dbConnection.getRepository(Invitation).save(invitation);

    if (payload.phoneNumber) {
      const message =
        `Hi, ${invitee.firstName} would like to invite you to join Rumor. Download the app here. ` +
        (payload.referralCode ? `Referral code: ${payload.referralCode}.` : ``);

      //Micro-service call
      try {
        const validateNumber = isValidPhoneNumber(payload.phoneNumber);
        if (validateNumber) {
          const cleanedNumber = payload.phoneNumber.replace(/[\s\-()]/g, '');
          await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
        } else {
          // Log the issue and exit early (no throw)
          console.log(
            `⚠️ Skipping SMS: Invalid phone number "${payload.phoneNumber}". Missing country code?`,
          );
          return; // or just skip sending, depending on your function structure
        }
      } catch (err) {
        console.error(`❌ Error while processing SMS for ${payload.phoneNumber}:`, err);
      }
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
      try {
        const success = await serviceMesh
          .notificationService()
          .sendEmailFromTemplate(params, 'Invite New Member', [payload.email.trim()], null);
        if (!success) {
          throw new BadRequestError(
            'An error occured while sending SMS invitation, please try again.',
          );
        }
      } catch (error) {}
    }

    return '';
  }

  public static async inviteNewHost(payload: InviteNewHostRequestDto): Promise<string> {
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
    const invitee = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!invitee) {
      throw new NotFoundError('User');
    }

    const whereCondition: FindOptionsWhere<User>[] = [{ email: payload.email }];
    if (payload.phoneNumber) {
      whereCondition.push({ phoneNumber: payload.phoneNumber });
    }

    const existingUser = await this.dbConnection.getRepository(User).findOne({
      where: whereCondition,
    });

    if (existingUser) {
      if (payload.phoneNumber && existingUser.phoneNumber === payload.phoneNumber) {
        throw new ForbiddenError('This user is already a part of our database.');
      }

      if (existingUser.email === payload.email) {
        throw new ForbiddenError('This user is already a part of our database.');
      }
    }

    const invitation = new Invitation();
    invitation.phoneNumber = payload.phoneNumber;
    invitation.email = payload.email;
    invitation.inviteeUser = invitee;

    await this.dbConnection.getRepository(Invitation).save(invitation);

    const params = [
      {
        key: 'invitee_first_name',
        value: payload.name,
      },
    ];

    // Micro-service call
    try {
      const success = await serviceMesh
        .notificationService()
        .sendEmailFromTemplate(params, 'Host Invited by Rumor Admin', [payload.email.trim()], null);
      if (!success) {
        throw new BadRequestError(
          'An error occured while sending Email invitation, please try again.',
        );
      }
    } catch (error) {}

    return '';
  }

  public static async saveOrUpdateProvider(
    payload: SaveOrUpdateProviderAuthRequestDto,
  ): Promise<SaveOrUpdateProviderAuthResponse> {
    const payloadClone = { ...payload };
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: {
        id: payload.userId,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    let socialProvider: SocialProvider = await this.dbConnection
      .getRepository(SocialProvider)
      .findOne({
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

  public static async checkMemberLogin(payload: LoginVerificationRequestDto): Promise<Validity> {
    if (payload.phoneNumber) {
      payload.phoneNumber = payload.phoneNumber.trim().split(' ').join('');
    }
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
    const isEmailLogin = !!payload.email;
    const loginIdentifier = isEmailLogin ? payload.email : payload.phoneNumber;

    if (!loginIdentifier) {
      throw new BadRequestError('Email or phone number is required.');
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
    if (!user) {
      try {
        if (isEmailLogin) {
          await this.sendVerificationCodeByEmail({ email: payload.email });
        } else {
          await serviceMesh.notificationService().sendVerificationCode(payload.phoneNumber);
        }
      } catch (error) {}
      return { isValid: false };
    }

    const request: PasswordlessStartRequest = {
      applicationId: config.get('FUSIONAUTH_APP_ID'),
      loginId: user.email,
    };

    // Remove all previous login attempts (both email and phone)
    const existingLoginAttempts = await this.dbConnection
      .getRepository(TemporaryLoginCode)
      .find({ where: { phoneNumber: payload.phoneNumber, email: payload.email } });
    // const existingLoginAttempts = await this.dbConnection.getRepository(TemporaryLoginCode).find({ where: { phoneNumber: payload.phoneNumber } });

    if (existingLoginAttempts.length) {
      await Promise.all(
        existingLoginAttempts.map(async attempt => {
          await this.dbConnection.getRepository(TemporaryLoginCode).delete(attempt.id);
        }),
      );
    }

    try {
      await fusionAuthClientHandler.fusionAuthClient().retrieveUserByEmail(user.email);
    } catch (error) {
      const guest = await this.dbConnection.getRepository(Guest).findOne({
        where: { user: { id: user.id } },
      });

      if (guest) {
        try {
          if (isEmailLogin) {
            await this.sendVerificationCodeByEmail({ email: payload.email });
          } else {
            serviceMesh.notificationService().sendVerificationCode(payload.phoneNumber);
          }
        } catch (error) {}
        return { isValid: true, isGuest: true, isDeactivated: user.isDeactivated };
      } else {
        try {
          if (isEmailLogin) {
            await this.sendVerificationCodeByEmail({ email: payload.email });
          } else {
            serviceMesh.notificationService().sendVerificationCode(payload.phoneNumber);
          }
        } catch (error) {}
        return { isValid: true, isGuest: false, isDeactivated: user.isDeactivated };
      }
    }

    // Start a new login and save the code
    const code = await fusionAuthClientHandler.fusionAuthClient().startPasswordlessLogin(request);
    const temporaryLoginCode = new TemporaryLoginCode();
    temporaryLoginCode.email = payload.email;
    temporaryLoginCode.phoneNumber = payload.phoneNumber;
    temporaryLoginCode.code = code.response.code;
    await this.dbConnection.getRepository(TemporaryLoginCode).save(temporaryLoginCode);

    try {
      if (isEmailLogin) {
        //TODO: change and proper format

        // Micro-service call
        await serviceMesh.notificationService().sendEmailFromTemplate(
          [
            {
              key: 'code',
              value: code.response.code,
            },
          ],
          'Non-Member Verify Email',
          [payload.email.trim()],
          null,
        );
      } else {
        // Send verification text for phone login unless bypass conditions are met
        if (
          config.get('APP_REVIEW_PHONE_NUMBER') !== payload.phoneNumber ||
          !config.get('BYPASS_VERIFICATION_CODE')
        ) {
          const message = 'Your Rumor verification code: ' + code.response.code;
          try {
            const validateNumber = isValidPhoneNumber(payload.phoneNumber);
            if (validateNumber) {
              const cleanedNumber = payload.phoneNumber.replace(/[\s\-()]/g, '');
              await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
            } else {
              // Log the issue and exit early (no throw)
              console.log(
                `⚠️ Skipping SMS: Invalid phone number "${payload.phoneNumber}". Missing country code?`,
              );
              return; // or just skip sending, depending on your function structure
            }
          } catch (err) {
            console.error(`❌ Error while processing SMS for ${payload.phoneNumber}:`, err);
          }
        }
      }
    } catch (error) {}

    return { isValid: true, isDeactivated: user.isDeactivated };
  }

  public static async memberLogin(payload: MemberLoginRequestDto): Promise<TokenResponseAndRoles> {
    if (payload.phoneNumber) {
      payload.phoneNumber = payload.phoneNumber.trim().split(' ').join('');
    }
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
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

    if (payload.isDeactivated && user.isDeactivated) {
      this.reactivateUserAccount({ email: user.email });
    }

    // If user is not found, verify OTP and create a new user entry
    if (payload.isGuest) {
      try {
        const verificationResult = isEmailLogin
          ? await this.verifyCodeByEmail({ email: payload.email, verificationCode: payload.code })
          : await serviceMesh.notificationService().verifyCode(payload.phoneNumber, payload.code);

        const isVerified: boolean =
          ('verified' in verificationResult && verificationResult.verified === true) ||
          ('data' in verificationResult && verificationResult.data?.verified === true);

        if (!isVerified) {
          throw new NotFoundError('Invalid or expired verification code, please try again.');
        }
      } catch (error) {}

      // Check for invitation and set flags
      const invitation = await this.dbConnection.getRepository(Invitation).findOne({
        where: { phoneNumber: payload.phoneNumber, email: payload.email },
      });
      const isSignUpCompleted = invitation?.signUpComplete || false;
      const isInvited = !!invitation;

      const role: Role[] = await this.dbConnection
        .getRepository(Role)
        .find({ where: { name: 'non_member' } });

      return {
        token: '',
        roles: [
          {
            roleName: role[0].name,
            roleId: role[0].id,
          },
        ],
        isSignUpCompleted,
        isInvited,
        id: user.id,
        user: user,
        isGuest: true,
      };
    }

    if (!user && !payload.isExist) {
      try {
        const verificationResult = isEmailLogin
          ? await this.verifyCodeByEmail({ email: payload.email, verificationCode: payload.code })
          : await serviceMesh.notificationService().verifyCode(payload.phoneNumber, payload.code);

        const isVerified: boolean =
          ('verified' in verificationResult && verificationResult.verified === true) ||
          ('data' in verificationResult && verificationResult.data?.verified === true);

        if (!isVerified) {
          throw new NotFoundError('Invalid or expired verification code, please try again.');
        }
      } catch (error) {}

      // Check for invitation and set flags
      const invitation = await this.dbConnection.getRepository(Invitation).findOne({
        where: { phoneNumber: payload.phoneNumber, email: payload.email },
      });
      const isSignUpCompleted = invitation?.signUpComplete || false;
      const isInvited = !!invitation;

      const role: Role[] = await this.dbConnection
        .getRepository(Role)
        .find({ where: { name: 'non_member' } });

      return {
        id: '',
        token: '',
        roles: [
          {
            roleName: role[0].name,
            roleId: role[0].id,
          },
        ],
        isSignUpCompleted,
        isInvited,
        user: user,
        isGuest: false,
      };
    }

    // Handle bypass verification logic for testing or review environment
    if (
      config.get('APP_REVIEW_LOGIN') === loginIdentifier ||
      config.get('BYPASS_VERIFICATION_CODE')
    ) {
      const temporaryCode = await this.dbConnection
        .getRepository(TemporaryLoginCode)
        .findOne({ where: { phoneNumber: payload.phoneNumber, email: payload.email } });
      if (!temporaryCode) throw new NotFoundError('Unable to login, please try again.');

      let completedLogin;
      try {
        completedLogin = await fusionAuthClientHandler
          .fusionAuthClient()
          .passwordlessLogin({ code: temporaryCode.code });
      } catch (error) {
        try {
          const verificationResult = isEmailLogin
            ? await this.verifyCodeByEmail({ email: payload.email, verificationCode: payload.code })
            : await serviceMesh.notificationService().verifyCode(payload.phoneNumber, payload.code);

          const isVerified: boolean =
            ('verified' in verificationResult && verificationResult.verified === true) ||
            ('data' in verificationResult && verificationResult.data?.verified === true);

          if (!isVerified) {
            throw new NotFoundError('Invalid or expired verification code, please try again.');
          }

          return {
            id: user.id,
            token: '',
            roles: user.roles.map(item => ({
              roleName: item.role.name,
              roleId: item.role.id,
            })),
            user: user,
            isGuest: false,
          };
        } catch (error) {}
      }

      // if (completedLogin.statusCode > 299) {
      //   throw new NotFoundError(`Unable to login. ${completedLogin.exception.message}`);
      // }

      await this.dbConnection.getRepository(TemporaryLoginCode).delete(temporaryCode.id);

      // Save FCM Token for the User
      SettingsService.savePushNotificationToken({
        userId: user.id,
        token: payload.fcmToken,
        deviceId: payload.deviceId,
      });
      return {
        id: user.id,
        token: completedLogin?.response?.token,
        roles: user.roles.map(item => ({
          roleName: item.role.name,
          roleId: item.role.id,
        })),
        user: user,
        isGuest: false,
      };
    } else {
      const temporaryCode = await this.dbConnection.getRepository(TemporaryLoginCode).findOne({
        where: {
          [isEmailLogin ? 'email' : 'phoneNumber']: loginIdentifier,
          code: payload.code,
        },
      });
      if (!temporaryCode) {
        throw new NotFoundError('Unable to login.');
      }

      const completedLogin = await fusionAuthClientHandler
        .fusionAuthClient()
        .passwordlessLogin({ code: payload.code });
      if (completedLogin.statusCode > 299) {
        throw new BadRequestError('Unable to login.');
      }

      await this.dbConnection.getRepository(TemporaryLoginCode).delete(temporaryCode.id);

      // Save FCM Token for the User
      SettingsService.savePushNotificationToken({
        userId: user.id,
        token: payload.fcmToken,
        deviceId: payload.deviceId,
      });

      return {
        token: completedLogin.response?.token,
        roles: user.roles.map(item => ({
          roleName: item.role.name,
          roleId: item.role.id,
        })),
        id: user.id,
        user: user,
        isGuest: false,
      };
    }
  }

  public static async hostLogin(payload: LoginRequestDto): Promise<TokenResponseAndRoles> {
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
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
    if (!user) {
      throw new NotFoundError('Host');
    }

    let authenticatedUser = null;
    const request: LoginRequest = {
      loginId: user.email,
      password: payload.password,
    };
    try {
      authenticatedUser = await fusionAuthClientHandler.fusionAuthClient().login(request);
    } catch (e) {
      throw new BadRequestError('Invalid email or password');
    }
    if (!authenticatedUser) {
      throw new BadRequestError('Invalid email or password');
    }
    const additionalHostInformation = user.additionalHostInformation;
    const data = {
      token: authenticatedUser.response.token,
      roles: user.roles.map(item => {
        return { roleName: item.role.name, roleId: item.role.id };
      }),
      hostDetails: {
        companyLogo: additionalHostInformation?.companyLogo || '',
        companyName: additionalHostInformation?.companyName || '',
        id: user.id,
      },
    };

    // Save FCM Token
    SettingsService.savePushNotificationToken({
      userId: user.id,
      token: payload.fcmToken,
      deviceId: payload.deviceId,
    });
    return data;
  }

  public static async getCurrentMember(payload: IdRequestDto): Promise<CurrentMember> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id },
      relations: { address: true, socialProviders: true, roles: { role: true } },
    });

    if (!user) {
      throw new NotFoundError('user');
    }

    const memberRole = user.roles.find(role => role.role.name === 'member');

    if (memberRole === undefined) {
      throw new NotFoundError('User');
    }

    // Mirco-service call
    const focuses = await PlatformService.getUserFocuses({ id: user.id });

    const socialProvider: SocialProvider = await this.dbConnection
      .getRepository(SocialProvider)
      .findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.INSTAGRAM,
        },
        relations: ['user'],
      });

    return toCurrentMember(user, focuses, memberRole, socialProvider?.username);
  }

  public static async getUser(payload: IdRequestDto): Promise<SimpleUser> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id },
      relations: { address: true, socialProviders: true, roles: { role: true } },
    });

    if (!user) {
      throw new NotFoundError('user');
    }

    const memberRole = user.roles.find(
      role =>
        role.role.name === 'member' || role.role.name === 'host' || role.role.name === 'non_member',
    );

    if (memberRole === undefined) {
      throw new NotFoundError('user');
    }

    const data = toSimpleUser(user, memberRole);
    return data;
  }

  public static async getMe(payload: IdRequestDto): Promise<CurrentUser> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id },
      relations: { address: true, socialProviders: true, roles: { role: true } },
    });
    if (!user) {
      throw new NotFoundError('user');
    }
    if (!user.roles.length) {
      throw new ForbiddenError('insufficient permissions');
    }

    //Micro-service call
    const focuses = await PlatformService.getUserFocuses({ id: user.id });
    const roleData = user.roles.map(role => toCurrentUser(user, focuses, [role]));
    return {
      ...roleData[0],
      role: roleData.flatMap(r => r.role),
    };
  }

  public static async updateUserProfile(
    payload: UpdateUserProfileRequestDto,
  ): Promise<UserProfile> {
    const GOOGLE_MAPS_API_KEY = config.get('GOOGLE_MAPS_API_KEY');
    const actualUser = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: null },
      relations: ['address'],
    });
    if (!actualUser) {
      throw new NotFoundError('user');
    }
    const updateUserPayload: Partial<User> = {};

    for (const [key, val] of Object.entries(payload)) {
      if (key == 'gender') {
        const genderKey = val as keyof typeof genderToEntity;
        updateUserPayload[key] = genderToEntity[genderKey];
      } else if (key == 'birthDate') {
        updateUserPayload.dateOfBirth = payload.birthDate;
      } else if (key !== 'address' && key != 'focusIds') {
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
          const addressValidationClient = new AddressValidationClient({
            authClient: this.googleAuthClient,
          });
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
        const placeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${payload.address.placeId}&key=${GOOGLE_MAPS_API_KEY}`,
        );
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
    if (payload.focusIds && payload.focusIds.length > 0) {
      await PlatformService.saveFocusesForUser({
        userId: payload.id,
        focusIds: payload.focusIds,
      });
    }
    const responseUser = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: null },
      relations: {
        address: true,
        roles: {
          role: true,
        },
      },
    });

    const memberRole = responseUser.roles.find(role => role.role.name === 'member');
    const nonMemberRole = responseUser.roles.find(role => role.role.name === 'non-member');
    const hostRole = responseUser.roles.find(role => role.role.name === 'host');

    let userStatus = null;
    let userSource = null;

    if (memberRole) {
      userStatus = entityToUserStatus[memberRole.status];
      userSource = memberRole.source ? entityToUserSource[memberRole.source] : null;
    } else if (nonMemberRole) {
      userStatus = entityToUserStatus[nonMemberRole.status];
      userSource = nonMemberRole.source ? entityToUserSource[nonMemberRole.source] : null;
    } else if (hostRole) {
      userStatus = entityToUserStatus[hostRole.status];
      userSource = hostRole.source ? entityToUserSource[hostRole.source] : null;
    }

    return {
      firstName: responseUser.firstName || null,
      email: responseUser.email || null,
      lastName: responseUser.lastName || null,
      birthDate: responseUser.dateOfBirth,
      mobilePhone: responseUser.phoneNumber || null,
      gender: entityToGender[responseUser.gender || 'NOT_APPLICABLE'],
      status: userStatus,
      source: userSource,
      address: responseUser.address
        ? {
            address: responseUser.address?.address,
            placeId: responseUser.address.googlePlaceId,
            latitude: String(responseUser.address.latitude),
            longitude: String(responseUser.address.longitude),
            city: responseUser.address.city,
          }
        : null,
    };
  }

  public static async updateUserProfilePicture(
    payload: UpdateUserProfilePictureRequestDto,
  ): Promise<UserProfilePicture> {
    let actualUser = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: null },
      relations: ['address'],
    });
    if (!actualUser) {
      throw new NotFoundError('user');
    }
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
    return { profilePicture: actualUser.profilePicture };
  }

  public static async getBioProfile(payload: IdRequestDto): Promise<AdditionalHostInformation> {
    const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    const additionalInfo = user.additionalHostInformation;
    return additionalInfo;
  }

  public static async createBioProfile(
    payload: BioProfileRequestDto,
  ): Promise<AdditionalHostInformation> {
    const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!user) {
      throw new NotFoundError('user');
    }
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
    return additionalInfo;
  }

  public static async updateBioProfile(
    payload: BioProfileRequestDto,
  ): Promise<AdditionalHostInformation> {
    const user = await this.dbConnection.getRepository(User).findOneBy({ id: payload.userId });
    if (!user) {
      throw new NotFoundError('user');
    }
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
    return additionalInfo;
  }

  public static async approveMember(payload: IdRequestDto): Promise<GenericResponse> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: null },
      relations: { roles: { role: true } },
    });
    if (!user) {
      throw new NotFoundError('user');
    }
    const nonMemberUserRole = user.roles.find(userRole => userRole.role.name === 'non_member');
    if (!nonMemberUserRole) return responses.notFound('User not found!');

    // Find the member role
    const memberRole = await this.dbConnection
      .getRepository(Role)
      .findOne({ where: { name: 'member' } });
    if (!memberRole) {
      throw new NotFoundError('Member role not found');
    }

    // Find the user's current role entry
    const userRole = await this.dbConnection
      .getRepository(UserRole)
      .findOne({ where: { user: { id: payload.id } } });
    if (!userRole) {
      throw new NotFoundError('User role entry not found');
    }

    // Update role and status
    nonMemberUserRole.role = memberRole;
    nonMemberUserRole.status = UserStatus.ACTIVE;
    await this.dbConnection.getRepository(UserRole).save(nonMemberUserRole);

    try {
      await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'link_to_application',
            value: config.get('RUMOR_WEBSITE_ADMIN') + `users/${user.id}`,
          },
        ],
        'Member Approved into Rumor',
        [user.email.trim()],
        null,
      );
    } catch (error) {}

    try {
      // Send Notification
      serviceMesh
        .notificationService()
        .sendNotification(NotificationType.APPLICATION_APPOVED, user.id);
    } catch (error) {
      console.log('🚀 ~ AuthService ~ approveMember ~ error:', error);
    }

    return responses.ok;
  }

  public static async listUsersByType(
    payload: ListUsersByTypeRequestDto,
  ): Promise<UserDataSimple[]> {
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
    const userList = users.map(user => {
      return toUserDataSimple(user);
    });
    return userList;
  }

  public static async updateUsersStatus(payload: UpdateUsersStatusDto): Promise<any> {
    const users = await this.dbConnection.getRepository(User).find({
      where: { id: In(payload.ids), deletedAt: null },
      relations: { roles: { role: true } },
    });

    if (users.length === 0) {
      throw new NotFoundError('Users');
    }

    const memberRole = await this.dbConnection
      .getRepository(Role)
      .findOne({ where: { name: 'member' } });
    if (!memberRole) {
      throw new NotFoundError('Role');
    }

    const userRoles = await this.dbConnection.getRepository(UserRole).find({
      where: { user: { id: In(payload.ids) } },
      relations: ['user', 'role'],
    });

    if (userRoles.length === 0) {
      throw new NotFoundError('UserRole');
    }

    const failedUsers: string[] = [];
    const usersToUpdate: { userRole: any; newStatus: UserStatus; newRole?: any }[] = [];

    for (const user of users) {
      if (payload.status === UserStatus.WAITLISTED) {
        // Make him non-member
        continue;
      }

      const userRole = userRoles.find(ur => ur.user.id === user.id);
      const nonMemberUserRole = userRoles.find(
        ur => ur.user.id === user.id && ur.role.name === 'non_member',
      );

      if (nonMemberUserRole) {
        usersToUpdate.push({
          userRole: nonMemberUserRole,
          newStatus: payload.status,
          newRole: memberRole,
        });
      }

      if (userRole) {
        usersToUpdate.push({ userRole, newStatus: payload.status });
      }

      // if (payload.status === UserStatus.WAITLISTED) {
      // if (userRoles.some((ur) => ur.user.id === user.id && ur.status === UserStatus.ACTIVE)) {
      //   console.error(`User ${user.id} is active and cannot be waitlisted`);
      //   failedUsers.push(user.id);
      //   continue;
      // }
      // }
      // if (payload.status === UserStatus.ACTIVE && nonMemberUserRole) {
      //   usersToUpdate.push({ userRole: nonMemberUserRole, newStatus: payload.status, newRole: memberRole });
      // }

      // if (payload.status === UserStatus.DEACTIVATED && userRole) {
      //   usersToUpdate.push({ userRole, newStatus: UserStatus.DEACTIVATED });
      // }
    }

    // Perform bulk updates only for valid users
    for (const update of usersToUpdate) {
      update.userRole.status = update.newStatus;
      if (update.newRole) {
        update.userRole.role = update.newRole;
      }
      await this.dbConnection.getRepository(UserRole).save(update.userRole);

      // Mark user as deactivated
      if (update.newStatus === UserStatus.DEACTIVATED) {
        await this.dbConnection.getRepository(User).update(update.userRole.user.id, {
          isDeactivated: true,
          deactivatedAt: new Date(),
        });
      }

      // Send email only to users who are now "ACTIVE" and got the "member" role
      try {
        if (update.newStatus === UserStatus.ACTIVE && update.newRole) {
          const user = users.find(u => u.id === update.userRole.user.id);
          if (user) {
            await serviceMesh.notificationService().sendEmailFromTemplate(
              [
                {
                  key: 'link_to_application',
                  value: config.get('RUMOR_WEBSITE_ADMIN') + `users/${user.id}`,
                },
              ],
              'Member Approved into Rumor',
              [user.email.trim()], // Send email to the approved member
              null,
            );
          }
        }
      } catch (error) {}
    }

    return { failedUsers, usersToUpdate };
  }

  public static async createNonMemberUser(
    payload: CreateNonMemberUserRequestDto,
  ): Promise<UserIdData> {
    const exists = await this.dbConnection
      .getRepository(User)
      .findOne({ where: [{ email: payload.email }, { phoneNumber: payload.phoneNumber }] });
    if (exists) {
      throw new BadRequestError('user exists');
    }
    let user = new User();
    user.email = payload.email;
    user.firstName = payload.firstName || 'NA';
    user.lastName = payload.lastName || 'NA';
    user.phoneNumber = payload.phoneNumber || '';
    user = await this.dbConnection.getRepository(User).save(user);
    await RoleService.assignRoleToUser({ userId: user.id, roleName: 'non_member' });
    return { userId: user.id };
  }

  public static async createHostCollaborator(
    payload: CreateHostCollaboratorRequestDto,
  ): Promise<UserIdData> {
    const exists = await this.dbConnection
      .getRepository(User)
      .findOne({ where: [{ email: payload.email }] });
    if (exists) {
      throw new BadRequestError('user exists');
    }
    let user = new User();

    user.email = payload.email;
    user.firstName = payload.firstName || 'NA';
    user.lastName = payload.lastName || 'NA';
    user.phoneNumber = payload.phoneNumber || '';
    user = await this.dbConnection.getRepository(User).save(user);
    //check if user role is already in the database
    const userWithRoles: any = await this.getUserWithRolesByEmail({ email: payload.email });
    const hasRole = userWithRoles.roles.some(role => role.name === payload.role);
    if (!hasRole) {
      await RoleService.assignRoleToUser({ userId: user.id, roleName: RoleType.NonMember });
    }
    return { userId: user.id };
  }

  public static async getMembersOrNonMembers(payload: ListUsersInviteesDto): Promise<Member[]> {
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
          relations: ['usersLists', 'usersLists.user'],
        });
        if (customList) {
          const customListUserIds = customList.usersLists.map(listUser => listUser.user.id);
          const existingUserIds = Array.isArray(parsedQuery.usersIds)
            ? parsedQuery.usersIds.filter((id): id is string => typeof id === 'string')
            : typeof parsedQuery.usersIds === 'string'
              ? parsedQuery.usersIds.split(',')
              : [];

          parsedQuery.usersIds = [...existingUserIds, ...customListUserIds];
        }
      }
    }
    const followed =
      parsedQuery.followed === 'true' ? true : parsedQuery.followed === 'false' ? false : false;
    const favorite =
      parsedQuery.favorite === 'true' ? true : parsedQuery.favorite === 'false' ? false : false;
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
          .map(id => id.trim()),
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
      user =>
        user.roles.find(role => role.role.name === 'member' && role.status === 'ACTIVE') ||
        user.roles.find(role => role.role.name === 'non_member'),
    );
    const members = await Promise.all(
      users.map(async user => {
        // Micro-service call
        const focuses = await PlatformService.getUserFocuses({ id: user.id });
        const interests = await PlatformService.getUserInterests({ id: user.id });

        const socialProvider: SocialProvider = await this.dbConnection
          .getRepository(SocialProvider)
          .findOne({
            where: {
              user: {
                id: user.id,
              },
              type: SocialProviderType.FACEBOOK,
            },
            relations: ['user'],
          });

        return toMember(
          user,
          focuses,
          interests,
          user.roles[0],
          undefined,
          socialProvider?.username,
        );
      }),
    );
    return members;
  }

  public static async manageFollowHost(payload: ManageFollowHostRequestDto): Promise<string> {
    const { userId, hostId, follow } = payload;
    const [follower, host] = await this.findUsers(userId, hostId);
    if (!follower) {
      throw new NotFoundError('User');
    }
    if (!host) {
      throw new NotFoundError('Host');
    }
    const validateRoleHost = host.roles.find(role => role.role.name === 'host');
    if (!validateRoleHost) {
      throw new NotFoundError('User');
    }
    if (follower.id === host.id) {
      throw new BadRequestError('You cannot follow yourself!');
    }
    const followHost = await this.dbConnection.getRepository(HostFollowing).findOne({
      where: {
        follower: { id: follower.id },
        host: { id: host.id },
      },
    });

    if (follow) {
      if (followHost) {
        throw new BadRequestError('Already following host');
      }
      await this.addFollowHost(follower, host);
    } else {
      if (!followHost) {
        throw new BadRequestError('You are not following this host!');
      }
      await this.dbConnection.getRepository(HostFollowing).delete({ follower, host });
    }
    return '';
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
    const followHost = { follower, host };
    await this.dbConnection.getRepository(HostFollowing).save(followHost);
  }

  public static async addFavoriteHost(member: User, host: User): Promise<void> {
    const favoriteHost = { member, host };
    await this.dbConnection.getRepository(HostFavorite).save(favoriteHost);
  }

  public static async getFollowedHosts(payload: PaginatedRequestDto): Promise<HostsProfile> {
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const name = parsedQuery?.name ? String(parsedQuery.name).toLowerCase() : undefined;

    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: { following: { host: true } },
    });

    if (!user) {
      throw new NotFoundError('user');
    }
    const followingIds = user.following.map(follow => follow.host.id);

    let hostsFollowing = await this.dbConnection.getRepository(User).find({
      where: [{ id: In(followingIds) }],
      relations: { roles: { role: true } },
      take,
      skip,
    });

    hostsFollowing = hostsFollowing.filter(host =>
      host.roles.some(role => role.role.name === 'host'),
    );
    const transformedHosts = hostsFollowing.map(item => {
      const hostProfile = toBasicHostProfile(
        item,
        entityToUserStatus[item.roles.find(el => el.role.name === 'host').status],
        entityToUserSource[item.roles.find(el => el.role.name === 'host').source],
      );

      return hostProfile;
    });

    if (name) {
      return {
        hosts: transformedHosts
          .filter(host => host.companyName.toLowerCase().includes(name))
          .slice(skip, skip + take),
      };
    }
    return { hosts: transformedHosts };
  }

  public static async getCustomUsersLists(
    payload: CustomUsersListRequestDto,
  ): Promise<CustomUsersListsData> {
    const { userId } = payload;
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
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
      return { totalCount: 0, result: [] };
    }

    const allLists = [
      { id: null, name: 'Followed', totalCount: user.followers.length, result: [] },
      { id: null, name: 'Favorite', totalCount: user.favoritedMembers.length, result: [] },
      ...user.customLists.map(list => ({
        id: list.id,
        name: list.listName,
        totalCount: list.usersLists.length,
        result: [],
      })),
    ];

    return {
      totalCount: allLists.length,
      result: allLists.slice(skip, take ? skip + take : undefined),
    };
  }

  public static async getCustomUsersList(
    payload: CustomUsersListRequestDto,
  ): Promise<CustomUsersList> {
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
      throw new NotFoundError('User');
    }

    const customList = user.customLists.find(list => list.id === customListId);
    if (!customList) {
      throw new NotFoundError('CustomList');
    }

    const userIds = customList.usersLists.map(listUser => listUser.user.id);
    const queryBuilder = this.dbConnection
      .getRepository(User)
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
      userTypes = type.split(',').map(name => name.trim());
    }
    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder
        .addOrderBy('user.firstName', sortDirection)
        .addOrderBy('user.lastName', sortDirection);
    } else {
      queryBuilder.orderBy('usersList.createdAt', 'DESC');
    }
    await this.applyUserFilters(
      queryBuilder,
      parsedQuery,
      searchValue,
      focuses,
      interest,
      gender,
      baseCity,
      hostId,
      userTypes,
    );

    const [allUsers, totalCount] = await queryBuilder.getManyAndCount();
    let paginatedUsers = allUsers;
    if (take !== undefined && skip !== undefined) {
      paginatedUsers = allUsers.slice(skip, skip + take);
    }

    const favorites = await this.dbConnection.getRepository(HostFavorite).find({
      where: { host: { id: hostId } },
      relations: ['member'],
    });
    const favoriteUserIds = favorites.map(fav => fav.member.id);
    this.dbConnection.getRepository(HostCustomUsersListsUsers).find;
    const userMappingIds = await this.dbConnection.getRepository(HostCustomUsersListsUsers).find({
      where: {
        list: { id: customListId },
        user: In(userIds),
      },
      relations: ['user'],
      select: ['id', 'user'],
    });

    const mappingIdMap: { [key: string]: string } = {};
    userMappingIds.forEach(mapping => {
      mappingIdMap[mapping.user.id] = mapping.id;
    });

    const users = await Promise.all(
      paginatedUsers.map(async user => {
        const focuses = await PlatformService.getUserFocuses({ id: user.id });
        const interests = await PlatformService.getUserInterests({ id: user.id });

        const socialProvider: SocialProvider = await this.dbConnection
          .getRepository(SocialProvider)
          .findOne({
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

    const data = {
      name: customList.listName,
      id: customList.id,
      totalCount: totalCount,
      result: users,
    };

    return data;
  }

  public static async deleteCustomUsersList(payload: UserAndIdRequestDto): Promise<string> {
    const { userId, id } = payload;

    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: { customLists: true },
    });
    if (!user) {
      throw new NotFoundError('User');
    }

    if (!userId) {
      throw new NotFoundError('User ids not found.');
    }

    const customList = user.customLists.find(list => list.id === id);
    if (!customList) {
      throw new NotFoundError('Custom List');
    }
    await this.dbConnection
      .getRepository(HostCustomUsersListsUsers)
      .delete({ list: { id: customList.id } });
    await this.dbConnection.getRepository(HostCustomUsersLists).delete({ id: customList.id });
    return '';
  }

  public static async createCustomUsersList(
    payload: ManageCustomUsersListRequestDto,
  ): Promise<CustomUsersList> {
    const { userId, customName, userIds } = payload;
    if (!customName) {
      throw new BadRequestError('Custom list name is required.');
    }
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: { customLists: true },
    });
    if (!user) {
      throw new NotFoundError('User');
    }
    const existingList = user.customLists.find(list => list.listName === customName);
    if (existingList) {
      throw new BadRequestError('Custom list already exists.');
    }
    const validUsers = await this.dbConnection.getRepository(User).find({
      where: { id: In(userIds) },
    });
    if (validUsers.length !== userIds.length) {
      throw new BadRequestError('Invalid user IDs provided.');
    }

    const customList = new HostCustomUsersLists();
    customList.listName = customName;
    customList.host = user;
    const savedCustomList = await this.dbConnection
      .getRepository(HostCustomUsersLists)
      .save(customList);
    const userListEntries = validUsers.map(validUser => {
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
    return customListSaved;
  }

  public static async updateCustomUsersList(
    payload: UpdateCustomUsersListRequestDto,
  ): Promise<CustomUsersList> {
    const { hostId, customName, userIds, customListId, mappingIds } = payload;
    if (!customName) {
      throw new BadRequestError('Custom list name is required.');
    }
    const host = await this.dbConnection.getRepository(User).findOne({
      where: { id: hostId, deletedAt: IsNull() },
      relations: { customLists: { usersLists: { user: true } } },
    });
    if (!host) {
      throw new NotFoundError('Host');
    }
    const customList = host.customLists.find(list => list.id === customListId);
    if (!customList) {
      throw new NotFoundError('Custom list not found.');
    }

    if (customList.listName !== customName) {
      if (host.customLists.some(list => list.listName === customName)) {
        throw new BadRequestError('Custom list with this name already exists.');
      }
      customList.listName = customName;
      await this.dbConnection.getRepository(HostCustomUsersLists).save(customList);
    }

    const existingUserIds = customList.usersLists.map(listUser => listUser.user.id);
    const userIdsToAdd = userIds.filter(id => !existingUserIds.includes(id));

    const userIdsAlreadyExist = userIds.filter(id => existingUserIds.includes(id));
    if (userIdsAlreadyExist.length) {
      throw new BadRequestError(`User already exist in the custom list.`);
    }

    if (userIdsToAdd.length) {
      const validUsers = await this.dbConnection
        .getRepository(User)
        .find({ where: { id: In(userIdsToAdd) } });

      if (validUsers.length !== userIdsToAdd.length) {
        throw new NotFoundError('Invalid user IDs provided.');
      }

      const userListEntries = validUsers.map(validUser => {
        const listUser = new HostCustomUsersListsUsers();
        listUser.user = validUser;
        listUser.list = customList;
        return listUser;
      });

      await this.dbConnection.getRepository(HostCustomUsersListsUsers).save(userListEntries);
    }

    if (mappingIds.length) {
      const existingMappings = await this.dbConnection
        .getRepository(HostCustomUsersListsUsers)
        .find({
          where: { id: In(mappingIds) },
        });

      const existingMappingIds = existingMappings.map(mapping => mapping.id);
      const invalidMappingIds = mappingIds.filter(id => !existingMappingIds.includes(id));

      if (invalidMappingIds.length) {
        throw new BadRequestError('Invalid mapping IDs provided');
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
    return customListSaved;
  }

  public static async manageFavoriteUser(payload: ManageFavoriteUserRequestDto): Promise<string> {
    const { userId, targetUserId, favorite } = payload;

    const [targetUser, host] = await this.findUsers(targetUserId, userId);
    if (!targetUser) {
      throw new NotFoundError('User');
    }
    if (!host) {
      throw new NotFoundError('User');
    }
    const validateRoleHost = host.roles.find(role => role.role.name === 'host');
    if (!validateRoleHost) {
      throw new NotFoundError('User is not a host');
    }
    if (targetUser.id === host.id) {
      throw new BadRequestError('You cannot mark yourself as favorite!');
    }

    const favoriteByHosts = await this.dbConnection.getRepository(HostFavorite).findOne({
      where: {
        member: { id: targetUser.id },
        host: { id: host.id },
      },
    });

    if (favorite) {
      if (favoriteByHosts) {
        throw new BadRequestError('You already marked this user as favorite!');
      }
      await this.addFavoriteHost(targetUser, host);
    } else {
      if (!favoriteByHosts) {
        throw new BadRequestError('User was not found in your favorite list!');
      }
      await this.dbConnection.getRepository(HostFavorite).delete({ member: targetUser, host });
    }
    return '';
  }

  public static async getFavoriteUsers(payload: PaginatedRequestDto): Promise<UsersData> {
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const type = parsedQuery?.type;
    const gender = parsedQuery?.gender;
    const focuses = parsedQuery.category;
    const baseCity = parsedQuery.basecity;
    const interest = parsedQuery.interest;
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: { favoritedMembers: { member: true } },
    });
    if (!user) {
      throw new NotFoundError('User');
    }
    const queryBuilder = this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('user.socialProviders', 'socialProviders')
      .leftJoinAndSelect('user.hostedEvents', 'hostedEvents')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .innerJoin('user.favoritedByHosts', 'hf')
      .addSelect(['hf.createdAt'])
      .where('hf.host.id = :hostId', { hostId: payload.userId })
      .take(take)
      .skip(skip);

    let userTypes: string[] = [];
    if (type && typeof type === 'string') {
      userTypes = type.split(',').map(name => name.trim());
    }
    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder
        .addOrderBy('user.firstName', sortDirection)
        .addOrderBy('user.lastName', sortDirection);
    } else {
      queryBuilder.orderBy('hf.createdAt', 'DESC');
    }
    await this.applyUserFilters(
      queryBuilder,
      parsedQuery,
      searchValue,
      focuses,
      interest,
      gender,
      baseCity,
      undefined,
      userTypes,
    );
    const [favoriteUsers, totalCount] = await queryBuilder.getManyAndCount();
    const users = await Promise.all(
      favoriteUsers.map(async user => {
        const focuses = await PlatformService.getUserFocuses({ id: user.id });
        const interests = await PlatformService.getUserInterests({ id: user.id });

        const socialProvider: SocialProvider = await this.dbConnection
          .getRepository(SocialProvider)
          .findOne({
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
        userData.isFavourite = true;
        return userData;
      }),
    );
    return { result: users, totalCount };
  }

  public static async getConfirmedMembers(
    payload: ContactsListRequestDto,
  ): Promise<ConfirmedMember[]> {
    const emails = payload.contacts.filter(c => c.indexOf('@') > 0);
    const phoneNumbers = payload.contacts.filter(c => c.indexOf('@') < 0);

    const queryBuilder = this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'user_role')
      .innerJoinAndSelect('user_role.role', 'role')
      .where('user_role.status = :memberStatus', { memberStatus: UserStatus.ACTIVE })
      .andWhere('role.name = :roleName', { roleName: 'member' });

    if (emails.length > 0 && phoneNumbers.length > 0) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.andWhere('user.email IN (:...emails)', { emails }).orWhere(
            'user.phone_number IN (:...numbers)',
            { numbers: phoneNumbers },
          );
        }),
      );
    } else if (phoneNumbers.length > 0) {
      queryBuilder.andWhere('user.phone_number IN (:...phoneNumbers)', { phoneNumbers });
    } else {
      queryBuilder.andWhere('user.email IN (:...emails)', { emails });
    }

    // queryBuilder.andWhere('user_role.status = :memberStatus', { memberStatus: UserStatus.ACTIVE });

    const users = await queryBuilder.getMany();

    if (!users || users.length == 0) {
      throw new NotFoundError('members');
    }
    const members = users.map(toConfirmedMember);
    return members;
  }

  public static async getUserWithRolesByEmail(
    payload: GetUserWithRolesByEmailRequestDto,
  ): Promise<UserWithRoles> {
    if (!payload.email) throw new BadRequestError('Invalid email');
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: { email: payload.email, deletedAt: null },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const data = {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      id: user.id,
      profilePicture: user.profilePicture,
      roles: user.roles.map(item => {
        return {
          name: item.role.name,
          status: item.status,
          id: item.role.id,
        };
      }),
    };

    return data;
  }

  public static async getUserWithRolesById(payload: IdRequestDto): Promise<UserWithRoles> {
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: null },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const data = {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      id: user.id,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      isFirstTimeLoggedIn: user.isFirstTimeLoggedIn,
      firstName: user.firstName,
      lastName: user.lastName,
      instagramUserName: user.instagramUserName,
      roles: user.roles.map(item => {
        return {
          name: item.role.name,
          status: item.status,
          id: item.role.id,
        };
      }),
    };

    return data;
  }

  public static async getUserWithRolesByPhone(
    payload: GetUserWithRolesByPhoneRequestDto,
  ): Promise<UserWithRoles> {
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: { phoneNumber: payload.phoneNumber, deletedAt: null },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const data = {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      id: user.id,
      profilePicture: user.profilePicture,
      roles: user.roles.map(item => {
        return {
          name: item.role.name,
          status: item.status,
          id: item.role.id,
        };
      }),
    };

    return data;
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
  public static async registerInvitesAsNonMember(
    payload: NonMemberSignUpRequestDto,
  ): Promise<SimpleUser> {
    let user: User | null = null;
    const userFindOptionWhere: FindOptionsWhere<User>[] = [];
    if (payload.email) {
      userFindOptionWhere.push({ email: payload.email, deletedAt: IsNull() });
    } else {
      userFindOptionWhere.push({ phoneNumber: payload.phoneNumber, deletedAt: IsNull() });
    }
    user = await this.dbConnection.getRepository(User).findOne({ where: userFindOptionWhere });

    let existingMapping = null;
    if (user) {
      existingMapping = await this.dbConnection.getRepository(HostUserMapping).findOne({
        where: { host: { id: payload.id }, user: { id: user.id } },
      });
    }

    const newUser: User | null = new User();
    if (!user) {
      newUser.email = payload.email ?? '';
      newUser.firstName = payload.firstName;
      newUser.lastName = payload.lastName;
      newUser.phoneNumber = payload.phoneNumber ?? '';
      this.dbConnection.getRepository(User).create(newUser);
      user = await this.dbConnection.getRepository(User).save(newUser);
      await RoleService.assignRoleToUser({ userId: user.id, roleName: RoleType.NonMember });

      const newMapping = new HostUserMapping();
      newMapping.user = user;
      newMapping.host = { id: payload.id } as User;
      await this.dbConnection.getRepository(HostUserMapping).save(newMapping);
    } else {
      if (!existingMapping) {
        const newMapping = new HostUserMapping();
        newMapping.user = user;
        newMapping.host = { id: payload.id } as User;
        await this.dbConnection.getRepository(HostUserMapping).save(newMapping);
      }
    }

    return toSimpleUser(user);
  }

  public static async createUser(payload: NonMemberSignUpRequestDto): Promise<UserResponseData> {
    // Check if the user exists by email or phone concurrently
    const [userByEmail, userByPhone] = await Promise.all([
      payload.email
        ? this.dbConnection
            .getRepository(User)
            .findOne({ where: { email: payload.email, deletedAt: IsNull() } })
        : null,
      payload.phoneNumber
        ? this.dbConnection
            .getRepository(User)
            .findOne({ where: { phoneNumber: payload.phoneNumber, deletedAt: IsNull() } })
        : null,
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

      const host = await this.dbConnection
        .getRepository(User)
        .findOne({ where: { id: payload.id } });
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

  public static async sendVerificationCodeByEmail(
    payload: SendVerificationCodeByEmailRequestDto,
  ): Promise<string> {
    // Remove all previous login attempts (both email and phone)
    const existingLoginAttempts = await this.dbConnection
      .getRepository(TemporaryLoginCode)
      .find({ where: { email: payload.email } });
    // const existingLoginAttempts = await this.temporaryLoginCodeRepository.find({ where: { phoneNumber: payload.phoneNumber } });

    if (existingLoginAttempts.length) {
      await Promise.all(
        existingLoginAttempts.map(async attempt => {
          await this.dbConnection.getRepository(TemporaryLoginCode).delete(attempt.id);
        }),
      );
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    if (existingLoginAttempts.length) {
      await Promise.all(
        existingLoginAttempts.map(async attempt => {
          await this.dbConnection.getRepository(TemporaryLoginCode).delete(attempt.id);
        }),
      );
    }

    const admin: User = await this.dbConnection.getRepository(User).findOne({
      where: { email: payload.email, deletedAt: IsNull() },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    try {
      const isAdmin = admin?.roles?.some(role => role?.role?.name === 'admin');
      if (isAdmin) {
        await serviceMesh.notificationService().sendEmailFromTemplate(
          [
            {
              key: 'code',
              value: verificationCode,
            },
          ],
          'Super Admin - Verify Email',
          [payload.email.trim()],
          null,
        );
      } else {
        await serviceMesh.notificationService().sendEmailFromTemplate(
          [
            {
              key: 'code',
              value: verificationCode,
            },
          ],
          'Non-Member Verify Email',
          [payload.email.trim()],
          null,
        );
      }
    } catch (error) {}

    // Save the verification code and email into the TemporaryLoginCode entity
    const temporaryLoginCode = new TemporaryLoginCode();
    temporaryLoginCode.email = payload.email;
    temporaryLoginCode.code = verificationCode;
    await this.dbConnection.getRepository(TemporaryLoginCode).save(temporaryLoginCode);
    return '';
  }

  public static async verifyCodeByEmail(
    payload: VerifyCodeByEmailRequestDto,
  ): Promise<VerificationStatus> {
    // Retrieve the stored code from the database for the given email
    const storedCodeRecord = await this.dbConnection.getRepository(TemporaryLoginCode).findOne({
      where: { email: payload.email },
    });

    if (!storedCodeRecord) {
      throw new BadRequestError('Verification code not found or expired');
    }

    const isValid = storedCodeRecord.code === payload.verificationCode;

    if (isValid) {
      await this.dbConnection.getRepository(TemporaryLoginCode).remove(storedCodeRecord);
    }

    return { verified: isValid };
  }

  public static async setLoginStatus(payload: IdRequestDto): Promise<string> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('user');
    }

    if (user.isFirstTimeLoggedIn) {
      throw new BadRequestError('User has already logged in before');
    }

    user.isFirstTimeLoggedIn = true;
    await this.dbConnection.getRepository(User).save(user);

    await user.save();
    return '';
  }

  public static async getAllusers(payload: ListUsersInviteesDto): Promise<UsersData> {
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
    const customListId = parsedQuery?.customListId
      ? (parsedQuery.customListId as string)
      : undefined;
    const systemDefaultLists = ['myFavourites-systemDefault', 'myFollowers-systemDefault'];
    let favorite = false;
    let followed = false;
    let customListNames: string[] = [];
    if (customListName && customListName.length) {
      if (customListName && typeof customListName === 'string') {
        const allListNames = customListName.split(',').map(name => name.trim());
        // Separate system default lists and update customListName
        const separatedLists = allListNames.filter(item => systemDefaultLists.includes(item));
        customListNames = allListNames.filter(item => !systemDefaultLists.includes(item));
        favorite = separatedLists.includes('myFavourites-systemDefault');
        followed = separatedLists.includes('myFollowers-systemDefault');
      }
    }

    const idsResult = await this.dbConnection.getRepository(HostUserMapping).find({
      where: { host: { id: hostId } },
      relations: ['user'],
    });
    const ids = idsResult.map(result => result.user.id);

    const usersQuery = this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'userRole')
      .innerJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('user.socialProviders', 'socialProvider')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .leftJoinAndSelect('user.address', 'address')
      .where('user.deletedAt IS NULL')
      .andWhere(
        new Brackets(qb => {
          qb.where('role.name = :roleName', { roleName: 'member' }).orWhere(
            new Brackets(subQb => {
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
      userTypes = type.split(',').map(name => name.trim());
    }
    if (userTypes.length) {
      usersQuery.andWhere(
        new Brackets(qb => {
          qb.where('role.name IN (:...roleNames)', { roleNames: userTypes }); // Separate condition for userTypes
        }),
      );
    }

    // Apply OR conditions for followed, favorite, and custom lists
    if (favorite || followed || customListNames.length > 0) {
      usersQuery.andWhere(
        new Brackets(qb => {
          if (favorite) {
            qb.orWhere(subQb => {
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
            qb.orWhere(subQb => {
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
            qb.orWhere(subQb => {
              const subQuery = subQb
                .subQuery()
                .select('listUsers.user.id')
                .from(HostCustomUsersLists, 'customList')
                .innerJoin('customList.usersLists', 'listUsers')
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
        new Brackets(qb => {
          qb.where('user.firstName ILIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          }).orWhere('user.lastName ILIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          });
        }),
      );
    }
    if (focuses && typeof focuses === 'string') {
      const focusIds = focuses.split(',').map(id => id.trim());
      usersQuery.andWhere(qb => {
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
      const interestFilter = interest.split(',').map(interestName => interestName.trim());
      usersQuery.andWhere(qb => {
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
      const genderFilter = gender.split(',').map(g => g.trim().toUpperCase());
      const validGenders = Object.values(Gender) as string[];
      const filteredGenders = genderFilter.filter(g => validGenders.includes(g)) as Gender[];
      if (filteredGenders.length > 0) {
        usersQuery.andWhere('user.gender IN (:...filteredGenders)', { filteredGenders });
      }
    }

    if (baseCity && typeof baseCity === 'string') {
      const placeIds = baseCity.split(',').map(id => id.trim());
      if (placeIds.length > 0) {
        usersQuery.andWhere(qb => {
          const subQuery = qb
            .subQuery()
            .select('address.id')
            .from('address', 'address')
            .where('address.google_place_id IN (:...placeIds)', { placeIds })
            .getQuery();
          return `user.address_id IN ${subQuery}`;
        });
      }
    }
    if (parsedQuery.ageFrom || parsedQuery.ageTo) {
      const ageFrom =
        parsedQuery.ageFrom && typeof parsedQuery.ageFrom === 'string' && parsedQuery.ageFrom.trim()
          ? parseInt(parsedQuery.ageFrom, 10)
          : 0; // Default minimum age is 0
      const ageTo =
        parsedQuery.ageTo &&
        typeof parsedQuery.ageTo === 'string' &&
        parsedQuery.ageTo.trim() &&
        parsedQuery.ageTo !== 'No Max'
          ? parseInt(parsedQuery.ageTo, 10)
          : null; // Null indicates no upper limit
      const ageQuery = `EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(user.date_of_birth, 'MM/DD/YYYY')))`;
      const conditions: string[] = [`${ageQuery} >= :ageFrom`];
      if (ageTo !== null) {
        conditions.push(`${ageQuery} <= :ageTo`);
      }
      usersQuery.andWhere(conditions.join(' AND '), { ageFrom, ageTo });
    }
    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      usersQuery
        .addOrderBy('user.firstName', sortDirection)
        .addOrderBy('user.lastName', sortDirection);
    } else {
      usersQuery.orderBy('user.createdAt', 'DESC');
    }

    const [allUsers, totalCount] = await usersQuery.getManyAndCount();

    const favorites = await this.dbConnection.getRepository(HostFavorite).find({
      where: { host: { id: hostId } },
      relations: ['member'],
    });
    const favoriteUserIds = favorites.map(fav => fav.member.id);

    let listUserIds: string[] = [];
    if (customListId) {
      const customListUsers = await this.dbConnection
        .getRepository(HostCustomUsersListsUsers)
        .find({
          where: { list: { id: customListId } },
          relations: ['user'],
        });

      listUserIds = customListUsers.map(listUser => listUser.user?.id);
    }

    const users = await Promise.all(
      allUsers.map(async user => {
        const focuses = await PlatformService.getUserFocuses({ id: user.id });
        const interests = await PlatformService.getUserInterests({ id: user.id });
        const socialProvider: SocialProvider = await this.dbConnection
          .getRepository(SocialProvider)
          .findOne({
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
    return { result: users, totalCount };
  }

  // ADMIN Sevice Code

  public static async getMembers(payload: PaginatedRequestDto): Promise<GetMembersResponse> {
    //GetMembersResponse
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const socialNetworkNames = parsedQuery?.socialNetworkNames
      ? parsedQuery.socialNetworkNames
      : undefined;
    const followerCountFrom = parsedQuery?.followerCountFrom
      ? parseInt(parsedQuery.followerCountFrom as string)
      : undefined;
    const followerCountTo = parsedQuery?.followerCountTo
      ? parseInt(parsedQuery.followerCountTo as string)
      : undefined;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const { error: validationError, response: validation } = this.validateFilters(payload.query);

    if (validationError) {
      throw new BadRequestError('validationError');
    }
    let socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {};
    if (typeof socialNetworkNames === 'string') {
      const socialNetworkArray = socialNetworkNames
        .split(',')
        .map(name => name.trim().toUpperCase());
      socialNetworkObject = socialNetworkArray.reduce(
        (acc, name) => {
          acc[name] = SocialProviderType[name as keyof typeof SocialProviderType];
          return acc;
        },
        {} as { [key in keyof typeof SocialProviderType]?: string },
      );
    }
    const usersQuery = this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'userRole')
      .innerJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('user.socialProviders', 'socialProvider')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .leftJoinAndSelect('user.address', 'address')
      .where('role.name IN (:...roleNames)', { roleNames: ['member', 'non_member'] })
      .andWhere('user.deletedAt IS NULL')
      .andWhere('user.isDeactivated = :isDeactivated', { isDeactivated: false })
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
        new Brackets(qb => {
          qb.where('user.firstName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('user.lastName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('user.email ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('user.username ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('user.phoneNumber ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('address.city ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('address.address ILIKE :searchValue', { searchValue: `%${searchValue}%` })
            .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('CAST(userRole.status AS TEXT) ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            });
        }),
      );
    }

    if (Object.keys(socialNetworkObject).length > 0) {
      const socialConditions = Object.keys(socialNetworkObject).map(networkKey => {
        const columnName = `${networkKey.toLowerCase()}FollowersCount`;
        return `(socialStats.${columnName} BETWEEN :followerCountFrom AND :followerCountTo)`;
      });

      usersQuery.andWhere(
        new Brackets(qb => {
          qb.where(socialConditions.join(' OR '), {
            followerCountFrom: followerCountFrom || 0,
            followerCountTo: followerCountTo || Number.MAX_SAFE_INTEGER,
          });
        }),
      );
    }

    const users = await usersQuery.getMany();
    const members = await Promise.all(
      users.map(async user => {
        // Micro-service call
        const focuses = await PlatformService.getUserFocuses({ id: user.id });
        const interests = await PlatformService.getUserInterests({ id: user.id });

        const socialProvider: SocialProvider = await this.dbConnection
          .getRepository(SocialProvider)
          .findOne({
            where: {
              user: {
                id: user.id,
              },
              type: SocialProviderType.INSTAGRAM,
            },
          });

        return toMember(
          user,
          focuses,
          interests,
          user.roles[0],
          socialNetworkObject,
          socialProvider?.username,
        );
      }),
    );
    return responses.data(members);
  }

  public static async getHosts(payload: PaginatedRequestDto): Promise<GetHostsResponse> {
    const parsedQuery = JSON.parse(payload.query);
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

    const queryBuilder = this.dbConnection
      .getRepository(User)
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
      .orderBy('user.created_at', 'DESC')
      .offset(skip)
      .limit(take);

    if (searchValue) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('user.firstName ILIKE :searchValue', {
            searchValue: `%${parsedQuery.searchValue}%`,
          })
            .orWhere('user.lastName ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            })
            .orWhere('user.email ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            })
            .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            })
            .orWhere('address.city ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            })
            .orWhere('CAST(user_role.status AS TEXT) ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            })
            .orWhere('user.phoneNumber ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            })
            .orWhere('CAST(user_role.source AS TEXT) ILIKE :searchValue', {
              searchValue: `%${parsedQuery.searchValue}%`,
            });
        }),
      );
    }
    const users = await queryBuilder.getRawMany();
    const hosts = users.map(user => {
      return toHost(user as RawHost);
    });

    return responses.data(hosts);
  }

  public static async adminLogin(payload: LoginRequestDto): Promise<TokenResponseAndRoles> {
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: { email: payload.email, deletedAt: IsNull() },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new ForbiddenError(
        'The email address you provided doesn’t match any account in our system. Please check for any typos or try a different email.',
      );
    }

    const userRoles = await this.dbConnection.getRepository(UserRole).find({
      where: { user: { id: user.id } },
      relations: ['role', 'role.parentRole'],
    });

    const isAllowed = userRoles.find(
      role => role.role?.name === 'admin' || role.role?.parentRole?.name === 'admin',
    );
    if (isAllowed === undefined) {
      throw new ForbiddenError(
        'We couldn’t sign you in. Either your email or password is incorrect. Please try again or reset your password.',
      );
    }

    const loginResponse = await fusionAuthClientHandler
      .fusionAuthClient()
      .login({ loginId: payload.email, password: payload.password });

    if (loginResponse.statusCode > 299 || loginResponse.statusCode < 200) {
      throw new ForbiddenError(
        'We couldn’t sign you in. Either your email or password is incorrect. Please try again or reset your password.',
      );
    }

    if (loginResponse?.response?.user?.passwordChangeRequired) {
      throw new ForbiddenError('Password change is required');
    }

    return {
      id: user.id,
      token: loginResponse.response.token,
      roles: user.roles.map(item => {
        return { roleName: item.role.name, roleId: item.role.id };
      }),
    };
  }

  public static async createAdmin(payload: AdminSignUpRequestDto): Promise<any> {
    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }
    let nonMember: UserRole | null;
    try {
      const response = await fusionAuthClientHandler
        .fusionAuthClient()
        .retrieveUserByEmail(payload.email);
      if (response.statusCode == 200 && response?.response?.user) {
        throw new ConflictError('The user with provided email already exists.');
      }
    } catch (e) {
      if (e.statusCode != 404) {
        throw new ConflictError('Than error happens when trying register an user.');
      }
    }

    let user = await this.dbConnection.getRepository(User).findOne({
      where: { email: payload.email, deletedAt: IsNull() },
      relations: {
        roles: { role: true },
      },
    });
    if (user) {
      nonMember = user.roles.find(item => {
        if (item.role.name == 'non_member') return item;
      });

      if (!nonMember) {
        if (user.phoneNumber === payload.phoneNumber) {
          throw new BadRequestError('Phone number is already in use');
        }

        if (user.email === payload.email) {
          throw new BadRequestError('Email is already in use');
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
        username: payload.email,
      },
      sendSetPasswordEmail: false,
      user: {
        id: user.id,
        username: payload.email,
        // birthDate: payload.dateOfBirth,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        mobilePhone: payload.phoneNumber,
        password: payload.password,
        verified: true,
        active: true,
      },
    };

    const newUser = await fusionAuthClientHandler
      .fusionAuthClient()
      .register(user.id, registrationRequest);
    if (newUser.statusCode !== 200) {
      throw new ConflictError('There wass an issue creating an admin');
    }

    user.id = newUser.response?.user?.id;
    await this.dbConnection.getRepository(User).save(user);
    await RoleService.assignRoleToUser({ userId: user.id, roleName: 'admin' });
    return {
      user,
    };
  }

  public static async getHostProfile(payload: UserAndIdRequestDto): Promise<HostProfileResponse> {
    const memberId = payload.userId; //Only valid if endpoint was called by a member
    let isMemberFollowingHost = false;
    let isMemberBlockedHost = false;

    const host: User = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: IsNull() },
      relations: {
        hostedEvents: { location: true },
      },
    });
    if (!host) return responses.notFound('Host not found.');

    const userRoles = await this.dbConnection.getRepository(UserRole).find({
      where: { user: { id: host.id } },
      relations: {
        role: true,
      },
    });

    const hostRole = userRoles.find(role => role.role.name === 'host');
    const roleId = hostRole.role.id;
    const roleName = hostRole.role.name;

    if (hostRole === undefined) return responses.notFound('Host not found');

    if (memberId !== host.id) {
      const hostFollowing = await this.dbConnection.getRepository(HostFollowing).findOne({
        where: {
          follower: { id: memberId },
          host: { id: host.id },
        },
      });

      if (hostFollowing) isMemberFollowingHost = true;

      const isBlocked = await this.dbConnection.getRepository(Block).findOne({
        where: {
          blockedBy: { id: memberId },
          blockedTo: { id: host.id },
        },
      });

      if (isBlocked) isMemberBlockedHost = true;
    }

    return toHostProfile(
      host,
      hostRole.status,
      hostRole.source,
      isMemberFollowingHost,
      isMemberBlockedHost,
      roleId,
      roleName,
    );
  }

  public static async updateHostProfile(
    payload: UpdateHostProfileRequestDto,
  ): Promise<BasicHostProfileResponse> {
    const host: User = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: IsNull() },
    });

    if (!host) {
      throw new NotFoundError('host');
    }

    if (payload?.email) {
      const existingUser = await this.dbConnection.getRepository(User).findOne({
        where: [{ email: payload.email }],
      });

      if (existingUser && host.id !== existingUser.id) {
        throw new ConflictError('Email is already in use');
      }
    }

    if (payload?.phoneNumber) {
      const existingUser = await this.dbConnection.getRepository(User).findOne({
        where: [{ phoneNumber: payload.phoneNumber }],
      });
      if (existingUser && host.id !== existingUser.id) {
        throw new ConflictError('Phone number is already in use');
      }
    }

    const updatedUser = await this.dbConnection
      .getRepository(User)
      .save(hostToUpdate(host, payload));

    const userRoles = await this.dbConnection.getRepository(UserRole).find({
      where: { user: { id: updatedUser.id } },
      relations: {
        role: true,
      },
    });

    const hostRole = userRoles.find(role => role.role.name === 'host');
    if (hostRole === undefined) {
      throw new NotFoundError('Host');
    }

    const roleStatus: any = hostRole.status;
    const roleSource: any = hostRole.source;
    await this.dbConnection
      .getRepository(UserRole)
      .update(hostRole.id, { profileSetupCompleted: true });
    return responses.data(toBasicHostProfile(updatedUser, roleStatus, roleSource));
  }

  public static async getBasicHostProfile(payload: IdRequestDto): Promise<BasicHostProfile> {
    const user: User = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundError('Host not fond');
    }

    const userRoles = await this.dbConnection.getRepository(UserRole).find({
      where: { user: { id: user.id } },
      relations: {
        role: true,
      },
    });

    const hostRole = userRoles.find(role => role.role.name === 'host');
    if (hostRole === undefined) {
      throw new NotFoundError('Host role not found');
    }

    const roleStatus: any = hostRole.status;
    const roleSource: any = hostRole.source;

    const data = toBasicHostProfile(user, roleStatus, roleSource);
    return data;
  }

  //TO do from here
  public static validateFilters(query: string): { error: boolean; response: string } {
    const parsedFilters = parse(query);
    const socialNetworkNames = parsedFilters?.socialNetworkNames
      ? parsedFilters.socialNetworkNames
      : undefined;
    const followerCountFrom = parsedFilters?.followerCountFrom
      ? parseInt(parsedFilters.followerCountFrom as string)
      : undefined;
    const followerCountTo = parsedFilters?.followerCountTo
      ? parseInt(parsedFilters.followerCountTo as string)
      : undefined;
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
        return {
          error: true,
          response: 'followerCountFrom must be less than or equal to followerCountTo.',
        };
      }

      if (typeof socialNetworkNames === 'string') {
        const socialNetworkArray = socialNetworkNames
          .split(',')
          .map(name => name.trim().toUpperCase());

        const invalidNames = socialNetworkArray.filter(name => !(name in SocialProviderType));

        if (invalidNames.length > 0) {
          return {
            error: true,
            response: `Invalid social network names: ${invalidNames.join(', ')}`,
          };
        }

        return { error: false, response: socialNetworkArray.join(',') };
      }
    }
    return { error: false, response: '' };
  }

  public static async updateHostStatus(payload: UpdateHostsStatusRequestDto): Promise<any> {
    try {
      const users = await this.dbConnection.getRepository(User).find({
        where: { id: In(payload.ids) },
        relations: ['roles', 'roles.role'],
      });

      if (!users.length) {
        throw new NotFoundError('Host');
      }

      const hostRoles = await this.dbConnection.getRepository(UserRole).find({
        where: {
          id: In(
            users.flatMap(user =>
              user?.roles
                ?.filter(role => role.role.name === 'host' || role.role.name === 'co_host')
                .map(role => role.id),
            ),
          ),
        },
      });

      if (!hostRoles.length) throw new NotFoundError('valid hosts');

      const skippedUsers: string[] = [];
      const emailsToSend: { email: string; subject: string; data: any[] }[] = [];

      for (const user of users) {
        const hostRole = hostRoles.find(
          role =>
            role.id ===
            user.roles.find(r => r.role.name === 'host' || r.role.name === 'co_host')?.id,
        );

        if (!hostRole) continue;

        // If changing to WAITLIST, prevent already approved users from being waitlisted
        if (
          newUserStatusTosUserStatus[payload.status] ===
            newUserStatusTosUserStatus[NewUserStatus.WAITLIST] &&
          hostRole.status === newUserStatusTosUserStatus[NewUserStatus.APPROVE]
        ) {
          skippedUsers.push(user.email);
          continue;
        }

        hostRole.status = newUserStatusTosUserStatus[payload.status];

        if (
          newUserStatusTosUserStatus[payload.status] ===
          newUserStatusTosUserStatus[NewUserStatus.APPROVE]
        ) {
          const users = await fusionAuthClientHandler
            .fusionAuthClient()
            .searchUsersByIds([user.id]);
          if (users.response.total === 0) {
            await this.approveHost(user);
            const token = await this.generateToken(user);
            emailsToSend.push({
              email: user.email,
              subject: 'Host Application Approved',
              data: [
                { key: 'first_name', value: user.firstName },
                {
                  key: 'company_name',
                  value: user.additionalHostInformation?.companyName ?? user.firstName,
                },
                {
                  key: 'password_token',
                  value: config.get('RUMOR_WEBSITE_HOST') + `token/${token}`,
                },
              ],
            });
          }
        } else if (
          newUserStatusTosUserStatus[payload.status] ===
          newUserStatusTosUserStatus[NewUserStatus.WAITLIST]
        ) {
          emailsToSend.push({
            email: user.email,
            subject: 'Host Application Denied',
            data: [],
          });
        } else if (
          newUserStatusTosUserStatus[payload.status] ===
          newUserStatusTosUserStatus[NewUserStatus.DEACTIVATE]
        ) {
          const today = new Date();
          const afterThirtyDays = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate(),
          );
          const fullMonthName = afterThirtyDays.toLocaleString('default', {
            month: 'long',
          });
          const reactivateBeforeTimestamp = `${fullMonthName} ${afterThirtyDays.getDate()}, ${afterThirtyDays.getFullYear()}, at 11:59 PM EST`;
          emailsToSend.push({
            email: user.email,
            subject: 'Account Deactivated',
            data: [
              { key: 'first_name', value: user.firstName },
              {
                key: 'activate_before_datetime',
                value: reactivateBeforeTimestamp,
              },
            ],
          });
        }
      }

      await this.dbConnection.getRepository(UserRole).save(hostRoles);

      // Send all emails in parallel
      try {
        await Promise.all(
          emailsToSend.map(email =>
            serviceMesh
              .notificationService()
              .sendEmailFromTemplate(email.data, email.subject, [email.email.trim()], null),
          ),
        );
      } catch (error) {}
      // if (skippedUsers.length > 0) {
      //   return responses.conflict(`Some users were not waitlisted because they were already approved: ${skippedUsers.join(', ')}`);
      // }

      return {
        updatedUsers: users.map(user => ({
          id: user.id,
          status:
            hostRoles.find(
              role =>
                role.id ===
                user.roles.find(r => r.role.name === 'host' || r.role.name === 'co_host')?.id,
            )?.status ?? null,
        })),
        skippedUsers,
      };
    } catch (err: any) {
      throw new NotFoundError(`Host Status Updates failed:: ${err.message}`);
    }
  }

  public static async approveHost(user: User): Promise<void> {
    const password = generateRandomPassword(12);
    const temporaryPassword = new TemporaryPassword();
    temporaryPassword.password = password;
    user.temporaryPassword = temporaryPassword;
    user = await this.dbConnection.getRepository(User).save(user);

    const registrationRequest: RegistrationRequest = {
      registration: {
        applicationId: config.get('FUSIONAUTH_APP_ID'),
        username: user.email,
      },
      sendSetPasswordEmail: false,
      user: {
        id: user.id,
        username: user.email,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobilePhone: user.phoneNumber,
        password,
        verified: true,
        active: true,
      },
    };
    await fusionAuthClientHandler.fusionAuthClient().register(user.id, registrationRequest);
  }

  public static async generateToken(user: User): Promise<string> {
    const token = generateTemporaryToken(36);
    const temporaryPasswordToken = new TemporaryPasswordToken();
    temporaryPasswordToken.token = token;
    temporaryPasswordToken.expiresAt = dayjs().add(24, 'hours').toDate();
    user.temporaryPasswordToken = temporaryPasswordToken;
    await this.dbConnection.getRepository(User).save(user);
    return token;
  }

  public static async updateMemberStatus(
    payload: UpdateUserStatusRequestDto,
  ): Promise<GenericResponse> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.id },
      relations: {
        roles: {
          role: true,
        },
      },
    });

    const memberRole = user.roles.find(role => role.role.name === 'member');
    if (memberRole === undefined) {
      throw new NotFoundError('Member');
    }

    const userRole = await this.dbConnection
      .getRepository(UserRole)
      .findOne({ where: { id: memberRole.id } });
    if (!userRole) {
      throw new NotFoundError('Member');
    }
    userRole.status = newUserStatusTosUserStatus[payload.status];
    await this.dbConnection.getRepository(UserRole).save(userRole);
    return responses.ok;
  }

  public static async getMemberProfile(payload: IdRequestDto): Promise<MemberProfileResponse> {
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

    const memberRole = user.roles.find(role => role?.role?.name === 'member');
    const nonMemberRole = user.roles.find(role => role.role.name === 'non_member');

    if (!memberRole && !nonMemberRole) {
      throw new NotFoundError('Profile');
    }

    let userRole = null;
    if (memberRole) {
      userRole = await this.dbConnection
        .getRepository(UserRole)
        .findOne({ where: { id: memberRole.id }, relations: { role: true } });
    } else if (nonMemberRole) {
      userRole = await this.dbConnection
        .getRepository(UserRole)
        .findOne({ where: { id: nonMemberRole.id }, relations: { role: true } });
    }

    // Micro-service call
    const focuses = await PlatformService.getUserFocuses({ id: user.id });

    const socialProvider: SocialProvider = await this.dbConnection
      .getRepository(SocialProvider)
      .findOne({
        where: {
          user: {
            id: user.id,
          },
          type: SocialProviderType.FACEBOOK,
        },
        relations: ['user'],
      });

    const eventCount = await this.dbConnection
      .getRepository(Guest)
      .count({ where: { user: { id: user.id } } });

    return responses.data(
      toMemberProfile(
        user,
        focuses,
        undefined,
        userRole,
        undefined,
        socialProvider?.username,
        eventCount,
      ),
    );
  }

  public static async applyUserFilters(
    queryBuilder,
    parsedQuery,
    searchValue,
    focuses,
    interest,
    gender,
    baseCity,
    hostId,
    userTypes,
  ) {
    //Apply type filter
    if (userTypes.length > 0) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('role.name IN (:...roleNames)', { roleNames: userTypes });
        }),
      );
    }

    // Apply search value filter
    if (searchValue) {
      const searchWords = searchValue.trim().split(/\s+/);
      queryBuilder.andWhere(
        new Brackets(qb => {
          searchWords.forEach(word => {
            qb.orWhere('user.firstName ILIKE :word', { word: `%${word}%` }).orWhere(
              'user.lastName ILIKE :word',
              { word: `%${word}%` },
            );
          });
        }),
      );
    }

    // Apply focuses filter
    if (focuses && typeof focuses === 'string') {
      const focusIds = focuses.split(',').map(id => id.trim());
      queryBuilder.andWhere(qb => {
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
      const interestFilter = interest.split(',').map(interestName => interestName.trim());
      queryBuilder.andWhere(qb => {
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
      const genderFilter = gender.split(',').map(g => g.trim().toUpperCase());
      const validGenders = Object.values(Gender) as string[];
      const filteredGenders = genderFilter.filter(g => validGenders.includes(g)) as Gender[];
      if (filteredGenders.length > 0) {
        queryBuilder.andWhere('user.gender IN (:...filteredGenders)', { filteredGenders });
      }
    }

    // Apply baseCity filter
    if (baseCity && typeof baseCity === 'string') {
      const placeIds = baseCity.split(',').map(id => id.trim());
      if (placeIds.length > 0) {
        queryBuilder.andWhere(qb => {
          const subQuery = qb
            .subQuery()
            .select('address.id')
            .from('address', 'address')
            .where('address.google_place_id IN (:...placeIds)', { placeIds })
            .getQuery();
          return `user.address_id IN ${subQuery}`;
        });
      }
    }

    // Apply age filter
    if (parsedQuery.ageFrom || parsedQuery.ageTo) {
      const ageFrom =
        parsedQuery.ageFrom && typeof parsedQuery.ageFrom === 'string' && parsedQuery.ageFrom.trim()
          ? parseInt(parsedQuery.ageFrom, 10)
          : 0;
      const ageTo =
        parsedQuery.ageTo &&
        typeof parsedQuery.ageTo === 'string' &&
        parsedQuery.ageTo.trim() &&
        parsedQuery.ageTo !== 'No Max'
          ? parseInt(parsedQuery.ageTo, 10)
          : null;
      const ageQuery = `EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(user.date_of_birth, 'MM/DD/YYYY')))`;
      const conditions: string[] = [`${ageQuery} >= :ageFrom`];
      if (ageTo !== null) {
        conditions.push(`${ageQuery} <= :ageTo`);
      }
      queryBuilder.andWhere(conditions.join(' AND '), { ageFrom, ageTo });
    }
    return queryBuilder;
  }

  public static async getUserFiltersOptions(payload: FilterRequestDto): Promise<Filter[]> {
    const { userId } = payload;
    const parsedQuery = parse(payload.query) as ParsedQs;
    const eventId = parsedQuery?.eventId as string;
    const filterOptionsSequence = [
      'list',
      'pastEvents',
      'category',
      'baseCity',
      'gender',
      'age',
      'interest',
      'type',
      'ticketType',
      'partySize',
      'checkedIn',
      'spammed',
      'userSource',
      'declinedBy',
      'vouch',
    ];
    const focuses = await PlatformService.getFocuses();

    const categoryObj = {
      id: 'category',
      label: 'Category',
      options: focuses,
      isSearchable: true,
      type: FilterTypeValues.category,
    };
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: userId },
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
    const customLists = user?.customLists?.map(list => ({
      name: list.listName,
      id: list.listName,
    }));
    const hostDefaultList = [
      { id: 'myFavourites-systemDefault', name: 'My Favorites' },
      { id: 'myFollowers-systemDefault', name: 'My Followers' },
    ];
    const hostCustomLists = [...hostDefaultList, ...customLists];
    const listObj = {
      id: 'list',
      label: 'My Lists',
      options: hostCustomLists,
      type: FilterTypeValues.list,
    };
    const baseCityObj = {
      id: 'basecity',
      label: 'Base City',
      options: [],
      type: FilterTypeValues.baseCity,
    };
    const genderObj = {
      id: 'gender',
      label: 'Gender',
      options: [
        { id: Gender.MALE, name: 'Male' },
        { id: Gender.FEMALE, name: 'Female' },
        { id: Gender.NON_BINARY, name: 'Non-Binary' },
      ],
      type: FilterTypeValues.gender,
    };
    const ageObj = {
      id: 'age',
      label: 'Age',
      options: [],
      type: FilterTypeValues.age,
    };
    const interests = await PlatformService.listInterests();
    const mappedInterests = interests?.map(interest => ({
      name: interest.name,
      id: interest.id,
    }));
    const interestObj = {
      id: 'interest',
      label: 'Interests',
      options: mappedInterests,
      type: FilterTypeValues.interest,
    };
    const typeObj = {
      id: 'type',
      label: 'Type',
      options: [
        { id: RoleType.Member, name: 'Member' },
        { id: RoleType.NonMember, name: 'Non-Member' },
      ],
      type: FilterTypeValues.type,
    };
    const now = new Date();
    //TODO: check if this logic affects on date format changes
    const formattedDate = formatDateToMMDDYYYYHHmm(now);
    const queryParams = {
      ownerId: userId,
      statusName: 'PAST_STATUS',
      maxEndDate: formattedDate,
      isPublished: true,
    };
    const queryString = prepareQueryString(queryParams);
    const listEvents = [];
    const mappedEvents = listEvents?.map(event => ({
      name: event.name,
      id: event.id,
    }));
    const pastEventsObj = {
      id: 'pastEvents',
      label: 'Past Events',
      options: mappedEvents,
      type: FilterTypeValues.pastEvents,
    };

    let ticketTypes = [];
    if (eventId) {
      try {
        ticketTypes = (await serviceMesh.eventService().getTicketTypes(eventId)).data;
      } catch (e) {
        ticketTypes = [];
      }
    }
    const mappedticketTypes = ticketTypes?.map(ticketType => ({
      name: ticketType.name,
      id: ticketType.id,
    }));
    const ticketTypeObj = {
      id: 'ticketType',
      label: 'Ticket Type',
      options: mappedticketTypes,
      type: FilterTypeValues.ticketType,
    };

    const partySizeObj = {
      id: 'partySize',
      label: 'Party Size',
      options: [],
      type: FilterTypeValues.partySize,
    };

    const checkedInObj = {
      id: 'checkedIn',
      label: 'Check-in Status',
      options: [
        { id: 'checkedIn', name: 'Checked-in' },
        { id: 'notCheckedIn', name: 'Not Checked-in' },
      ],
      type: FilterTypeValues.checkedIn,
    };

    const spammedObj = {
      id: 'spammed',
      label: 'Spam',
      options: [
        { id: 'isSpammed', name: 'Marked as Spam' },
        { id: 'isNotSpammed', name: 'Not marked as Spam' },
      ],
      type: FilterTypeValues.spammed,
    };

    const userSourceObj = {
      id: 'userSource',
      label: 'Request Source',
      options: [
        // { id: UserSource.INVITED_BY_HOST, name: 'Invited by Host' },
        // { id: UserSource.INVITED_BY_ADMIN, name: 'Invited by Admin' },
        // { id: UserSource.INVITED_BY_COLLABORATOR, name: 'Invited by Collaborator' },
        { id: UserSource.SIGN_UP_FORM, name: 'Sign Up Form' },
        { id: UserSource.REQUEST_IN_APP, name: 'In App' },
      ],
      type: FilterTypeValues.userSource,
    };

    const declinedByObj = {
      id: 'declinedBy',
      label: 'Declined By',
      options: [
        { id: 'declinedByUser', name: 'Declined By User' },
        // { id: 'declinedByCollaborator', name: 'Declined By Event Collaborator' },
      ],
      type: FilterTypeValues.declinedBy,
    };

    const vouchObj = {
      id: 'vouch',
      label: 'Vouch',
      options: [
        { id: 'hasVouches', name: 'Has Vouches' },
        { id: 'hasNoVouches', name: 'Does Not Have Vouches' },
      ],
      type: FilterTypeValues.declinedBy,
    };

    const followersObj = {
      id: 'followers',
      label: 'Followers',
      options: [
        {
          id: 'instagram',
          name: 'Instagram',
        },
      ],
      type: FilterTypeValues.followers,
    };

    const objectsMap = {
      baseCity: baseCityObj,
      gender: genderObj,
      age: ageObj,
      interest: interestObj,
      category: categoryObj,
      type: typeObj,
      list: listObj,
      pastEvents: pastEventsObj,
      ticketType: ticketTypeObj,
      partySize: partySizeObj,
      checkedIn: checkedInObj,
      spammed: spammedObj,
      userSource: userSourceObj,
      declinedBy: declinedByObj,
      vouch: vouchObj,
      followersObj,
    };
    // Arrange objects in the desired sequence
    const orderedObjects = filterOptionsSequence.map(id => objectsMap[id]).filter(node => node);
    //ends here
    return orderedObjects;
  }

  /**
   * Functionality to store host feedback.
   * Logic:
   *    1. Based on user id store host feedback along with a tag.
   * @param payload
   * @returns FeedbackResponse
   */
  public static async hostFeedback(payload: HostFeedbackRequestDto): Promise<HostFeedbackData> {
    const host: User = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId, deletedAt: IsNull() },
    });

    if (!host) {
      throw new NotFoundError('User');
    }

    const { description, tag } = payload;

    const feedback = this.dbConnection.getRepository(HostFeedback).create({
      description,
      tag,
      user: host,
    });

    const savedFeedback = await this.dbConnection.getRepository(HostFeedback).save(feedback);

    return {
      description: savedFeedback.description,
      tag: savedFeedback.tag,
      feedbackId: savedFeedback.id,
    };
  }

  public static async duplicateCustomList(
    payload: DuplicateCustomListRequestDto,
  ): Promise<CustomUsersList> {
    const { customListId, customName, hostId, listType } = payload;

    if (!customName) {
      throw new BadRequestError('customName');
    }
    const host = await this.dbConnection.getRepository(User).findOne({
      where: { id: hostId, deletedAt: IsNull() },
      relations: { customLists: true },
    });

    if (!host) {
      throw new NotFoundError('host');
    }

    if (host.customLists.some(list => list.listName === customName)) {
      throw new BadRequestError('List name already exists');
    }

    let existingList;

    switch (true) {
      case !customListId: {
        switch (listType) {
          case 'followed':
            existingList = await this.dbConnection.getRepository(HostFollowing).find({
              where: { host: { id: hostId } },
              relations: { follower: true },
            });
            break;
          case 'favorite':
            existingList = await this.dbConnection.getRepository(HostFavorite).find({
              where: { host: { id: hostId } },
              relations: { member: true },
            });
            break;
          default:
            throw new BadRequestError('Invalid list type provided.');
        }

        if (!existingList || existingList.length === 0) {
          throw new NotFoundError('listType');
        }
        break;
      }

      default: {
        existingList = await this.dbConnection.getRepository(HostCustomUsersLists).findOne({
          where: { id: customListId, host: { id: hostId } },
          relations: ['usersLists', 'usersLists.user'],
        });

        if (!existingList) {
          throw new NotFoundError('existingList');
        }
      }
    }

    const newCustomList = new HostCustomUsersLists();
    newCustomList.listName = customName;
    newCustomList.host = host;
    const savedCustomList = await this.dbConnection
      .getRepository(HostCustomUsersLists)
      .save(newCustomList);

    const userListEntries = (customListId ? existingList.usersLists : existingList).map(
      listUser => {
        const newListUser = new HostCustomUsersListsUsers();
        newListUser.user = customListId
          ? listUser.user
          : listType === 'followed'
            ? listUser.follower
            : listUser.member;
        newListUser.list = savedCustomList;
        return newListUser;
      },
    );

    await this.dbConnection.getRepository(HostCustomUsersListsUsers).save(userListEntries);
    const customListSaved = await this.getCustomUsersList({
      userId: hostId,
      id: savedCustomList.id,
      query: 'take=10&skip=0',
    });
    return customListSaved;
  }

  public static async deleteHostUserMapping(payload: IdRequestDto): Promise<string> {
    const hostUserMapping = await this.dbConnection.getRepository(HostUserMapping).findOne({
      where: { id: payload.id },
    });

    if (!hostUserMapping) {
      throw new NotFoundError('User');
    }
    await this.dbConnection.getRepository(HostUserMapping).remove(hostUserMapping);
    return '';
  }

  public static async getUserProfile(payload: UserAndIdRequestDto): Promise<MemberProfile> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: {
        roles: {
          role: true,
        },
        address: true,
        socialStats: true,
      },
    });
    if (!user) {
      throw new NotFoundError('User');
    }
    const [focuses, interests] = await Promise.all([
      await PlatformService.getUserFocuses({ id: user.id }),
      await PlatformService.getUserInterests({ id: user.id }),
    ]);
    const [hostUserSettings, hostUserFavorite, hostFollowing, hostUserMapping] = await Promise.all([
      this.dbConnection.getRepository(HostUserSettings).findOne({
        where: { user: { id: user.id }, host: { id: payload.id } },
      }),
      this.dbConnection.getRepository(HostFavorite).findOne({
        where: { host: { id: payload.id }, member: { id: user.id } },
      }),
      this.dbConnection.getRepository(HostFollowing).findOne({
        where: { follower: { id: user.id }, host: { id: payload.id } },
      }),
      this.dbConnection.getRepository(HostUserMapping).findOne({
        where: { user: { id: user.id }, host: { id: payload.id } },
      }),
    ]);
    const formattedLists = await this.getUserCustomLists(payload.id, user.id);
    const userRole = user.roles.find(r => ['member', 'non_member'].includes(r.role.name));

    const isFollow = !!hostFollowing;
    const isFavorite = !!hostUserFavorite;
    const isSpam = hostUserSettings?.isSpam ?? false;
    const note = hostUserSettings?.note ?? '';
    const eventCount = await this.dbConnection
      .getRepository(Guest)
      .count({ where: { user: { id: user.id } } });
    const userData = toMemberProfile(
      user,
      focuses,
      interests,
      userRole,
      formattedLists,
      undefined,
      eventCount,
    );
    userData.isFavourite = isFavorite;
    userData.isFollow = isFollow;
    userData.isSpam = isSpam;
    userData.note = note;
    userData.hostUserMappingId = hostUserMapping?.id ?? '';

    return userData;
  }

  public static async getUserCustomLists(
    hostId: string,
    userId: string,
  ): Promise<customListData[]> {
    const result = await this.dbConnection
      .getRepository(HostCustomUsersListsUsers)
      .createQueryBuilder('listUserMapping')
      .leftJoin('listUserMapping.list', 'list')
      .leftJoin('listUserMapping.user', 'listUser')
      .where('list.host.id = :hostId', { hostId })
      .andWhere(
        ':userId IN (SELECT user_id FROM host_custom_users_lists_users WHERE list_id = list.id)',
        { userId },
      )
      .select('list.id', 'id')
      .addSelect('list.listName', 'customName')
      .addSelect('COUNT(listUser.id)', 'userCount')
      .groupBy('list.id')
      .getRawMany();

    return result.map(list => ({
      id: list.id,
      customName: list.customName,
      totalCount: list.userCount,
    }));
  }

  public static async getFollowedUsers(payload: PaginatedRequestDto): Promise<UsersData> {
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const type = parsedQuery?.type;
    const gender = parsedQuery?.gender;
    const focuses = parsedQuery.category;
    const baseCity = parsedQuery.basecity;
    const interest = parsedQuery.interest;
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: { followers: { follower: true } },
    });
    if (!user) {
      throw new NotFoundError('User');
    }
    const queryBuilder = this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('user.socialProviders', 'socialProviders')
      .leftJoinAndSelect('user.hostedEvents', 'hostedEvents')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .innerJoin('user.following', 'hf')
      .addSelect(['hf.createdAt'])
      .where('hf.host.id = :hostId', { hostId: payload.userId })
      .take(take)
      .skip(skip);
    let userTypes: string[] = [];
    if (type && typeof type === 'string') {
      userTypes = type.split(',').map(name => name.trim());
    }

    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder
        .addOrderBy('user.firstName', sortDirection)
        .addOrderBy('user.lastName', sortDirection);
    } else {
      queryBuilder.orderBy('hf.createdAt', 'DESC');
    }

    await this.applyUserFilters(
      queryBuilder,
      parsedQuery,
      searchValue,
      focuses,
      interest,
      gender,
      baseCity,
      undefined,
      userTypes,
    );
    const [followedUsers, totalCount] = await queryBuilder.getManyAndCount();

    const favorites = await this.dbConnection.getRepository(HostFavorite).find({
      where: { host: { id: payload.userId } },
      relations: ['member'],
    });

    const favoriteUserIds = favorites.map(fav => fav.member.id);

    const users = await Promise.all(
      followedUsers.map(async user => {
        const focuses = await PlatformService.getUserFocuses({ id: user.id });
        const interests = await PlatformService.getUserInterests({ id: user.id });

        const socialProvider: SocialProvider = await this.dbConnection
          .getRepository(SocialProvider)
          .findOne({
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
        return userData;
      }),
    );
    return { result: users, totalCount };
  }

  public static async manageUserSpam(payload: ManageUserRequestDto): Promise<string> {
    const host = await this.dbConnection.getRepository(User).findOne({ where: { id: payload.id } });
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.userId } });

    if (!user || !host) {
      throw new NotFoundError('User or Host');
    }
    let hostUserSettings = await this.dbConnection.getRepository(HostUserSettings).findOne({
      where: {
        user: { id: payload.userId },
        host: { id: payload.id },
      },
    });

    if (!hostUserSettings) {
      hostUserSettings = new HostUserSettings();
      hostUserSettings.user = user;
      hostUserSettings.host = host;
      hostUserSettings.isSpam = payload.isSpam;
    } else {
      hostUserSettings.isSpam = payload.isSpam;
    }
    await this.dbConnection.getRepository(HostUserSettings).save(hostUserSettings);
    return '';
  }

  public static async manageMultipleUsersSpam(
    payload: ManageMulipleUsersRequestDto,
  ): Promise<string> {
    const { id: hostId, isSpam, userIds } = payload;

    // Validate Host Exists
    const host = await this.dbConnection.getRepository(User).findOne({ where: { id: hostId } });
    if (!host) {
      throw new NotFoundError('Host');
    }

    // Prepare settings for upsert
    const settings = userIds.map(userId => ({
      host: { id: hostId },
      user: { id: userId },
      isSpam,
    }));

    // Perform upsert operation
    await this.dbConnection.getRepository(HostUserSettings).upsert(settings, ['host', 'user']);

    return '';
  }

  /**
   * Reports a user by storing a report record with associated role IDs.
   * @param payload - The DTO containing report details.
   * @returns A response containing the report details or an error message.
   */
  public static async reportUser(payload: ReportUserRequestDto): Promise<ReportData> {
    const reportedBy = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.reportedById } });
    const reportedTo = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.reportedToId } });

    if (!reportedBy || !reportedTo) {
      throw new NotFoundError('User');
    }

    // Fetch role records from the roles table

    const reportedByRole = await this.dbConnection
      .getRepository(Role)
      .findOne({ where: { id: payload.reportedByRoleId } });
    const reportedToRole = await this.dbConnection
      .getRepository(Role)
      .findOne({ where: { id: payload.reportedToRoleId } });

    if (!reportedByRole || !reportedToRole) {
      throw new BadRequestError('Invalid role IDs provided');
    }

    // Store the report with role IDs
    const report = this.dbConnection.getRepository(Report).create({
      reportedBy,
      reportedTo,
      reportMessage: payload.reportMessage,
      reportedByRole,
      reportedToRole,
    });

    await this.dbConnection.getRepository(Report).save(report);

    const data = {
      reportId: report.id,
      reportMessage: report.reportMessage,
      reportedByRoleId: reportedByRole.id,
      reportedToRoleId: reportedToRole.id,
    };

    return data;
  }

  public static async blockHost(payload: BlockHostRequestDto): Promise<ReportData> {
    const blockedBy = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.blockedById } });
    const blockedTo = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.blockedToId } });

    if (!blockedBy || !blockedTo) {
      throw new NotFoundError('User');
    }

    // Check if already blocked
    const existingBlock = await this.dbConnection.getRepository(Block).findOne({
      where: { blockedBy: { id: blockedBy.id }, blockedTo: { id: blockedTo.id } },
    });

    if (existingBlock) {
      throw new BadRequestError('User already blocked');
    }

    // Store the block record
    const block = this.dbConnection.getRepository(Block).create({
      blockedBy,
      blockedTo,
      blockedByRole: { id: payload.blockedByRoleId },
      blockedToRole: { id: payload.blockedToRoleId },
    });

    await this.dbConnection.getRepository(Block).save(block);

    const data = {
      reportId: '',
      blockId: block.id,
      reportMessage: 'Blocked succesfully',
    };

    return data;
  }

  public static async unblockHost(payload: BlockHostRequestDto): Promise<string> {
    const block = await this.dbConnection.getRepository(Block).findOne({
      where: {
        blockedBy: { id: payload.blockedById },
        blockedTo: { id: payload.blockedToId },
      },
    });

    if (!block) {
      throw new NotFoundError('User');
    }

    await this.dbConnection.getRepository(Block).remove(block);

    return '';
  }

  public static async reportAndBlockHost(payload: ReportUserRequestDto): Promise<ReportData> {
    const reportedBy = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.reportedById } });
    const reportedTo = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.reportedToId } });

    if (!reportedBy || !reportedTo) {
      throw new NotFoundError('User');
    }

    let reportId = null;
    let blockId = null;
    let reportMessage = '';

    // Check if already reported

    const existingReport = await this.dbConnection.getRepository(Report).findOne({
      where: { reportedBy: { id: reportedBy.id }, reportedTo: { id: reportedTo.id } },
    });

    if (!existingReport) {
      // Create a new report
      const report = this.dbConnection.getRepository(Report).create({
        reportedBy,
        reportedTo,
        reportMessage: payload.reportMessage,
        reportedByRole: { id: payload.reportedByRoleId },
        reportedToRole: { id: payload.reportedToRoleId },
      });

      await this.dbConnection.getRepository(Report).save(report);
      reportId = report.id;
    } else {
      reportId = existingReport.id;
      reportMessage = 'User already reported';
    }

    // Check if already blocked

    const existingBlock = await this.dbConnection.getRepository(Block).findOne({
      where: { blockedBy: reportedBy, blockedTo: reportedTo },
    });

    if (!existingBlock) {
      // Block the user after reporting
      const block = this.dbConnection.getRepository(Block).create({
        blockedBy: reportedBy,
        blockedTo: reportedTo,
        blockedByRole: { id: payload.reportedByRoleId },
        blockedToRole: { id: payload.reportedToRoleId },
      });

      await this.dbConnection.getRepository(Block).save(block);
      blockId = block.id;
    } else {
      blockId = existingBlock.id;
    }

    const data = {
      reportId,
      blockId,
      reportMessage,
    };

    return data;
  }

  public static async sendSupportEmail(payload: sendSupportEmailRequestDto): Promise<string> {
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.userId } });
    // TO DO: Change email and sms template
    try {
      await serviceMesh.notificationService().sendEmailFromTemplate(
        [
          {
            key: 'first_name',
            value: payload.message,
          },
        ],
        'Host Application Submitted',
        [user.email.trim()],
        null,
      );
    } catch (error) {}

    return '';
  }

  public static async getAllFeedbacks(payload: ReportAndFeedbackRequestDto): Promise<Feedback[]> {
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const query = this.dbConnection
      .getRepository(HostFeedback)
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .take(take)
      .skip(skip);

    if (searchValue) {
      query.andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search)', {
        search: `%${searchValue}%`,
      });
    }

    const feedbacks = await query.getMany();

    const response = responses.data({
      feedbacks: feedbacks.map(feedback => ({
        id: feedback.id ?? null,
        tag: feedback.tag ?? null,
        description: feedback.description ?? null,
        user: feedback.user
          ? {
              id: feedback.user.id ?? null,
              firstName: feedback.user.firstName ?? null,
              lastName: feedback.user.lastName ?? null,
              dateOfBirth: feedback.user.dateOfBirth ?? null,
              email: feedback.user.email ?? null,
              username: feedback.user.username ?? null,
              phoneNumber: feedback.user.phoneNumber ?? null,
              gender: feedback.user.gender ?? null,
              additionalHostInformation: feedback.user.additionalHostInformation ?? null,
              profilePicture: feedback.user.profilePicture ?? null,
              instagramUserName: feedback.user.instagramUserName ?? null,
              isFirstTimeLoggedIn: feedback.user.isFirstTimeLoggedIn ?? null,
            }
          : undefined,
      })),
    });

    return response.data.feedbacks;
  }

  public static async switchProfile(payload: SwitchProfileDto): Promise<TokenResponseAndRoles> {
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId, deletedAt: IsNull() },
      relations: { roles: { role: true } },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const targetProfile = user.roles.find(item => item.role.name === payload.targetRole);
    if (!targetProfile) {
      throw new ForbiddenError('User does not have the requested role.');
    }
    if (payload.targetRole === 'host' || payload.targetRole === 'member') {
      if (targetProfile.status !== UserStatus.ACTIVE) {
        throw new ForbiddenError('User is not active.');
      }
    }

    if (payload.targetRole === 'non_member') {
      try {
        const request: PasswordlessStartRequest = {
          applicationId: config.get('FUSIONAUTH_APP_ID'),
          loginId: user.email,
        };

        const code = await fusionAuthClientHandler
          .fusionAuthClient()
          .startPasswordlessLogin(request);
        const authenticatedUser = await fusionAuthClientHandler
          .fusionAuthClient()
          .passwordlessLogin({ code: code.response.code });

        return {
          token: authenticatedUser.response.token,
          roles: [
            {
              roleName: targetProfile.role.name,
              roleId: targetProfile.role.id,
            },
          ],
          id: user.id,
        };
      } catch (error) {
        return {
          token: '',
          roles: [
            {
              roleName: targetProfile.role.name,
              roleId: targetProfile.role.id,
            },
          ],
          id: user.id,
        };
      }
    }

    const request: PasswordlessStartRequest = {
      applicationId: config.get('FUSIONAUTH_APP_ID'),
      loginId: user.email,
    };

    const code = await fusionAuthClientHandler.fusionAuthClient().startPasswordlessLogin(request);
    const authenticatedUser = await fusionAuthClientHandler
      .fusionAuthClient()
      .passwordlessLogin({ code: code.response.code });

    return {
      token: authenticatedUser.response.token,
      roles: [
        {
          roleName: targetProfile.role.name,
          roleId: targetProfile.role.id,
        },
      ],
      id: user.id,
    };
  }

  public static async addUserNote(payload: AddUserNoteRequestDto): Promise<AddUserNote> {
    const host = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.userId } });
    const user = await this.dbConnection.getRepository(User).findOne({ where: { id: payload.id } });
    if (!user || !host) {
      throw new NotFoundError('User or Host');
    }
    let hostUserSettings = await this.dbConnection.getRepository(HostUserSettings).findOne({
      where: {
        user: { id: payload.id },
        host: { id: payload.userId },
      },
    });
    if (!hostUserSettings) {
      hostUserSettings = new HostUserSettings();
      hostUserSettings.user = user;
      hostUserSettings.host = host;
      hostUserSettings.note = payload.note;
    } else {
      hostUserSettings.note = payload.note;
    }
    const userHostSettings = await this.dbConnection
      .getRepository(HostUserSettings)
      .save(hostUserSettings);

    return {
      note: userHostSettings.note,
      hostUserSettingsId: userHostSettings.id,
    };
  }

  public static async deactivateUserAccount(payload: IdRequestDto) {
    const user = await this.dbConnection.getRepository(User).findOne({ where: { id: payload.id } });
    if (!user) throw new NotFoundError('User');

    await this.dbConnection.getRepository(User).update(payload.id, {
      isDeactivated: true,
      deactivatedAt: new Date(),
    });

    return '';
  }

  public static async reactivateUserAccount(payload: CheckEmailRequestDto) {
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { email: payload.email, isDeactivated: true } });

    if (user && this.isWithin30Days(user.deactivatedAt)) {
      await this.dbConnection
        .getRepository(User)
        .update(user.id, { isDeactivated: false, deactivatedAt: null });
    }

    return '';
  }

  public static async isWithin30Days(deactivatedAt: Date) {
    return new Date().getTime() - new Date(deactivatedAt).getTime() <= 30 * 24 * 60 * 60 * 1000;
  }

  public static async cleanupGuestOnAccountDeletion(
    payload: IdRequestDto,
  ): Promise<GenericResponse> {
    const queryRunner: QueryRunner = database.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const guestRepository = queryRunner.manager.getRepository(Guest);
      const restrictedInvitesRepository = queryRunner.manager.getRepository(RestrictedInvites);

      const addedGuests = await guestRepository.find({
        where: { addedBy: { id: payload.id } },
      });

      if (addedGuests.length > 0) {
        await guestRepository.update(
          { addedBy: { id: payload.id } },
          { status: GuestStatus.DECLINED, addedBy: null },
        );
      }

      await restrictedInvitesRepository.delete({ restrictedBy: { id: payload.id } });

      await guestRepository.delete({ user: { id: payload.id } });

      await this.removeUserRolesAndCleanup({ id: payload.id }, queryRunner);

      await queryRunner.commitTransaction();

      return responses.ok;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      return responses.badRequest('Error in cleaning up guests on account deletion');
    } finally {
      await queryRunner.release();
    }
  }

  public static async permanantlyDeleteAccount(payload: IdRequestDto): Promise<string> {
    await this.cleanupGuestOnAccountDeletion({ id: payload.id });
    return '';
  }

  public static async removeUserRolesAndCleanup(
    payload: IdRequestDto,
    queryRunner: QueryRunner,
  ): Promise<string> {
    const userRepository = queryRunner.manager.getRepository(User);
    const userRoleRepository = queryRunner.manager.getRepository(UserRole);

    const user = await userRepository.findOne({
      where: { id: payload.id },
      relations: ['roles', 'roles.role'],
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const removableRoleNames = ['member', 'non_member'];
    const removableRoles = user.roles.filter(role => removableRoleNames.includes(role?.role?.name));
    const remainingRoles = user.roles.filter(
      role => !removableRoleNames.includes(role?.role?.name),
    );
    const hasHostRole = remainingRoles.some(role => role?.role?.name === 'host');

    if (removableRoles.length > 0) {
      const removableRoleIds = removableRoles.map(role => role.role.id);
      await userRoleRepository
        .createQueryBuilder()
        .createQueryBuilder()
        .delete()
        .from(UserRole)
        .where('user_id = :userId', { userId: payload.id })
        .andWhere('role_id IN (:...roleIds)', { roleIds: removableRoleIds })
        .execute();
    }

    if (remainingRoles.length === 0) {
      await userRepository.delete({ id: payload.id });
    } else {
      await userRepository.update(payload.id, {
        additionalMemberInformation: null,
        profilePicture: null,
        ...(hasHostRole ? {} : { additionalHostInformation: null }),
      });
    }

    return '';
  }

  public static async deleteHostAccount(payload: IdRequestDto): Promise<string> {
    const queryRunner = database.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager
        .getRepository(User)
        .findOne({ where: { id: payload.id }, relations: { roles: { role: true } } });
      if (!user) throw new NotFoundError('User');
      const isHost = user.roles?.some(role => role.role.name === 'host');
      if (!isHost) throw new NotFoundError('Host');

      try {
        await serviceMesh.eventService().deleteHostEvents(payload.id);
      } catch (error) {}

      await this.deleteNonMemberUsersIfEligible(user.id, queryRunner);
      await this.clearAdditionalHostInfo(user.id, queryRunner);
      await this.removeHostRoleAndDeleteUserIfNeeded(user.id, queryRunner);

      await queryRunner.commitTransaction();
      return '';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public static async deleteNonMemberUsersIfEligible(
    deletedHostId: string,
    queryRunner: QueryRunner,
  ) {
    // Fetch all non-member users created by the deleted host
    const nonMemberUsers = await queryRunner.manager.getRepository(HostUserMapping).find({
      where: { host: { id: deletedHostId } },
      relations: ['user', 'user.roles', 'user.createdByHost'],
    });

    for (const mapping of nonMemberUsers) {
      const { user } = mapping;

      const hostMappings = await queryRunner.manager.getRepository(HostUserMapping).find({
        where: { user: { id: user.id } },
        relations: {
          host: true,
        },
      });

      const isOnlyAssociatedWithDeletedHost =
        hostMappings.length === 1 && hostMappings[0].host?.id === deletedHostId;
      if (isOnlyAssociatedWithDeletedHost) {
        let hasLoggedIn = false;

        try {
          hasLoggedIn = await this.hasUserLoggedIn(user.email);
        } catch (error) {
          hasLoggedIn = false;
        }

        if (!hasLoggedIn) {
          await queryRunner.manager.getRepository(User).delete({ id: user.id });
        }
      }
    }
  }

  public static async hasUserLoggedIn(email: string): Promise<boolean> {
    await fusionAuthClientHandler.fusionAuthClient().retrieveUserByEmail(email);
    return true;
  }

  public static async removeHostRoleAndDeleteUserIfNeeded(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const hostRole = await queryRunner.manager
      .getRepository(Role)
      .findOne({ where: { name: 'host' } });
    if (!hostRole) return;

    await queryRunner.manager
      .getRepository(UserRole)
      .delete({ user: { id: userId }, role: { id: hostRole.id } });

    const remainingRoles = await queryRunner.manager
      .getRepository(UserRole)
      .count({ where: { user: { id: userId } } });

    if (remainingRoles === 0) {
      await queryRunner.manager.getRepository(User).delete({ id: userId });
    }
  }

  public static async clearAdditionalHostInfo(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.manager
      .getRepository(User)
      .update(userId, { additionalHostInformation: null });
  }

  public static async exportUsersCsv(payload: PaginatedRequestDto): Promise<string> {
    // Get the guest data
    const data = await this.getMembers(payload);

    // Define the titles and keys for the CSV
    const titleMapping = [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phoneNumber', title: 'Phone Number' },
      { id: 'gender', title: 'Gender' },
      { id: 'category', title: 'Category' },
      { id: 'city', title: 'City' },
      { id: 'followerCount', title: 'Follower Count' },
      { id: 'categories', title: 'Categories' },
      { id: 'types', title: 'Types' },
      { id: 'status', title: 'Status' },
      { id: 'instagramUsername', title: 'Instagram Username' },
      { id: 'age', title: 'Age' },
      { id: 'isFavourite', title: 'Favourite' },
      { id: 'role', title: 'Role' },
    ];

    // Map the data to the line items that match the title structure
    const lineItems = data.data.map(column => {
      const mappedColumn = {};
      titleMapping.forEach(field => {
        if (field.id === 'isFavourite') {
          mappedColumn[field.title] = column[field.id] ? 'Yes' : 'No';
        } else {
          // Handling special cases for certain fields like age, gender, and empty values
          if (
            column[field.id] === 0 ||
            column[field.id] === 'NOT_APPLICABLE' ||
            !column[field.id]
          ) {
            mappedColumn[field.title] = '—'; // Use large dash if value is 0, 'NOT_APPLICABLE', or empty
          } else {
            mappedColumn[field.title] = column[field.id];
          }
        }
      });
      return mappedColumn;
    });

    // Return the CSV as a string
    return new Promise<string>((resolve, reject) => {
      stringify(
        lineItems,
        { header: true, columns: titleMapping.map(item => item.title) },
        (err, output) => {
          if (err) {
            reject(err);
          }
          resolve(output);
        },
      );
    });
  }
}
