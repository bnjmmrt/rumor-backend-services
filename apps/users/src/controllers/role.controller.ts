// import { Controller, Inject } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
import { RoleService } from '../services/role.service';
import {
  CheckRoleResponse,
  ListRolesResponse,
  RoleData,
  UserRoleData,
  UserRoleList,
} from 'rumor-utils/shared/users/grpc/auth/role.pb';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import {
  RoleNameRequestDto,
  RoleRequestDto,
  UpdateUserRoleRequestDto,
} from 'rumor-utils/shared/users/dtos/role.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CreateResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';

export class RoleController {
  public static listRoles = asyncWrapper(async (req, res): Promise<void> => {
    const response: ListRolesResponse = await RoleService.listRoles();
    const getResponse = new GetResponse(response, 'Roles listed successfully!');
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static assignRoleToUser = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const payload: RoleRequestDto = { ...req.body, userId: id };
    const response: string = await RoleService.assignRoleToUser(payload);
    const createResponse = new CreateResponse(response, 'Role assigned to user successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static getUserRoleHierarchy = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = req.body;
    const response: UserRoleList[] = await RoleService.getUserRoleHierarchy(payload);
    const createResponse = new CreateResponse(response, 'User roles retrieved successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static checkRole = asyncWrapper(async (req, res): Promise<void> => {
    const payload: RoleRequestDto = req.body;
    const response: CheckRoleResponse = await RoleService.checkRole(payload);
    const createResponse = new CreateResponse(response, 'User role checked successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static updateUserRole = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UpdateUserRoleRequestDto = req.body;
    const response: string = await RoleService.updateUserRole(payload);
    const updateResponse = new UpdateResponse(response, 'User role updated successfully!');
    res.status(updateResponse.statusCode).json(updateResponse);
  });

  public static listUserRoles = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = req.body;
    const response: UserRoleData[] = await RoleService.listUserRoles(payload);
    const getResponse = new GetResponse(response, 'Roles listed successfully!');
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static revokeRoleFromUser = asyncWrapper(async (req, res): Promise<void> => {
    const payload: RoleRequestDto = req.body;
    const response: GenericResponse = await RoleService.revokeRoleFromUser(payload);
    const createResponse = new CreateResponse(response, 'User role revoked successfully!');
    res.status(createResponse.statusCode).json(createResponse);
  });

  public static getRoleByName = asyncWrapper(async (req, res): Promise<void> => {
    const payload: RoleNameRequestDto = req.body;
    const response: RoleData = await RoleService.getRoleByName(payload);
    const getResponse = new GetResponse(response, 'Role by name retrieved successfully!');
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static markUserAsSpam = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const payload: IdRequestDto = req.body;
    const response: string = await RoleService.markUserAsSpam(payload);
    const getResponse = new GetResponse(response, 'Marked user spam successfully!');
    res.status(getResponse.statusCode).json(getResponse);
  });
}
