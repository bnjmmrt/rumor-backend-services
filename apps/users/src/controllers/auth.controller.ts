import { AuthService } from "../services/auth.service";
import {
  LoginSSOResponse,
  OAuthRedirectResponse,
  SaveOrUpdateProviderAuthResponse,
  UserResponseData,
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
  AdditionalHostInformation,
  Filter,
  HostFeedbackData,
  VerificationStatus,
  UserDataSimple,
  UserWithRoles,
  UserIdWithRolesAndToken,
  AddUserNote,
} from "rumor-utils/shared/users/grpc/auth/auth.pb";

import {
  CheckAgeRequestDto,
  CheckEmailRequestDto,
  ForgotPasswordRequestDto,
  HostSignUpRequestDto,
  LoginRequestDto,
  MemberSignUpRequestDto,
  OAuthRequestDto,
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
  AddUserNoteRequestDto,
  ManageMulipleUsersRequestDto,
} from "rumor-utils/shared/users/dtos/auth.dto";
import {
  GenericResponse,
  UserIdData,
} from "rumor-utils/shared/users/grpc/auth/shared.pb";
import { ListUsersInviteesDto } from "rumor-utils/shared/events/dtos/guest.dto";
import {
  IdRequestDto,
  PaginatedRequestDto,
  ReportAndFeedbackRequestDto,
  TokenRequestDto,
  UpdateUsersStatusDto,
  UserAndIdRequestDto,
} from "rumor-utils/shared/users/dtos/shared.dto";
import asyncWrapper from "../server/helpers/asyncWrapper";
import {
  CreateResponse,
  DeleteResponse,
  GetResponse,
  UpdateResponse,
} from "rumor-utils/success";

