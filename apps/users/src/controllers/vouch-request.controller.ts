// import { Controller } from '@nestjs/common';
// import { VouchRequestService } from '../services/vouch-request.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { VouchRequestsResponse, PLATFORM_SERVICE_NAME, GenericResponse, GetUserVouchesResponse } from '../grpc/platform/platform.pb';
// import { CreateVouchRequestDto, UpdateVouchRequestDto } from '../dtos/vouch-request.dto';
// import { IdRequestDto } from '../dtos/platform.dto';

// @Controller()
// export class VouchRequestController {
//   constructor(private readonly vouchRequestService: VouchRequestService) {}

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'CreateVouchRequest')
//   public async createVouchRequest(payload: CreateVouchRequestDto): Promise<GenericResponse> {
//     return this.vouchRequestService.createVouchRequest(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetVouchRequests')
//   public async getAllVouchRequests(payload: IdRequestDto): Promise<VouchRequestsResponse> {
//     return this.vouchRequestService.getVouchRequests(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'UpdateVouchRequest')
//   public async updateVouchRequest(payload: UpdateVouchRequestDto): Promise<GenericResponse> {
//     return this.vouchRequestService.updateVouchRequest(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetUserVouches')
//   public async getUserVouches(payload: IdRequestDto): Promise<GetUserVouchesResponse> {
//     return this.vouchRequestService.getUserVouches(payload);
//   }
// }
