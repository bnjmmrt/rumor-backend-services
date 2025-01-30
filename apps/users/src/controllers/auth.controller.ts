import { AuthService } from '../services/auth.service';
import {
  AUTH_SERVICE_NAME,
  LoginResponse,
  ValidateResponse,
  SignUpResponse,
  ForgotPasswordResponse,
  LoginSSOResponse,
  OAuthRedirectResponse,
  ValidityResponse,
  SaveOrUpdateProviderAuthResponse,
  TokenResponse,
  MemberResponse,
  UpdateUserProfilePictureResponse,
  UpdateUserProfileResponse,
  BioProfileResponse,
  ListUsersByTypeResponse,
  CreateNonMemberUserResponse,
  GetMembersResponse,
  GetFollowedHostsResponse,
  CustomUsersListsResponse,
  CustomUsersListResponse,
  CurrentUserResponse,
  ConfirmedMembersResponse,
  SimpleUserResponse,
  GetUserWithRolesByEmailResponse,
  CreateUserResponse,
} from '../grpc/auth/auth.pb';

import {
  CheckAgeRequestDto,
  CheckEmailRequestDto,
  ForgotPasswordRequestDto,
  HostSignUpRequestDto,
  LoginRequestDto,
  MemberSignUpRequestDto,
  OAuthRequestDto,
  ValidateRequestDto,
  UserInvitationsRequestDto,
  SaveOrUpdateProviderAuthRequestDto,
  MemberLoginRequestDto,
  PhoneNumberRequestDto,
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
} from '../dtos/auth.dto';
import { GenericResponse } from '../grpc/auth/shared.pb';
import { ListUsersInviteesDto } from '../../../events/src/dtos/guest.dto';
import { IdRequestDto, PaginatedRequestDto, TokenRequestDto } from '../dtos/shared.dto';

export class AuthController {
  
