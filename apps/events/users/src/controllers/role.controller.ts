// import { Controller, Inject } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
import { RoleService } from '../services/role.service';
import { CheckRoleResponse, ListRolesResponse, ROLE_SERVICE_NAME, RoleResponse, UserRoleResponse } from '../grpc/auth/role.pb';
import { IdRequestDto } from '../dtos/shared.dto';
import { RoleNameRequestDto, RoleRequestDto, UpdateUserRoleRequestDto } from '../dtos/role.dto';
import { GenericResponse } from '../grpc/auth/shared.pb';

export class RoleController {
  // @Inject(RoleService)
  // private readonly service: RoleService;

  //@GrpcMethod(ROLE_SERVICE_NAME, 'ListRoles')
  private listRoles(): Promise<ListRolesResponse> {
    return RoleService.listRoles();
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'AssignRoleToUser')
  private assignRoleToUser(payload: RoleRequestDto): Promise<GenericResponse> {
    return RoleService.assignRoleToUser(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'GetUserRoleHierarchy')
  private getUserRoleHierarchy(payload: IdRequestDto): Promise<UserRoleResponse> {
    return RoleService.getUserRoleHierarchy(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'CheckRole')
  private checkRole(payload: RoleRequestDto): Promise<CheckRoleResponse> {
    return RoleService.checkRole(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'UpdateUserRole')
  private updateUserRole(payload: UpdateUserRoleRequestDto): Promise<GenericResponse> {
    return RoleService.updateUserRole(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'ListUserRoles')
  private listUserRoles(payload: IdRequestDto): Promise<ListRolesResponse> {
    return RoleService.listUserRoles(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'RevokeRoleFromUser')
  private revokeRoleFromUser(payload: RoleRequestDto): Promise<GenericResponse> {
    return RoleService.revokeRoleFromUser(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'GetRoleByName')
  private getRoleByName(payload: RoleNameRequestDto): Promise<RoleResponse> {
    return RoleService.getRoleByName(payload);
  }

  //@GrpcMethod(ROLE_SERVICE_NAME, 'MarkUserAsSpam')
  private markUserAsSpam(payload: IdRequestDto): Promise<GenericResponse> {
    return RoleService.markUserAsSpam(payload);
  }
}
