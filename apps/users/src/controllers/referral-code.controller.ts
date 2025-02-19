// import { Controller } from '@nestjs/common';
// import { ReferralCodeService } from '../services/referral-code.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { ReferralCodesResponse, PLATFORM_SERVICE_NAME, ReferralCodeResponse } from '../grpc/platform/platform.pb';
// import { CreateReferralCodeRequestDto, ReferredUserRequestDto, UpdateReferralCodeRequestDto } from '../dtos/referral-code.dto';
// import { IdRequestDto, QueryParamRequestDto } from '../dtos/platform.dto';
// import { GenericResponse } from 'apps/auth/src/grpc/auth/shared.pb';

// @Controller()
// export class ReferralCodeController {
//   constructor(private readonly referralCodeService: ReferralCodeService) {}

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'CreateReferralCode')
//   public async createReferralCode(payload: CreateReferralCodeRequestDto): Promise<ReferralCodeResponse> {
//     return this.referralCodeService.createReferralCode(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetReferralCode')
//   public async getReferralCode(payload: IdRequestDto): Promise<ReferralCodeResponse> {
//     return this.referralCodeService.getReferralCode(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetReferralCodes')
//   public async getAllReferralCodes(payload: QueryParamRequestDto): Promise<ReferralCodesResponse> {
//     return this.referralCodeService.getReferralCodes(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'UpdateReferralCode')
//   public async updateReferralCode(payload: UpdateReferralCodeRequestDto): Promise<ReferralCodeResponse> {
//     return this.referralCodeService.updateReferralCode(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'DeactivateReferralCode')
//   public async deactivateReferralCode(payload: IdRequestDto): Promise<ReferralCodeResponse> {
//     return this.referralCodeService.deactivateReferralCode(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'DeleteReferralCode')
//   public async deleteReferralCode(payload: IdRequestDto): Promise<ReferralCodeResponse> {
//     return this.referralCodeService.deleteReferralCode(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'SaveReferredUser')
//   public async saveReferredUser(payload: ReferredUserRequestDto): Promise<GenericResponse> {
//     return this.referralCodeService.saveReferredUser(payload);
//   }
// }