  //@GrpcMethod(AUTH_SERVICE_NAME, 'ForgotPassword')
  public static forgotPassword(payload: ForgotPasswordRequestDto): Promise<ForgotPasswordResponse> {
    return AuthService.forgot(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'SetPassword')
  public static setPassword(payload: SetHostPasswordRequestDto): Promise<TokenResponse> {
    return AuthService.setPassword(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  public static login(payload: LoginRequestDto): Promise<LoginResponse> {
    return AuthService.login(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  public static validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
    return AuthService.validate(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'MemberSignUp')
  public static memberSignUp(payload: MemberSignUpRequestDto): Promise<SignUpResponse> {
    return AuthService.memberSignUp(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'HostSignUp')
  public static hostSignUp(payload: HostSignUpRequestDto): Promise<SignUpResponse> {
    return AuthService.hostSignUp(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'Logout')
  public static logout(payload: TokenRequestDto): Promise<GenericResponse> {
    return AuthService.logout(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'ValidatePasswordToken')
  public static validatePasswordToken(payload: ValidatePasswordTokenRequestDto): Promise<ValidityResponse> {
    return AuthService.validatePasswordToken(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'SetHostPassword')
  public static setHostPassword(payload: SetHostPasswordRequestDto): Promise<GenericResponse> {
    return AuthService.setHostPassword(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostPassword')
  public static updateHostPassword(payload: UpdateHostPasswordRequestDto): Promise<GenericResponse> {
    return AuthService.updateHostPassword(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'LoginSSO')
  public static loginSSO(): Promise<LoginSSOResponse> {
    return AuthService.loginSSO();
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'OAuthRedirect')
  public static oAuthRedirect(payload: OAuthRequestDto): Promise<OAuthRedirectResponse> {
    return AuthService.oAuthRedirect(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CheckPhoneNumber')
  public static checkPhoneNumber(payload: PhoneNumberRequestDto): Promise<ValidityResponse> {
    return AuthService.checkPhoneNumber(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CheckEmail')
  public static checkEmail(payload: CheckEmailRequestDto): Promise<ValidityResponse> {
    return AuthService.checkEmail(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CheckAge')
  public static checkAge(payload: CheckAgeRequestDto): Promise<ValidityResponse> {
    return AuthService.checkAge(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CheckMemberLogin')
  public static checkMemberLogin(payload: LoginVerificationRequestDto): Promise<ValidityResponse> {
    return AuthService.checkMemberLogin(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'MemberLogin')
  public static memberLogin(payload: MemberLoginRequestDto): Promise<TokenResponse> {
    return AuthService.memberLogin(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'HostLogin')
  public static hostLogin(payload: LoginRequestDto): Promise<TokenResponse> {
    return AuthService.hostLogin(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetCurrentMember')
  public static getCurrentMember(payload: IdRequestDto): Promise<MemberResponse> {
    return AuthService.getCurrentMember(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetUser')
  public static getUser(payload: IdRequestDto): Promise<SimpleUserResponse> {
    return AuthService.getUser(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetCurrentUser')
  public static getCurrentUser(payload: IdRequestDto): Promise<CurrentUserResponse> {
    return AuthService.getCurrentUser(payload);
  }

  // Provider
  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateProviderAuth')
  public static saveOrUpdateProvider(payload: SaveOrUpdateProviderAuthRequestDto): Promise<SaveOrUpdateProviderAuthResponse> {
    return AuthService.saveOrUpdateProvider(payload);
  }

  // Invitations
  //@GrpcMethod(AUTH_SERVICE_NAME, 'SendInvitations')
  public static sendInvitations(payload: UserInvitationsRequestDto): Promise<GenericResponse> {
    return AuthService.sendInvitations(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'SaveInvitations')
  public static saveInvitations(payload: UserInvitationsRequestDto): Promise<GenericResponse> {
    return AuthService.saveInvitations(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'InviteNewMember')
  public static inviteNewMember(payload: InviteNewMemberRequestDto): Promise<GenericResponse> {
    return AuthService.inviteNewMember(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'InviteNewHost')
  public static inviteNewHost(payload: InviteNewHostRequestDto): Promise<GenericResponse> {
    return AuthService.inviteNewHost(payload);
  }

  // User Profile
  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUserProfilePicture')
  public static updateUserProfilePicture(payload: UpdateUserProfilePictureRequestDto): Promise<UpdateUserProfilePictureResponse> {
    return AuthService.updateUserProfilePicture(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUserProfile')
  public static updateUserProfile(payload: UpdateUserProfileRequestDto): Promise<UpdateUserProfileResponse> {
    return AuthService.updateUserProfile(payload);
  }

  // Bio
  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetBioProfile')
  public async getBioProfile(payload: IdRequestDto): Promise<BioProfileResponse> {
    return AuthService.getBioProfile(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateBioProfile')
  public async createBioProfile(payload: BioProfileRequestDto): Promise<BioProfileResponse> {
    return AuthService.createBioProfile(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateBioProfile')
  public async updateBioProfile(payload: BioProfileRequestDto): Promise<BioProfileResponse> {
    return AuthService.updateBioProfile(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'ApproveMember')
  public static approveMember(payload: IdRequestDto): Promise<GenericResponse> {
    return AuthService.approveMember(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'ListUsersByType')
  public static listUsersByType(payload: ListUsersByTypeRequestDto): Promise<ListUsersByTypeResponse> {
    return AuthService.listUsersByType(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateNonMemberUser')
  public static createNonMemberUser(payload: CreateNonMemberUserRequestDto): Promise<CreateNonMemberUserResponse> {
    return AuthService.createNonMemberUser(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetMembersOrNonMembers')
  public static getMembersOrNonMembers(payload: ListUsersInviteesDto): Promise<GetMembersResponse> {
    return AuthService.getMembersOrNonMembers(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'ManageFollowHost')
  public static manageFollowHost(payload: ManageFollowHostRequestDto): Promise<GenericResponse> {
    return AuthService.manageFollowHost(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetFollowedHosts')
  public static getFollowedHosts(payload: PaginatedRequestDto): Promise<GetFollowedHostsResponse> {
    return AuthService.getFollowedHosts(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetCustomUsersLists')
  public static getCustomUsersLists(payload: IdRequestDto): Promise<CustomUsersListsResponse> {
    return AuthService.getCustomUsersLists(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetCustomUsersList')
  public static getCustomUsersList(payload: CustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    return AuthService.getCustomUsersList(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'DeleteCustomUsersList')
  public static deleteCustomUsersList(payload: CustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    return AuthService.deleteCustomUsersList(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateCustomUsersList')
  public static createCustomUsersList(payload: ManageCustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    return AuthService.createCustomUsersList(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateCustomUsersList')
  public static updateCustomUsersList(payload: ManageCustomUsersListRequestDto): Promise<CustomUsersListResponse> {
    return AuthService.updateCustomUsersList(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'ManageFavoriteUser')
  public static manageFavoriteUser(payload: ManageFavoriteUserRequestDto): Promise<GenericResponse> {
    return AuthService.manageFavoriteUser(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetFavoriteUsers')
  public static getFavoriteUsers(payload: PaginatedRequestDto): Promise<GetMembersResponse> {
    return AuthService.getFavoriteUsers(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetConfirmedMembers')
  public static getConfirmedMembers(payload: ContactsListRequestDto): Promise<ConfirmedMembersResponse> {
    return AuthService.getConfirmedMembers(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetUserWithRolesByEmail')
  public static getUserWithRolesByEmail(payload: GetUserWithRolesByEmailRequestDto): Promise<GetUserWithRolesByEmailResponse> {
    return AuthService.getUserWithRolesByEmail(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'RegisterInvitesAsNonMember')
  public static registerInvitesAsNonMember(payload: NonMemberSignUpRequestDto): Promise<SimpleUserResponse> {
    return AuthService.registerInvitesAsNonMember(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateUser')
  public static createUser(payload: NonMemberSignUpRequestDto): Promise<CreateUserResponse> {
    return AuthService.createUser(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetAllUsers')
  public static getAllUsers(payload: ListUsersInviteesDto): Promise<GetMembersResponse> {
    return AuthService.getAllusers(payload);
  }
}
