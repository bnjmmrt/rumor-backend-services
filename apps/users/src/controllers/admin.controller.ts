import { AuthService } from "../services/auth.service";
import {
  AUTH_SERVICE_NAME,
  BasicHostProfileResponse,
  GetHostsResponse,
  GetMembersResponse,
  HostProfileResponse,
  MemberProfileResponse,
  SignUpResponse,
  TokenResponse,
} from "rumor-utils/shared/users/grpc/auth/auth.pb";
import {
  IdRequestDto,
  PaginatedRequestDto,
  UserAndIdRequestDto,
} from "rumor-utils/shared/users/dtos/shared.dto";
import {
  LoginRequestDto,
  AdminSignUpRequestDto,
  UpdateUserStatusRequestDto,
} from "rumor-utils/shared/users/dtos/auth.dto";
import { UpdateHostProfileRequestDto } from "rumor-utils/shared/users/dtos/admin.dto";
import { GenericResponse } from "rumor-utils/shared/users/grpc/auth/shared.pb";
import asyncWrapper from "src/server/helpers/asyncWrapper";

export class AdminController {
  public static getMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PaginatedRequestDto = req.body;
      const response: GetMembersResponse = await AuthService.getMembers(payload);
      res.json(response);
    }
  );

  public static getHosts = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: PaginatedRequestDto = req.body;
      const response: GetHostsResponse = await AuthService.getHosts(payload);
      res.json(response);
    }
  );

  public static adminLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginRequestDto = req.body;
      const response: TokenResponse = await AuthService.adminLogin(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateAdmin')
  public static createAdmin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: AdminSignUpRequestDto = req.body;
      const response: SignUpResponse = await AuthService.createAdmin(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetHostProfile')
  public static getHostProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UserAndIdRequestDto = req.body;
      const response: HostProfileResponse = await AuthService.getHostProfile(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetBasicHostProfile')
  public static getBasicHostProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: BasicHostProfileResponse = await AuthService.getBasicHostProfile(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostProfile')
  public static updateHostProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateHostProfileRequestDto = req.body;
      const response: BasicHostProfileResponse = await AuthService.updateHostProfile(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostStatus')
  public static updateHostStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserStatusRequestDto = req.body;
      const response: GenericResponse = await AuthService.updateHostStatus(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateMemberStatus')
  public static updateMemberStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserStatusRequestDto = req.body;
      const response: GenericResponse = await AuthService.updateMemberStatus(payload);
      res.json(response);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetMemberProfile')
  public static getMemberProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: MemberProfileResponse = await AuthService.getMemberProfile(payload);
      res.json(response);
    }
  );
}
