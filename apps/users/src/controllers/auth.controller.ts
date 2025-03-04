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
  HostFeedbackResponse,
  VerifyResponse,
  ReportResponse,
  FeedbacksResponse,
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
  HostFeedbackRequestDto,
  SendVerificationCodeByEmailRequestDto,
  VerifyCodeByEmailRequestDto,
  ReportUserRequestDto,
  BlockHostRequestDto,
  sendSupportEmailRequestDto,
  SwitchProfileDto,
} from 'rumor-utils/shared/users/dtos/auth.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { ListUsersInviteesDto } from 'rumor-utils/shared/events/dtos/guest.dto';
import { IdRequestDto, PaginatedRequestDto, ReportAndFeedbackRequestDto, TokenRequestDto, UpdateUsersStatusDto, UserAndIdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import AuthMiddleware from "../utils/fusion-auth";

export class AuthController {

  //@GrpcMethod(AUTH_SERVICE_NAME, 'ForgotPassword')
  public static forgotPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ForgotPasswordRequestDto = req.body;
      const response: ForgotPasswordResponse = await AuthService.forgot(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static setPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetHostPasswordRequestDto = req.body;
      const response: TokenResponse = await AuthService.setPassword(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static login = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginRequestDto = req.body;
      const response: LoginResponse = await AuthService.login(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static memberSignUp = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MemberSignUpRequestDto = req.body;
      const response: SignUpResponse = await AuthService.memberSignUp(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static hostSignUp = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: HostSignUpRequestDto = req.body;
      const response: SignUpResponse = await AuthService.hostSignUp(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static logout = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: TokenRequestDto = req.body;
      const response: GenericResponse = await AuthService.logout(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
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
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static setHostPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetHostPasswordRequestDto = req.body;
      const response: GenericResponse = await AuthService.setHostPassword(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static updateHostPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).userId;
      const payload: UpdateHostPasswordRequestDto = { ...req.body, id };
      const response: GenericResponse = await AuthService.updateHostPassword(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  public static loginSSO = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: LoginSSOResponse = await AuthService.loginSSO();
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static oAuthRedirect = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: OAuthRequestDto = req.body;
      const response: OAuthRedirectResponse = await AuthService.oAuthRedirect(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static checkPhoneNumber = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PhoneNumberRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkPhoneNumber(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static checkEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CheckEmailRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkEmail(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static checkAge = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CheckAgeRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkAge(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static checkMemberLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginVerificationRequestDto = req.body;
      const response: ValidityResponse = await AuthService.checkMemberLogin(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static memberLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: MemberLoginRequestDto = req.body;
      const response: TokenResponse = await AuthService.memberLogin(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static hostLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginRequestDto = req.body;
      const response: TokenResponse = await AuthService.hostLogin(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static getCurrentMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).userId;
      const payload: IdRequestDto = { id };
      const response: MemberResponse = await AuthService.getCurrentMember(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: SimpleUserResponse = await AuthService.getUser(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getCurrentUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).userId;
      const payload: IdRequestDto = { id };
      const response: CurrentUserResponse = await AuthService.getCurrentUser(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static saveOrUpdateProvider = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SaveOrUpdateProviderAuthRequestDto = req.body;
      const response: SaveOrUpdateProviderAuthResponse = await AuthService.saveOrUpdateProvider(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static sendInvitations = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const payload: UserInvitationsRequestDto = { ...req.body, userId };
      const response: GenericResponse = await AuthService.sendInvitations(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static saveInvitations = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const payload: UserInvitationsRequestDto = { ...req.body, userId };
      const response: GenericResponse = await AuthService.saveInvitations(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static inviteNewMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const payload: InviteNewMemberRequestDto = { ...req.body, userId };
      const response: GenericResponse = await AuthService.inviteNewMember(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static inviteNewHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const payload: InviteNewHostRequestDto = { ...req.body, userId };
      const response: GenericResponse = await AuthService.inviteNewHost(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static updateUserProfilePicture = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserProfilePictureRequestDto = req.body;
      const response: UpdateUserProfilePictureResponse = await AuthService.updateUserProfilePicture(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  public static updateUserProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserProfileRequestDto = req.body;
      const response: UpdateUserProfileResponse = await AuthService.updateUserProfile(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  public static getBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: BioProfileResponse = await AuthService.getBioProfile(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static createBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BioProfileRequestDto = req.body;
      const response: BioProfileResponse = await AuthService.createBioProfile(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static updateBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BioProfileRequestDto = req.body;
      const response: BioProfileResponse = await AuthService.updateBioProfile(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  public static approveMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: GenericResponse = await AuthService.approveMember(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  public static listUsersByType = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersByTypeRequestDto = req.body;
      const response: ListUsersByTypeResponse = await AuthService.listUsersByType(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static updateUsersStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUsersStatusDto = req.body;
      const response: GenericResponse = await AuthService.updateUsersStatus(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static createNonMemberUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateNonMemberUserRequestDto = req.body;
      const response: CreateNonMemberUserResponse = await AuthService.createNonMemberUser(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static createHostCollaborator = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateHostCollaboratorRequestDto = req.body;
      const response: CreateHostCollaboratorResponse = await AuthService.createHostCollaborator(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static getMembersOrNonMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersInviteesDto = req.body;
      const response: GetMembersResponse = await AuthService.getMembersOrNonMembers(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  //same is used for follow(post) and unfollow(delete) 
  public static manageFollowHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageFollowHostRequestDto = req.body;
      const response: GenericResponse = await AuthService.manageFollowHost(payload);
      res.json(response);
    }
  );

  public static getFollowedHosts = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const queryParams = req.query
      const payload: PaginatedRequestDto = { userId: id, query: queryParams };
      const response: GetFollowedHostsResponse = await AuthService.getFollowedHosts(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getCustomUsersLists = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const queryParams = req.query
      const payload: CustomUsersListRequestDto = { ...req.body, userId, query: queryParams };
      const response: CustomUsersListsResponse = await AuthService.getCustomUsersLists(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const userId = (req as any).userId;
      const queryParams = req.query
      const payload: CustomUsersListRequestDto = { userId, id, query: queryParams };
      const response: CustomUsersListResponse = await AuthService.getCustomUsersList(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static deleteCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const userId = (req as any).userId;
      const queryParams = req.query
      const payload: CustomUsersListRequestDto = { userId, id, query: queryParams };
      await AuthService.deleteCustomUsersList(payload);
      const message = "Custom list deleted successfully"
      const deleteResponse = new DeleteResponse(message);
      res.json(deleteResponse).status(deleteResponse.statusCode);
    }
  );

  public static createCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const payload: ManageCustomUsersListRequestDto = { ...req.body, userId };
      const response: CustomUsersListResponse = await AuthService.createCustomUsersList(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static updateCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const { id } = req.params;
      const payload: UpdateCustomUsersListRequestDto = { ...req.body, hostId: userId, customListId: id };
      const response: CustomUsersListResponse = await AuthService.updateCustomUsersList(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  //post and delete
  public static manageFavoriteUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageFavoriteUserRequestDto = req.body;
      const response: GenericResponse = await AuthService.manageFavoriteUser(payload);
      res.json(response);
    }
  );

  public static getFavoriteUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const query = req.query
      const payload: PaginatedRequestDto = { userId, query };
      const response: GetUsersResponse = await AuthService.getFavoriteUsers(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getConfirmedMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ContactsListRequestDto = req.body;
      const response: ConfirmedMembersResponse = await AuthService.getConfirmedMembers(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static getUserWithRolesByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetUserWithRolesByEmailRequestDto = req.body;
      const response: GetUserWithRolesByEmailResponse = await AuthService.getUserWithRolesByEmail(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static registerInvitesAsNonMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: NonMemberSignUpRequestDto = req.body;
      const response: SimpleUserResponse = await AuthService.registerInvitesAsNonMember(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static createUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).userId;
      console.log("userId", id)
      const payload: NonMemberSignUpRequestDto = {
        ...req.body,
        id,
      };
      const response: UserResponseData = await AuthService.createUser(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static getAllUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const query = req.query
      const payload: ListUsersInviteesDto = { userId, query };
      const response: GetUsersResponse = await AuthService.getAllusers(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getUserFiltersOptions = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const query = req.query
      const payload: FilterRequestDto = { userId, query };
      const response: UserFilterOptionsResponse = await AuthService.getUserFiltersOptions(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static hostFeedback = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: HostFeedbackRequestDto = req.body;
      const response: HostFeedbackResponse = await AuthService.hostFeedback(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static sendVerificationCodeByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SendVerificationCodeByEmailRequestDto = req.body;
      const response: GenericResponse = await AuthService.sendVerificationCodeByEmail(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static verifyCodeByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: VerifyCodeByEmailRequestDto = req.body;
      const response: VerifyResponse = await AuthService.verifyCodeByEmail(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static setLoginStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = req.params;
      const payload: IdRequestDto = { id };
      const response: GenericResponse = await AuthService.setLoginStatus(payload);
      const updateResponse = new UpdateResponse(response, 'Ok');
      res.json(updateResponse).status(updateResponse.statusCode);
    }
  );

  public static duplicateCustomList = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const payload: DuplicateCustomListRequestDto = { ...req.body, userId };
      const response: CustomUsersListResponse = await AuthService.duplicateCustomList(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static deleteHostUserMapping = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const payload: IdRequestDto = { id };
      await AuthService.deleteHostUserMapping(payload);
      const message = "User removed successfully"
      const deleteResponse = new DeleteResponse(message);
      res.json(deleteResponse).status(deleteResponse.statusCode);
    }
  );


  //TO DO FROM here
  public static getUserProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const hostId = (req as any).userId;
      const payload: UserAndIdRequestDto = { userId: id, id: hostId };
      const response: MemberProfileResponse = await AuthService.getUserProfile(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static getFollowedUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).userId;
      const query = req.query
      const payload: PaginatedRequestDto = { userId, query };
      const response: GetUsersResponse = await AuthService.getFollowedUsers(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static manageUserSpam = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const hostId = (req as any).userId;
      const payload: ManageUserRequestDto = { ...req.body, userId: id, id: hostId };
      const response: GenericResponse = await AuthService.manageUserSpam(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static reportUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ReportUserRequestDto = req.body;
      const response: ReportResponse = await AuthService.reportUser(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static blockHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BlockHostRequestDto = req.body;
      const response: ReportResponse = await AuthService.blockHost(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static unblockHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BlockHostRequestDto = req.body;
      const response: ReportResponse = await AuthService.unblockHost(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static reportAndBlockHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ReportUserRequestDto = req.body;
      const response: ReportResponse = await AuthService.reportAndBlockHost(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static sendSupportEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: sendSupportEmailRequestDto = req.body;
      const response: GenericResponse = await AuthService.sendSupportEmail(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static getAllReports = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ReportAndFeedbackRequestDto = req.body;
      const response: FeedbacksResponse = await AuthService.getAllFeedbacks(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );

  public static switchProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SwitchProfileDto = req.body;
      const response: TokenResponse = await AuthService.switchProfile(payload);
      const createResponse = new CreateResponse(response, 'Ok');
      res.json(createResponse).status(createResponse.statusCode);
    }
  );
}
