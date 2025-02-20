import { TalentResponse, TalentsResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { TalentService } from '../services/talent.service';
import { CreateTalentRequestDto, RequestByIdDto, UpdateTalentRequestDto } from 'rumor-utils/shared/events/dtos';

export class TalentController {
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateTalent')
  public async createTalent(payload: CreateTalentRequestDto): Promise<TalentResponse> {
    return TalentService.createTalent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetAllTalent')
  public async getAllTalent(): Promise<TalentsResponse> {
    return TalentService.getAllTalent();
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetTalent')
  public async getTalent(payload: RequestByIdDto): Promise<TalentResponse> {
    return TalentService.getTalent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateTalent')
  public async updateTalent(payload: UpdateTalentRequestDto): Promise<TalentResponse> {
    return TalentService.updateTalent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteTalent')
  public async deleteTalent(payload: RequestByIdDto): Promise<TalentResponse> {
    return TalentService.deleteTalent(payload);
  }
}
