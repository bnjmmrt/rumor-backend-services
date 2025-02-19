// import { Controller } from '@nestjs/common';
// import { PlatformService } from '../services/platform.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { FocusResponse, GenericResponse, InterestResponse, InterestsResponse, PLATFORM_SERVICE_NAME } from '../grpc/platform/platform.pb';
// import {
//   AddFocusRequestDto,
//   CreateInterestRequestDto,
//   EditFocusNameRequestDto,
//   IdRequestDto,
//   SaveFocusesForUserRequestoDto,
//   SaveInterestsForUserRequestDto,
//   UpdateInterestRequestDto,
// } from '../dtos/platform.dto';

// @Controller()
// export class PlatformController {
//   constructor(private readonly service: PlatformService) {}

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetFocuses')
//   private async getFocuses(): Promise<FocusResponse> {
//     return this.service.getFocuses();
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetUserFocuses')
//   private async getUserFocuses(payload: IdRequestDto): Promise<FocusResponse> {
//     return this.service.getUserFocuses(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'AddFocus')
//   private async addFocus(payload: AddFocusRequestDto): Promise<GenericResponse> {
//     return this.service.addFocus(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'EditFocusName')
//   private async editFocusName(payload: EditFocusNameRequestDto): Promise<GenericResponse> {
//     return this.service.editFocusName(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'SaveFocusesForUser')
//   private async saveFocusesForUser(payload: SaveFocusesForUserRequestoDto): Promise<GenericResponse> {
//     return this.service.saveFocusesForUser(payload);
//   }

//   //Interest Controller
//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'CreateInterest')
//   public async createInterest(payload: CreateInterestRequestDto): Promise<InterestResponse> {
//     return this.service.createInterest(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'ListInterests')
//   public async listInterest(): Promise<InterestsResponse> {
//     return this.service.listInterests();
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetUserInterests')
//   public async getUserInterests(payload: IdRequestDto): Promise<InterestsResponse> {
//     return this.service.getUserInterests(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'SaveInterestsForUser')
//   public async saveInterestsForUser(payload: SaveInterestsForUserRequestDto): Promise<GenericResponse> {
//     return this.service.saveInterestsForUser(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'UpdateInterest')
//   public async updateInterest(payload: UpdateInterestRequestDto): Promise<InterestResponse> {
//     return this.service.updateInterest(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'DeleteInterest')
//   public async deleteInterest(payload: IdRequestDto): Promise<GenericResponse> {
//     return this.service.deleteInterest(payload);
//   }
// }
