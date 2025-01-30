import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { RoleNameRequest, RoleRequest, UpdateUserRoleRequest } from '../grpc/auth/role.pb';
import { UserSource, UserStatus } from '../grpc/auth/shared.pb';

export class RoleRequestDto implements RoleRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsUUID()
  @IsOptional()
  roleId?: string;
  @IsString()
  @IsOptional()
  roleName?: string;
}

export class UpdateUserRoleRequestDto implements UpdateUserRoleRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  roleName?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
  @IsEnum(UserSource)
  @IsOptional()
  source?: UserSource;
}

export class RoleNameRequestDto implements RoleNameRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}