export class AuthController {
  //@GrpcMethod(AUTH_SERVICE_NAME, 'ForgotPassword')
  public static forgotPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ForgotPasswordRequestDto = req.body;
      const response: string = await AuthService.forgot(payload);
      const createResponse = new CreateResponse(
        response,
        "Password reset email sent successfully."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static setPassword = asyncWrapper(async (req, res): Promise<void> => {
    const payload: SetHostPasswordRequestDto = req.body;
    const response: TokenResponseAndRoles = await AuthService.setPassword(
      payload
    );
    const createResponse = new CreateResponse(
      response,
      "Password reset successfully"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static login = asyncWrapper(async (req, res): Promise<void> => {
    const payload: LoginRequestDto = req.body;
    const response: Data = await AuthService.login(payload);
    const createResponse = new CreateResponse(
      response,
      "Logged in successfully"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static memberSignUp = asyncWrapper(async (req, res): Promise<void> => {
    const payload: MemberSignUpRequestDto = req.body;
    const response: UserIdWithRolesAndToken = await AuthService.memberSignUp(
      payload
    );
    const createResponse = new CreateResponse(response);
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static hostSignUp = asyncWrapper(async (req, res): Promise<void> => {
    const payload: HostSignUpRequestDto = req.body;
    const response: string = await AuthService.hostSignUp(payload);
    const createResponse = new CreateResponse(
      response,
      "Host sign-up successful"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static logout = asyncWrapper(async (req, res): Promise<void> => {
    const payload: TokenRequestDto = req.token;
    const response: string = await AuthService.logout(payload);
    const createResponse = new CreateResponse(
      response,
      "Logged out successfully."
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static validate = asyncWrapper(async (req, res): Promise<void> => {
    const userId: any = req.user;
    res.json(new CreateResponse(userId));
  });

  public static checkService = asyncWrapper(async (req, res): Promise<void> => {
    const response: any = await AuthService.checkService();
    res.json(response);
  });

  public static validatePasswordToken = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ValidatePasswordTokenRequestDto = req.body;
      const response: Validity = await AuthService.validatePasswordToken(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Password token validated"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static setHostPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SetHostPasswordRequestDto = req.body;
      const response: string = await AuthService.setHostPassword(payload);
      const createResponse = new CreateResponse(
        response,
        "Password has been successfully reset."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static updateHostPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).user;
      const payload: UpdateHostPasswordRequestDto = { ...req.body, id };
      const response: string = await AuthService.updateHostPassword(payload);
      const updateResponse = new UpdateResponse(
        response,
        "Host password updated successfully."
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static updateAdminPassword = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).user;
      const payload: UpdateAdminPasswordRequestDto = { ...req.body, id };
      const response: string = await AuthService.updateAdminPassword(payload);
      const updateResponse = new UpdateResponse(
        response,
        "Admin password updated successfully."
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static loginSSO = asyncWrapper(async (req, res): Promise<void> => {
    const response: LoginSSOResponse = await AuthService.loginSSO();
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static oAuthRedirect = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: OAuthRequestDto = req.body;
      const response: OAuthRedirectResponse = await AuthService.oAuthRedirect(
        payload
      );
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static checkPhoneNumber = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PhoneNumberRequestDto = req.body;
      const response: Validity = await AuthService.checkPhoneNumber(payload);
      const createResponse = new CreateResponse(
        response,
        "Verification code sent."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static checkEmail = asyncWrapper(async (req, res): Promise<void> => {
    const payload: CheckEmailRequestDto = req.body;
    const response: Validity = await AuthService.checkEmail(payload);
    const createResponse = new CreateResponse(
      response,
      "Verification code sent."
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static checkAge = asyncWrapper(async (req, res): Promise<void> => {
    const payload: CheckAgeRequestDto = req.body;
    const response: Validity = await AuthService.checkAge(payload);
    const createResponse = new CreateResponse(
      response,
      "Age verified successfully."
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static checkMemberLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginVerificationRequestDto = req.body;
      const response: Validity = await AuthService.checkMemberLogin(payload);
      const createResponse = new CreateResponse(
        response,
        "Verification code sent."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static memberLogin = asyncWrapper(async (req, res): Promise<void> => {
    const payload: MemberLoginRequestDto = req.body;
    const response: TokenResponseAndRoles = await AuthService.memberLogin(
      payload
    );
    const createResponse = new CreateResponse(response);
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static hostLogin = asyncWrapper(async (req, res): Promise<void> => {
    const payload: LoginRequestDto = req.body;
    const response: TokenResponseAndRoles = await AuthService.hostLogin(
      payload
    );
    const createResponse = new CreateResponse(
      response,
      "Host logged successfully"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static getCurrentMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).user;
      const payload: IdRequestDto = { id };
      const response: CurrentMember = await AuthService.getCurrentMember(
        payload
      );
      const successResponse = new GetResponse(
        response,
        "Current member fetched successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getUser = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const payload: IdRequestDto = { id };
    const response: SimpleUser = await AuthService.getUser(payload);
    const successResponse = new GetResponse(
      response,
      "User details retrieved successfully."
    );
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getMe = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).user;
      const payload: IdRequestDto = { id };
      const response: CurrentUser = await AuthService.getMe(payload);
      const successResponse = new GetResponse(
        response,
        "Successfully retrieved current user."
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static saveOrUpdateProvider = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SaveOrUpdateProviderAuthRequestDto = req.body;
      const response: SaveOrUpdateProviderAuthResponse =
        await AuthService.saveOrUpdateProvider(payload);
      const createResponse = new CreateResponse(response);
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static sendInvitations = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const payload: UserInvitationsRequestDto = { ...req.body, userId };
      const response: string = await AuthService.sendInvitations(payload);
      const createResponse = new CreateResponse(response, "Invitation sent.");
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static saveInvitations = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const payload: UserInvitationsRequestDto = { ...req.body, userId };
      const response: string = await AuthService.saveInvitations(payload);
      const createResponse = new CreateResponse(response, "Invitation saved.");
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static inviteNewMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const payload: InviteNewMemberRequestDto = { ...req.body, userId };
      const response: string = await AuthService.inviteNewMember(payload);
      const createResponse = new CreateResponse(
        response,
        "Invitated new member."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static inviteNewHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const payload: InviteNewHostRequestDto = { ...req.body, userId };
      const response: string = await AuthService.inviteNewHost(payload);
      const createResponse = new CreateResponse(
        response,
        "Invitated new host."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static updateUserProfilePicture = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserProfilePictureRequestDto = {
        id: req.params.id,
        profilePicture: req.body.profilePicture,
      };
      const response: UserProfilePicture =
        await AuthService.updateUserProfilePicture(payload);
      const updateResponse = new UpdateResponse(
        response,
        "User profile picture updated"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static updateUserProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserProfileRequestDto = req.body;
      payload.id = req.params.id;
      const response: UserProfile = await AuthService.updateUserProfile(
        payload
      );
      const updateResponse = new UpdateResponse(
        response,
        "User profile updated"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static getBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      payload.id = req.params.id;
      const response: AdditionalHostInformation =
        await AuthService.getBioProfile(payload);
      const successResponse = new GetResponse(
        response,
        "Retrieved bio profile successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static createBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BioProfileRequestDto = req.body;
      const response: AdditionalHostInformation =
        await AuthService.createBioProfile(payload);
      const createResponse = new CreateResponse(
        response,
        "Created bio profile"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static updateBioProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BioProfileRequestDto = req.body;
      payload.userId = req.params.id;
      const response: AdditionalHostInformation =
        await AuthService.updateBioProfile(payload);
      const updateResponse = new UpdateResponse(
        response,
        "Updated bio profile"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static approveMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: GenericResponse = await AuthService.approveMember(
        payload
      );
      const updateResponse = new UpdateResponse(
        response,
        "Member has been aprroved"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static listUsersByType = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersByTypeRequestDto = req.body;
      const response: UserDataSimple[] = await AuthService.listUsersByType(
        payload
      );
      const successResponse = new GetResponse(
        response,
        "Users list by type retrieved successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static updateUsersStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUsersStatusDto = req.body;
      const response: string = await AuthService.updateUsersStatus(payload);
      const createResponse = new CreateResponse(response);
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static createNonMemberUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateNonMemberUserRequestDto = req.body;
      const response: UserIdData = await AuthService.createNonMemberUser(
        payload
      );
      const createResponse = new CreateResponse(response);
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static createHostCollaborator = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateHostCollaboratorRequestDto = req.body;
      const response: UserIdData = await AuthService.createHostCollaborator(
        payload
      );
      const createResponse = new CreateResponse(response);
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static getMembersOrNonMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const queryParams = req.query;
      const payload: ListUsersInviteesDto = { ...req.body, query: queryParams };
      const response: Member[] = await AuthService.getMembersOrNonMembers(
        payload
      );
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static manageFollowHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const hostId = req.params.id;
      const payload: ManageFollowHostRequestDto = { ...req.body, hostId };
      const response: string = await AuthService.manageFollowHost(payload);
      const successResponse = new CreateResponse(
        response,
        "Manage Host Follower"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getFollowedHosts = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const queryParams = req.query;
      const payload: PaginatedRequestDto = { userId: id, query: queryParams };
      const response: HostsProfile = await AuthService.getFollowedHosts(
        payload
      );
      const successResponse = new GetResponse(
        response,
        "Retrieved followed hosts successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getCustomUsersLists = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const queryParams = req.query;
      const payload: CustomUsersListRequestDto = {
        ...req.body,
        userId,
        query: queryParams,
      };
      const response: CustomUsersListsData =
        await AuthService.getCustomUsersLists(payload);
      const successResponse = new GetResponse(
        response,
        "Retrieved custom users lists successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const userId = (req as any).user;
      const queryParams = req.query;
      const payload: CustomUsersListRequestDto = {
        userId,
        id,
        query: queryParams,
      };
      const response: CustomUsersList = await AuthService.getCustomUsersList(
        payload
      );
      const successResponse = new GetResponse(
        response,
        "Retrieved custom users list successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static deleteCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const userId = (req as any).user;
      const queryParams = req.query;
      const payload: CustomUsersListRequestDto = {
        userId,
        id,
        query: queryParams,
      };
      const response: string = await AuthService.deleteCustomUsersList(payload);
      const message = "Custom list deleted successfully";
      const deleteResponse = new DeleteResponse(response, message);
      res.status(deleteResponse.statusCode).json(deleteResponse);
    }
  );

  public static createCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const payload: ManageCustomUsersListRequestDto = { ...req.body, userId };
      const response: CustomUsersList = await AuthService.createCustomUsersList(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Created custom users list successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static updateCustomUsersList = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const { id } = req.params;
      const payload: UpdateCustomUsersListRequestDto = {
        ...req.body,
        hostId: userId,
        customListId: id,
      };
      const response: CustomUsersList = await AuthService.updateCustomUsersList(
        payload
      );
      const updateResponse = new UpdateResponse(
        response,
        "Updated custom users list successfully"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  //post and delete
  public static manageFavoriteUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const favorite =
        req.method === "POST" ? true : req.method === "DELETE" ? false : null;
      const { id } = req.params;
      const payload: ManageFavoriteUserRequestDto = {
        ...req.body,
        userId: id,
        favorite,
      };
      const response: string = await AuthService.manageFavoriteUser(payload);
      const updateResponse = new UpdateResponse(
        response,
        "Successfully managed user favorite"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static getFavoriteUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const query = req.query;
      const payload: PaginatedRequestDto = { userId, query };
      const response: UsersData = await AuthService.getFavoriteUsers(payload);
      const successResponse = new GetResponse(
        response,
        "Favorite users retrieved successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getConfirmedMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ContactsListRequestDto = req.body;
      const response: ConfirmedMember[] = await AuthService.getConfirmedMembers(
        payload
      );
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getUserWithRolesByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetUserWithRolesByEmailRequestDto = req.body;
      const response: UserWithRoles = await AuthService.getUserWithRolesByEmail(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "User with roles by email retrieved successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static getUserWithRolesById = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: UserWithRoles = await AuthService.getUserWithRolesById(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "User with roles by id retrieved successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static getUserWithRolesByPhone = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetUserWithRolesByPhoneRequestDto = req.body;
      const response: UserWithRoles = await AuthService.getUserWithRolesByPhone(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "User with roles by phone retrieved successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static registerInvitesAsNonMember = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: NonMemberSignUpRequestDto = req.body;
      const response: SimpleUser = await AuthService.registerInvitesAsNonMember(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Registerd invitees as non member"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static createUser = asyncWrapper(async (req, res): Promise<void> => {
    const id = (req as any).user;
    const payload: NonMemberSignUpRequestDto = {
      ...req.body,
      id,
    };
    const response: UserResponseData = await AuthService.createUser(payload);
    const createResponse = new CreateResponse(
      response,
      "User created successfully."
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static getAllUsers = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    const query = req.query;
    const payload: ListUsersInviteesDto = { userId, query };
    const response: UsersData = await AuthService.getAllusers(payload);
    const successResponse = new GetResponse(
      response,
      "Users retrieved successfully"
    );
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getUserFiltersOptions = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const query = req.query;
      const payload: FilterRequestDto = { userId, query };
      const response: Filter[] = await AuthService.getUserFiltersOptions(
        payload
      );
      const successResponse = new GetResponse(
        response,
        "Users filters retrieved successfully"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static hostFeedback = asyncWrapper(async (req, res): Promise<void> => {
    const payload: HostFeedbackRequestDto = req.body;
    const response: HostFeedbackData = await AuthService.hostFeedback(payload);
    const createResponse = new CreateResponse(
      response,
      "Feedback successfully created"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static sendVerificationCodeByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SendVerificationCodeByEmailRequestDto = req.body;
      const response: string = await AuthService.sendVerificationCodeByEmail(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Sent verification code successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static verifyCodeByEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: VerifyCodeByEmailRequestDto = req.body;
      const response: VerificationStatus = await AuthService.verifyCodeByEmail(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Code verified successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static setLoginStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = req.params;
      const payload: IdRequestDto = { id };
      const response: string = await AuthService.setLoginStatus(payload);
      const updateResponse = new UpdateResponse(
        response,
        "Login status reset successfully"
      );
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static duplicateCustomList = asyncWrapper(
    async (req, res): Promise<void> => {
      const hostId = (req as any).user;
      const payload: DuplicateCustomListRequestDto = { ...req.body, hostId };
      const response: CustomUsersList = await AuthService.duplicateCustomList(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Custom list duplicated successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static deleteHostUserMapping = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const payload: IdRequestDto = { id };
      const response = await AuthService.deleteHostUserMapping(payload);
      const message = "User removed successfully";
      const deleteResponse = new DeleteResponse(response, message);
      res.status(deleteResponse.statusCode).json(deleteResponse);
    }
  );

  public static getUserProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const hostId = (req as any).user;
      const payload: UserAndIdRequestDto = { userId: id, id: hostId };
      const response: MemberProfile = await AuthService.getUserProfile(payload);
      const successResponse = new GetResponse(
        response,
        "User data successfully retrieved"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getFollowedUsers = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const query = req.query;
      const payload: PaginatedRequestDto = { userId, query };
      const response: UsersData = await AuthService.getFollowedUsers(payload);
      const successResponse = new GetResponse(
        response,
        "Followed host retrieved"
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static manageUserSpam = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const hostId = (req as any).user;
      const payload: ManageUserRequestDto = {
        ...req.body,
        userId: id,
        id: hostId,
      };
      const response: string = await AuthService.manageUserSpam(payload);
      const createResponse = new CreateResponse(
        response,
        "User spam status updated successfully."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static manageMultipleUsersSpam = asyncWrapper(
    async (req, res): Promise<void> => {
      const hostId = (req as any).user;
      const payload: ManageMulipleUsersRequestDto = {
        ...req.body,
        id: hostId,
      };
      const response: string = await AuthService.manageMultipleUsersSpam(payload);
      const createResponse = new CreateResponse(
        response,
        "Users spam status updated successfully."
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static reportUser = asyncWrapper(async (req, res): Promise<void> => {
    const payload: ReportUserRequestDto = req.body;
    const response: ReportData = await AuthService.reportUser(payload);
    const createResponse = new CreateResponse(
      response,
      "User report submitted successfully."
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static blockHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id, hostId } = req.params;
      const payload: BlockHostRequestDto = {
        blockedById: id,
        blockedToId: hostId,
        blockedByRoleId: req.body.blockedByRoleId,
        blockedToRoleId: req.body.blockedToRoleId
      };
      const response: ReportData = await AuthService.blockHost(payload);
      const createResponse = new CreateResponse(response, 'Host blocked successfully.');
     res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static unblockHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id, hostId } = req.params;
      const payload: BlockHostRequestDto = {
        blockedById: id,
        blockedToId: hostId,
        blockedByRoleId: req.body.blockedByRoleId,
        blockedToRoleId: req.body.blockedToRoleId
      };
      const response: string = await AuthService.unblockHost(payload);
      const createResponse = new CreateResponse(response, 'Host unblocked successfully.');
     res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static reportAndBlockHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id, hostId } = req.params;
      const payload: ReportUserRequestDto = {
        reportedById: id,
        reportedToId: hostId,
        reportMessage: req.body.reportMessage,
        reportedByRoleId: req.body.reportedByRoleId,
        reportedToRoleId: req.body.reportedToRoleId
      };
      const response: ReportData = await AuthService.reportAndBlockHost(payload);
      const createResponse = new CreateResponse(response, 'Host reported and blocked successfully.');
     res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static sendSupportEmail = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: sendSupportEmailRequestDto = req.body;
      const response: string = await AuthService.sendSupportEmail(payload);
      const createResponse = new CreateResponse(response, "Sent support mail.");
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static getAllReports = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ReportAndFeedbackRequestDto = req.body;
      const response: Feedback[] = await AuthService.getAllFeedbacks(payload);
      const createResponse = new CreateResponse(
        response,
        "All reports retrieved successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static switchProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = req.params.id;
      const payload: SwitchProfileDto = { ...req.body, userId };
      const response: TokenResponseAndRoles = await AuthService.switchProfile(
        payload
      );
      const createResponse = new CreateResponse(
        response,
        "Profile switched successfully"
      );
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static addUserNote = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user;
    const payload: AddUserNoteRequestDto = { ...req.body, id, userId };
    const response: AddUserNote = await AuthService.addUserNote(payload);
    const createResponse = new CreateResponse(
      response,
      "Note added successfully"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static deactivateUserAccount = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    // const userId = (req as any).user;
    const payload: IdRequestDto = { id };
    const response: any = await AuthService.deactivateUserAccount(payload);
    const deleteResponse = new DeleteResponse(
      response,
      "User account deactivated successfully"
    );
    res.status(deleteResponse.statusCode).json(deleteResponse);
  });

  public static reactivateUserAccount = asyncWrapper(async (req, res): Promise<void> => {
    // const userId = (req as any).user;
    const payload: CheckEmailRequestDto = req.body;
    const response: any = await AuthService.reactivateUserAccount(payload);
    const createResponse = new CreateResponse(
      response,
      "User account reactivated successfully"
    );
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static permanantlyDeleteAccount = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    // const userId = (req as any).user;
    const payload: IdRequestDto = { id };
    const response: any = await AuthService.permanantlyDeleteAccount(payload);
    const deleteResponse = new DeleteResponse(
      response,
      "User account permanantly deleted"
    );
    res.status(deleteResponse.statusCode).json(deleteResponse);
  });

  public static deleteHostAccount = asyncWrapper(async (req, res): Promise<void> => {
    const id = (req as any).user || req.params.id;
    const payload: IdRequestDto = { id };
    const response: any = await AuthService.deleteHostAccount(payload);
    const deleteResponse = new DeleteResponse(
      response,
      "Host account permanantly deleted"
    );
    res.status(deleteResponse.statusCode).json(deleteResponse);
  });
}
