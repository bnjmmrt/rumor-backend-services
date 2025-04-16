import connectionManager from '../database';
import { Role } from 'rumor-utils/shared/users/entities/roles/role.entity';
import { UserRole } from 'rumor-utils/shared/users/entities/roles/user-role.entity';
import {
  CheckRoleResponse,
  ListRolesResponse,
  RoleData,
  UserRoleData,
  UserRoleList,
} from 'rumor-utils/shared/users/grpc/auth/role.pb';
import { responses } from '../common/responses.common';
import {
  RoleNameRequestDto,
  RoleRequestDto,
  UpdateUserRoleRequestDto,
} from 'rumor-utils/shared/users/dtos/role.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import { UserSource, UserStatus } from 'rumor-utils/shared/users/interfaces/shared.interface';
import {
  userSourceToEntity,
  userStatusToEntity,
} from 'rumor-utils/shared/users/mappers/shared.mapper';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import { BadRequestError, NotFoundError } from 'rumor-utils/errors';

export class RoleService {
  public static dbConnection = connectionManager;

  static async listRoles(): Promise<ListRolesResponse> {
    return responses.data([]);
  }

  static async assignRoleToUser(payload: RoleRequestDto, source?: UserSource): Promise<UserRole> {
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.userId } });

    let role: Role | null;
    if (payload.roleName) {
      role = await this.dbConnection
        .getRepository(Role)
        .findOne({ where: { name: payload.roleName } });
    } else {
      role = await this.dbConnection.getRepository(Role).findOne({ where: { id: payload.roleId } });
    }

    if (!user || !role) {
      throw new NotFoundError('User or role');
    }

    const userRole = new UserRole();
    userRole.source = source;
    userRole.user = user;
    userRole.role = role;

    const newRole = await this.dbConnection.getRepository(UserRole).save(userRole);
    return newRole;
  }

  static async getUserRoleHierarchy(payload: IdRequestDto): Promise<UserRoleList[]> {
    const userRoles = await this.dbConnection.getRepository(UserRole).find({
      where: { user: { id: payload.id } },
      relations: ['role', 'role.parentRole'],
    });

    const roles = userRoles.map(userRole => {
      const role = userRole.role;
      return {
        id: role.id,
        name: role.name,
        parentRoleId: role.parentRole ? role.parentRole.id : null,
      };
    });

    return roles;
  }

  static async checkRole(payload: RoleRequestDto): Promise<CheckRoleResponse> {
    try {
      const userRoles = await this.dbConnection.getRepository(UserRole).find({
        where: { user: { id: payload.userId } },
        relations: ['role', 'role.parentRole'],
      });

      const isAllowed = userRoles.find(
        role =>
          role.role.name === payload.roleName || role.role.parentRole.name === payload.roleName,
      );
      return { isAllowed: isAllowed !== undefined };
    } catch (err) {
      return { isAllowed: false };
    }
  }

  static async checkHostRole(payload: RoleRequestDto): Promise<CheckRoleResponse> {
    try {
      const userRole = await this.dbConnection
        .getRepository(UserRole)
        .createQueryBuilder('userRole')
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('userRole.user.id = :userId', { userId: payload.userId })
        .andWhere('role.name = :roleName', { roleName: payload.roleName })
        .getOne();
      const isAllowed = userRole !== null;
      return { isAllowed };
    } catch (err) {
      return { isAllowed: false };
    }
  }

  static async updateUserStatus(roleId: string, status: UserStatus): Promise<void> {
    try {
      const userRole = await this.dbConnection.getRepository(UserRole).findOneBy({ id: roleId });
      if (!userRole) return;

      userRole.status = status;
      await userRole.save();
    } catch (err) {
      console.log('🚀 ~ RoleService ~ updateUserStatus ~ err:', err);
    }
  }

  static async revokeRoleFromUser(payload: RoleRequestDto): Promise<GenericResponse> {
    try {
      const user = await this.dbConnection
        .getRepository(User)
        .findOne({ where: { id: payload.userId } });

      let role: Role | null;
      if (payload.roleName) {
        role = await this.dbConnection
          .getRepository(Role)
          .findOne({ where: { name: payload.roleName } });
      } else {
        role = await this.dbConnection
          .getRepository(Role)
          .findOne({ where: { id: payload.roleId } });
      }

      if (!user || !role) {
        return responses.notFound('User or Role not found');
      }

      await this.dbConnection
        .getRepository(UserRole)
        .delete({ user: { id: user.id }, role: { id: role.id } });
      return responses.ok;
    } catch (err) {
      return responses.badRequest(`Unable to revoke role to the user: ${err}`);
    }
  }

  static async listUserRoles(payload: IdRequestDto): Promise<UserRoleData[]> {
    const user = await this.dbConnection.getRepository(User).findOne({ where: { id: payload.id } });
    if (!user) {
      throw new NotFoundError('User');
    }
    const userRoles = await this.dbConnection
      .getRepository(UserRole)
      .find({ where: { user: { id: user.id } }, relations: ['role'] });
    const roles = userRoles.map(item => {
      return {
        id: item.role.id,
        name: item.role.name,
        subRoles: [],
      };
    });
    return roles;
  }

  static async updateUserRole(payload: UpdateUserRoleRequestDto): Promise<string> {
    if (!payload.roleId && !payload.roleName) {
      throw new BadRequestError('RoleId or RoleName must exists in body params');
    }
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.userId } });
    const role = await this.dbConnection.getRepository(Role).findOne({
      where: [{ id: payload.roleId }, { name: payload.roleName }],
    });
    if (!user || !role) {
      throw new NotFoundError('User or role');
    }
    const update: Partial<UserRole> = {};
    if (payload.status) {
      update.status = userStatusToEntity[payload.status];
    }
    if (payload.source) {
      update.source = userSourceToEntity[payload.source];
    }
    update.role = role;
    update.id = user.id;
    await this.dbConnection.getRepository(UserRole).update({ user: { id: user.id } }, update);
    return '';
  }

  static async getRoleByName(payload: RoleNameRequestDto): Promise<RoleData> {
    const role = await this.dbConnection.getRepository(Role).findOne({
      where: {
        name: payload.name,
      },
    });
    return {
      id: role.id,
      name: role.name,
    };
  }

  static async markUserAsSpam(payload: IdRequestDto): Promise<string> {
    const roles = await this.dbConnection.getRepository(UserRole).find({
      where: {
        user: { id: payload.id },
      },
    });

    await Promise.all(
      roles.map(async item => {
        item.isBlacklisted = true;
        await this.dbConnection.getRepository(UserRole).save(item);
      }),
    );
    return '';
  }
}
