// import { Controller } from '@nestjs/common';
// import { ReferralRequestService } from '../services/referral-request.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { ReferralRequestsResponse, PLATFORM_SERVICE_NAME, GenericResponse, GetSentReferralRequestsResponse } from '../grpc/platform/platform.pb';
// import { CreateReferralRequestDto, UpdateReferralRequestDto } from '../dtos/referral-request.dto';
// import { IdRequestDto } from '../dtos/platform.dto';

// @Controller()
// export class ReferralRequestController {
//   constructor(private readonly referralRequestService: ReferralRequestService) {}

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'CreateReferralRequest')
//   public async createReferralRequest(payload: CreateReferralRequestDto): Promise<GenericResponse> {
//     return this.referralRequestService.createReferralRequest(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetReferralRequests')
//   public async getAllReferralRequests(payload: IdRequestDto): Promise<ReferralRequestsResponse> {
//     return this.referralRequestService.getReferralRequests(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'UpdateReferralRequest')
//   public async updateReferralRequest(payload: UpdateReferralRequestDto): Promise<GenericResponse> {
//     return this.referralRequestService.updateReferralRequest(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetSentReferralRequests')
//   public async getSentReferralRequests(payload: IdRequestDto): Promise<GetSentReferralRequestsResponse> {
//     return this.referralRequestService.getSentReferralRequests(payload);
//   }
// }
