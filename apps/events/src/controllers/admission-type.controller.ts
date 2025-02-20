import { AdmissionTypeService } from '../services/admission-type.service';
import { EVENTS_SERVICE_NAME, AdmissionTypeResponse, AdmissionTypesResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { CreateAdmissionTypeRequestDto, RequestByIdDto, UpdateAdmissionTypeRequestDto } from 'rumor-utils/shared/events/dtos';

export class AdmissionTypeController {

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateAdmissionType')
  public async createAdmissionType(payload: CreateAdmissionTypeRequestDto): Promise<AdmissionTypeResponse> {
    return AdmissionTypeService.createAdmissionType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetAdmissionTypes')
  public async getAdmissionsTypes(): Promise<AdmissionTypesResponse> {
    return AdmissionTypeService.getAdmissionsTypes();
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetAdmissionType')
  public async getAdmissionTypeById(payload: RequestByIdDto): Promise<AdmissionTypeResponse> {
    return AdmissionTypeService.getAdmissionTypeById(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateAdmissionType')
  public async updateAdmissionType(payload: UpdateAdmissionTypeRequestDto): Promise<AdmissionTypeResponse> {
    return AdmissionTypeService.updateAdmissionType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteAdmissionType')
  public async deleteAdmissionType(payload: RequestByIdDto): Promise<AdmissionTypeResponse> {
    return AdmissionTypeService.deleteAdmissionType(payload);
  }
}
