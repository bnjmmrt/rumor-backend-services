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
  GetUsersResponse,
  UserResponseData,
  UserFilterOptionsResponse,
  MemberProfileResponse,
  CreateHostCollaboratorResponse,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb';

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
  UpdateCustomUsersListRequestDto,
  FilterRequestDto,
  DuplicateCustomListRequestDto,
  ManageUserRequestDto,
  CreateHostCollaboratorRequestDto,
} from 'rumor-utils/shared/users/dtos/auth.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { ListUsersInviteesDto } from 'rumor-utils/shared/events/dtos/guest.dto';
import { IdRequestDto, PaginatedRequestDto, TokenRequestDto, UpdateUsersStatusDto, UserAndIdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import AuthMiddleware from "../utils/fusion-auth";

export class AuthController {
  
  //@GrpcMethod(AUTH_SERVICE_NAME, 'ForgotPassword')
  public static forgotPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ForgotPasswordRequestDto = req.body;
      const response: ForgotPasswordResponse = await AuthService.forgot(payload);
      res.json(response);
    }
  );

  public static setPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetHostPasswordRequestDto = req.body;
      const response: TokenResponse = await AuthService.setPassword(payload);
      res.json(response);
    }
  );

  public static login = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginRequestDto = req.body;
      const response: LoginResponse = await AuthService.login(payload);
      res.json(response);
    }
  );

  public static memberSignUp = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MemberSignUpRequestDto = req.body;
      const response: SignUpResponse = await AuthService.memberSignUp(payload);
      res.json(response);
    }
  );

  public static hostSignUp = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: HostSignUpRequestDto = req.body;
      const response: SignUpResponse = await AuthService.hostSignUp(payload);
      res.json(response);
    }
  );

  public static logout = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: TokenRequestDto = req.body;
      const response: GenericResponse = await AuthService.logout(payload);
      res.json(response);
    }
  );

  public static validate = asyncWrapper(
    async (req, res): Promise<void> => {
      const { userId }:any = req.user;
      res.json(new CreateResponse(userId));
    }
  );

  public static checkService = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: any = await AuthService.checkService();
      res.json(response);
    }
  );

  public static validatePasswordToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ValidatePasswordTokenRequestDto = req.body;
      const response: ValidityResponse = await AuthService.validatePasswordToken(payload);
      res.json(response);
    }
  );

  public static setHostPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetHostPasswordRequestDto = req.body;
      const response: GenericResponse = await AuthService.setHostPassword(payload);
      res.json(response);
    }
  );

  public static updateHostPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateHostPasswordRequestDto = req.body;
      const response: GenericResponse = await AuthService.updateHostPassword(payload);
      res.json(response);
    }
  );

  public static loginSSO = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: LoginSSOResponse = await AuthService.loginSSO();
      res.json(response);
    }
  );

  public static oAuthRedirect = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: OAuthRequestDto = req.body;
      const response: OAuthRedirectResponse = await AuthService.oAuthRedirect(payload);
      res.json(response);
    }
  );

  public static checkPhoneNumber = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PhoneNumberRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkPhoneNumber(payload);
      res.json(response);
    }
  );

  public static checkEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CheckEmailRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkEmail(payload);
      res.json(response);
    }
  );

  public static checkAge = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CheckAgeRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkAge(payload);
      res.json(response);
    }
  );

  public static checkMemberLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginVerificationRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkMemberLogin(payload);
      res.json(response);
    }
  );

  public static memberLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MemberLoginRequestDto = req.body;
      const response: TokenResponse = await AuthService.memberLogin(payload);
      res.json(response);
    }
  );

  public static hostLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginRequestDto = req.body;      
      const response: TokenResponse = await AuthService.hostLogin(payload);
      res.json(response);
    }
  );

  public static getCurrentMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: MemberResponse = await AuthService.getCurrentMember(payload);
      res.json(response);
    }
  );

  public static getUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: SimpleUserResponse = await AuthService.getUser(payload);
      res.json(response);
    }
  );

  public static getCurrentUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: CurrentUserResponse = await AuthService.getCurrentUser(payload);
      res.json(response);
    }
  );

  public static saveOrUpdateProvider = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SaveOrUpdateProviderAuthRequestDto = req.body;
      const response: SaveOrUpdateProviderAuthResponse = await AuthService.saveOrUpdateProvider(payload);
      res.json(response);
    }
  );

  public static sendInvitations = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserInvitationsRequestDto = req.body;
      const response: GenericResponse = await AuthService.sendInvitations(payload);
      res.json(response);
    }
  );

  public static saveInvitations = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserInvitationsRequestDto = req.body;
      const response: GenericResponse = await AuthService.saveInvitations(payload);
      res.json(response);
    }
  );

  public static inviteNewMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InviteNewMemberRequestDto = req.body;
      const response: GenericResponse = await AuthService.inviteNewMember(payload);
      res.json(response);
    }
  );

  public static inviteNewHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InviteNewHostRequestDto = req.body;
      const response: GenericResponse = await AuthService.inviteNewHost(payload);
      res.json(response);
    }
  );

  public static updateUserProfilePicture = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserProfilePictureRequestDto = req.body;
      const response: UpdateUserProfilePictureResponse = await AuthService.updateUserProfilePicture(payload);
      res.json(response);
    }
  );

  public static updateUserProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserProfileRequestDto = req.body;
      const response: UpdateUserProfileResponse = await AuthService.updateUserProfile(payload);
      res.json(response);
    }
  );

  public static getBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: BioProfileResponse = await AuthService.getBioProfile(payload);
      res.json(response);
    }
  );

  public static createBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BioProfileRequestDto = req.body;
      const response: BioProfileResponse = await AuthService.createBioProfile(payload);
      res.json(response);
    }
  );

  public static updateBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BioProfileRequestDto = req.body;
      const response: BioProfileResponse = await AuthService.updateBioProfile(payload);
      res.json(response);
    }
  );

  public static approveMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: GenericResponse = await AuthService.approveMember(payload);
      res.json(response);
    }
  );

  public static listUsersByType = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersByTypeRequestDto = req.body;
      const response: ListUsersByTypeResponse = await AuthService.listUsersByType(payload);
      res.json(response);
    }
  );

  public static updateUsersStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUsersStatusDto = req.body;
      const response: GenericResponse = await AuthService.updateUsersStatus(payload);
      res.json(response);
    }
  );

  public static createNonMemberUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateNonMemberUserRequestDto = req.body;
      const response: CreateNonMemberUserResponse = await AuthService.createNonMemberUser(payload);
      res.json(response);
    }
  );

  public static getMembersOrNonMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersInviteesDto = req.body;
      const response: GetMembersResponse = await AuthService.getMembersOrNonMembers(payload);
      res.json(response);
    }
  );

  public static manageFollowHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageFollowHostRequestDto = req.body;
      const response: GenericResponse = await AuthService.manageFollowHost(payload);
      res.json(response);
    }
  );

  public static getFollowedHosts = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PaginatedRequestDto = req.body;
      const response: GetFollowedHostsResponse = await AuthService.getFollowedHosts(payload);
      res.json(response);
    }
  );

  public static getCustomUsersLists = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CustomUsersListRequestDto = req.body;
      const response: CustomUsersListsResponse = await AuthService.getCustomUsersLists(payload);
      res.json(new GetResponse(response))
    }
  );

  public static getCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CustomUsersListRequestDto = req.body;
      const response: CustomUsersListResponse = await AuthService.getCustomUsersList(payload);
      res.json(response);
    }
  );

  public static deleteCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CustomUsersListRequestDto = req.body;
      await AuthService.deleteCustomUsersList(payload);
      const message = "Custom list deleted successfully"
      res.json(new DeleteResponse(message));    
    }
  );

  public static createCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageCustomUsersListRequestDto = req.body;
      const response: CustomUsersListResponse = await AuthService.createCustomUsersList(payload);
      res.json(new CreateResponse(response));
    }
  );

 public static updateCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateCustomUsersListRequestDto = req.body;
      const response: CustomUsersListResponse = await AuthService.updateCustomUsersList(payload);
      res.json(new CreateResponse(response));    
    }
  );

  public static manageFavoriteUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageFavoriteUserRequestDto = req.body;
      const response: GenericResponse = await AuthService.manageFavoriteUser(payload);
      res.json(response);
    }
  );

  public static getFavoriteUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PaginatedRequestDto = req.body;
      const response: GetUsersResponse = await AuthService.getFavoriteUsers(payload);
      res.json(new GetResponse(response));
    }
  );

  public static getConfirmedMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ContactsListRequestDto = req.body;
      const response: ConfirmedMembersResponse = await AuthService.getConfirmedMembers(payload);
      res.json(response);
    }
  );

  public static getUserWithRolesByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetUserWithRolesByEmailRequestDto = req.body;
      const response: GetUserWithRolesByEmailResponse = await AuthService.getUserWithRolesByEmail(payload);
      res.json(response);
    }
  );

  public static registerInvitesAsNonMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: NonMemberSignUpRequestDto = req.body;
      const response: SimpleUserResponse = await AuthService.registerInvitesAsNonMember(payload);
      res.json(response);
    }
  );

  public static createUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).userId;
      console.log("userId", id)
      const payload: NonMemberSignUpRequestDto = {
        ...req.body, // Spread the existing payload
        id, // Add the userId to the payload
      }; 
      console.log("####", payload)
      const response: UserResponseData = await AuthService.createUser(payload);
      res.json(new CreateResponse(response));
    }
  );

  public static getAllUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersInviteesDto = req.body;
      const response: GetUsersResponse = await AuthService.getAllusers(payload);
      res.json(new GetResponse(response));
    }
  );

  public static getUserFiltersOptions = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: FilterRequestDto = req.body;
      const response: UserFilterOptionsResponse = await AuthService.getUserFiltersOptions(payload);
      res.json(new GetResponse(response));
    }
  );

  public static duplicateCustomList = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: DuplicateCustomListRequestDto = req.body;
      const response: CustomUsersListResponse = await AuthService.duplicateCustomList(payload);
      res.json(new CreateResponse(response));
    }
  );

  public static deleteHostUserMapping = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: GenericResponse = await AuthService.deleteHostUserMapping(payload);
      const message = "User removed successfully"
      res.json(new DeleteResponse(message));
    }
  );

  public static getUserProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserAndIdRequestDto = req.body;
      const response: MemberProfileResponse = await AuthService.getUserProfile(payload);
      res.json(new GetResponse(response));
    }
  );

  public static getFollowedUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PaginatedRequestDto = req.body;
      const response: GetUsersResponse = await AuthService.getFollowedUsers(payload);
      res.json(new GetResponse(response));
    }
  );

  public static manageUserSpam = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageUserRequestDto = req.body;
      const response: GenericResponse = await AuthService.manageUserSpam(payload);
      res.json(new CreateResponse(response));
    }
  );

  public static createHostCollaborator = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload:CreateHostCollaboratorRequestDto  = req.body;
      const response: CreateHostCollaboratorResponse = await AuthService.createHostCollaborator(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );
}
