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
  TokenResponseAndRoles,
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
  UpdateHostsStatusRequestDto,
} from "rumor-utils/shared/users/dtos/auth.dto";
import { UpdateHostProfileRequestDto } from "rumor-utils/shared/users/dtos/admin.dto";
import { GenericResponse } from "rumor-utils/shared/users/grpc/auth/shared.pb";
import asyncWrapper from "../server/helpers/asyncWrapper";
import { CreateResponse, GetResponse, UpdateResponse } from "rumor-utils/success";
import type { BasicHostProfile } from 'rumor-utils/shared/users/grpc/auth/auth.pb.d.ts';

export class AdminController {
  public static getMembers = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const query = JSON.stringify(req.query);
      const payload: PaginatedRequestDto = {userId, query};
      const response: GetMembersResponse = await AuthService.getMembers(payload);
      const getResponse = new GetResponse(response.data);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static getHosts = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const query = JSON.stringify(req.query);
      const payload: PaginatedRequestDto = { userId, query };
      const response: GetHostsResponse = await AuthService.getHosts(payload);
      const getResponse = new GetResponse(response.data);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static adminLogin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: LoginRequestDto = req.body;
      const response: TokenResponseAndRoles = await AuthService.adminLogin(payload);
      const getResponse = new GetResponse(response);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateAdmin')
  public static createAdmin = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: AdminSignUpRequestDto = req.body;
      const response:any = await AuthService.createAdmin(payload);
      const createResponse = new CreateResponse(response?.user, 'Admin created succesfully');
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetHostProfile')
  public static getHostProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const { id } = req.params;
      const payload: UserAndIdRequestDto = {userId, id};
      const response: HostProfileResponse = await AuthService.getHostProfile(payload);
      const getResponse = new GetResponse(response);
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetBasicHostProfile')
  public static getBasicHostProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = { id: req.user };
      console.log("🚀 ~ AdminController ~ payload:", payload)

      const response: BasicHostProfile = await AuthService.getBasicHostProfile(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostProfile')
  public static updateHostProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const id  = req.user
      const payload: UpdateHostProfileRequestDto = { ...req.body, id };
      const response: BasicHostProfileResponse = await AuthService.updateHostProfile(payload);
      const UpdatedResponse = new UpdateResponse(response.data, 'Updated host details succesfully');
      res.status(UpdatedResponse.statusCode).json(UpdatedResponse)
    }
  );

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostStatus')
  public static updateHostStatus = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateHostsStatusRequestDto = req.body;
      const response: GenericResponse = await AuthService.updateHostStatus(payload);
      const UpdatedResponse = new UpdateResponse(response, 'Status updated succesfully');
      res.status(UpdatedResponse.statusCode).json(UpdatedResponse)
    }
  );

  public static approveHost = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateHostsStatusRequestDto = req.body;
      const response: any = await AuthService.updateHostStatus(payload);
      res.json(response)}
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
      const payload: IdRequestDto = { id: req.params.id };
      const response: MemberProfileResponse = await AuthService.getMemberProfile(payload);
      const successResponse = new GetResponse(response.data);
      res.status(successResponse.statusCode).json(successResponse);
      res.json(response);
    }
  );
}
