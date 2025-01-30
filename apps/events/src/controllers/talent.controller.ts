// import { Controller } from '@nestjs/common';
// import { EVENTS_SERVICE_NAME, TalentResponse, TalentsResponse } from '../grpc/events/events.pb';
// import { GrpcMethod } from '@nestjs/microservices';
// import { TalentService } from '../services/talent.service';
// import { CreateTalentRequestDto, RequestByIdDto, UpdateTalentRequestDto } from '../dtos';

// @Controller('talent')
// export class TalentController {
//   constructor(private readonly talentServiceService: TalentService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateTalent')
//   public async createTalent(payload: CreateTalentRequestDto): Promise<TalentResponse> {
//     return this.talentServiceService.createTalent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetAllTalent')
//   public async getAllTalent(): Promise<TalentsResponse> {
//     return this.talentServiceService.getAllTalent();
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetTalent')
//   public async getTalent(payload: RequestByIdDto): Promise<TalentResponse> {
//     return this.talentServiceService.getTalent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateTalent')
//   public async updateTalent(payload: UpdateTalentRequestDto): Promise<TalentResponse> {
//     return this.talentServiceService.updateTalent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteTalent')
//   public async deleteTalent(payload: RequestByIdDto): Promise<TalentResponse> {
//     return this.talentServiceService.deleteTalent(payload);
//   }
// }
