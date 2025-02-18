import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME, AuthServiceClient, CreateNonMemberUserRequest, SimpleUser } from 'apps/auth/src/grpc/auth/auth.pb';
import { AvailableClients } from '../grpc-clients';
import { unpackResponse } from '../utils/utils';
import { ROLE_SERVICE_NAME, RoleServiceClient } from '../../../../apps/auth/src/grpc/auth/role.pb';
import { InvitedGuestRequestDto } from 'apps/events/src/dtos/guest.dto';
import { SETTINGS_SERVICE_NAME, SettingsServiceClient } from 'apps/auth/src/grpc/auth/settings.pb';

@Injectable()
export class AuthClient {
  constructor(
    @Inject(AvailableClients.AUTH_PACKAGE.packageName)
    private client: ClientGrpc,
  ) {}

  private service: AuthServiceClient;
  private roleService: RoleServiceClient;
  private settingService: SettingsServiceClient;
  private readonly logger = new Logger(AuthClient.name);
  private initialized = false;

  onModuleInit() {
    this.service = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.roleService = this.client.getService<RoleServiceClient>(ROLE_SERVICE_NAME);
    this.settingService = this.client.getService<SettingsServiceClient>(SETTINGS_SERVICE_NAME);
    this.initialized = true;
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.onModuleInit();
    }
    if (!this.service || !this.roleService || !this.settingService) {
      throw new Error('Auth services not properly initialized');
    }
  }

  async validate(token: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.validate({
        token,
      }),
      'validating token',
      injectedLogger ?? this.logger,
    );
  }

  async getCurrentMember(id: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.getCurrentMember({
        id: id,
      }),
      'get current member',
      injectedLogger ?? this.logger,
    );
  }

  async getBasicHostProfile(id: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.getBasicHostProfile({
        id: id,
      }),
      'get basic host profile',
      injectedLogger ?? this.logger,
    );
  }

  async getMembersOrNonMembers(userId: string, query: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.getMembersOrNonMembers({
        userId: userId,
        query: query,
      }),
      'get user members or non members',
      injectedLogger ?? this.logger,
    );
  }

  async getUser(userId: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.getUser({
        id: userId,
      }),
      'Verifies if user exits and get basic data',
      injectedLogger ?? this.logger,
    );
  }

  async getRoleByName(name: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.roleService.getRoleByName({
        name: name,
      }),
      'Gets a role by name',
      injectedLogger ?? this.logger,
    );
  }

  async getUserWithRolesByEmail(email: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.getUserWithRolesByEmail({
        email: email,
      }),
      'Gets a user with roles',
      injectedLogger ?? this.logger,
    );
  }

  async createNonMemberUser(email?: string, phoneNumber?: string, firstName?: string, lastName?: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.createNonMemberUser({
        email: email,
        phoneNumber: phoneNumber,
        firstName: firstName,
        lastName: lastName,
      }),
      'Create a non member user',
      injectedLogger ?? this.logger,
    );
  }

  async assignRoleToUser(userId: string, roleName?: string, roleId?: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.roleService.assignRoleToUser({
        userId: userId,
        roleName: roleName,
        roleId: roleId,
      }),
      'Assign role to an user',
      injectedLogger ?? this.logger,
    );
  }

  async markUserAsSpam(userId: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.roleService.markUserAsSpam({
        id: userId,
      }),
      'Mark user as spam',
      injectedLogger ?? this.logger,
    );
  }

  /**
   * Functionality to create an invited guest as a user with the non_member role if they don't exist.
   * @param payload
   * @param injectedLogger
   * @returns SimpleUser
   */
  async registerInvitesAsNonMember(payload: InvitedGuestRequestDto, injectedLogger?: Logger): Promise<SimpleUser> {
    return unpackResponse(
      this.service.registerInvitesAsNonMember({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
      } as CreateNonMemberUserRequest),
      'register invited guests as non member user',
      injectedLogger ?? this.logger,
    );
  }

  async getCurrentUser(id: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.service.getCurrentUser({
        id: id,
      }),
      'get current user',
      injectedLogger ?? this.logger,
    );
  }

  async getUserSettings(id: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.settingService.getUserSettings({
        id: id,
      }),
      'get user settings',
      injectedLogger ?? this.logger,
    );
  }

  async getPushNotificationTokens(userId: string, injectedLogger?: Logger) {
    this.ensureInitialized();
    return unpackResponse(
      this.settingService.getPushNotificationTokens({
        userId,
      }),
      'get push notification tokens',
      injectedLogger ?? this.logger,
    );
  }
}
