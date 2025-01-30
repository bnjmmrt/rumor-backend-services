import { AuthService } from '../services/auth.service';
import {
  AUTH_SERVICE_NAME,
  BasicHostProfileResponse,
  GetHostsResponse,
  GetMembersResponse,
  HostProfileResponse,
  MemberProfileResponse,
  SignUpResponse,
  TokenResponse,
} from '../grpc/auth/auth.pb';
import { IdRequestDto, PaginatedRequestDto, UserAndIdRequestDto } from '../dtos/shared.dto';
import { LoginRequestDto, AdminSignUpRequestDto, UpdateUserStatusRequestDto } from '../dtos/auth.dto';
import { UpdateHostProfileRequestDto } from '../dtos/admin.dto';
import { GenericResponse } from '../grpc/auth/shared.pb';

export class AdminController {

  async getMembers(payload: PaginatedRequestDto): Promise<GetMembersResponse> {
    return AuthService.getMembers(payload);
  }                
  
  async getHosts(payload: PaginatedRequestDto): Promise<GetHostsResponse> {
    return AuthService.getHosts(payload);
  }

  async adminLogin(payload: LoginRequestDto): Promise<TokenResponse> {
    return AuthService.adminLogin(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateAdmin')
  private createAdmin(payload: AdminSignUpRequestDto): Promise<SignUpResponse> {
    return AuthService.createAdmin(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetHostProfile')
  private getHostProfile(payload: UserAndIdRequestDto): Promise<HostProfileResponse> {
    return AuthService.getHostProfile(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetBasicHostProfile')
  private getBasicHostProfile(payload: IdRequestDto): Promise<BasicHostProfileResponse> {
    return AuthService.getBasicHostProfile(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostProfile')
  private updateHostProfile(payload: UpdateHostProfileRequestDto): Promise<BasicHostProfileResponse> {
    return AuthService.updateHostProfile(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostStatus')
  private updateHostStatus(payload: UpdateUserStatusRequestDto): Promise<GenericResponse> {
    return AuthService.updateHostStatus(payload);
  }

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateMemberStatus')
  private updateMemberStatus(payload: UpdateUserStatusRequestDto): Promise<GenericResponse> {
    return AuthService.updateMemberStatus(payload);
  }
  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetMemberProfile')
  private getMemberProfile(payload: IdRequestDto): Promise<MemberProfileResponse> {
    return AuthService.getMemberProfile(payload);
  }
}
