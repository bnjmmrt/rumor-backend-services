// import { Controller, Inject } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
import { RoleService } from '../services/role.service';
import { CheckRoleResponse, ListRolesResponse, ROLE_SERVICE_NAME, RoleResponse, UserRoleResponse } from 'rumor-utils/shared/users/grpc/auth/role.pb';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import { RoleNameRequestDto, RoleRequestDto, UpdateUserRoleRequestDto } from 'rumor-utils/shared/users/dtos/role.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class RoleController {
  public static listRoles = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: ListRolesResponse = await RoleService.listRoles();
      res.json(response);
    }
  );

  public static assignRoleToUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RoleRequestDto = req.body;
      const response: GenericResponse = await RoleService.assignRoleToUser(payload);
      res.json(response);
    }
  );

  public static getUserRoleHierarchy = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: UserRoleResponse = await RoleService.getUserRoleHierarchy(payload);
      res.json(response);
    }
  );

  public static checkRole = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RoleRequestDto = req.body;
      const response: CheckRoleResponse = await RoleService.checkRole(payload);
      res.json(response);
    }
  );

  public static updateUserRole = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateUserRoleRequestDto = req.body;
      const response: GenericResponse = await RoleService.updateUserRole(payload);
      res.json(response);
    }
  );

  public static listUserRoles = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: ListRolesResponse = await RoleService.listUserRoles(payload);
      res.json(response);
    }
  );

  public static revokeRoleFromUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RoleRequestDto = req.body;
      const response: GenericResponse = await RoleService.revokeRoleFromUser(payload);
      res.json(response);
    }
  );

  public static getRoleByName = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RoleNameRequestDto = req.body;
      const response: RoleResponse = await RoleService.getRoleByName(payload);
      res.json(response);
    }
  );

  public static markUserAsSpam = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: GenericResponse = await RoleService.markUserAsSpam(payload);
      res.json(response);
    }
  );
}
