// import { Controller } from '@nestjs/common';
// import { AdmissionTypeService } from '../services/admission-type.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { EVENTS_SERVICE_NAME, AdmissionTypeResponse, AdmissionTypesResponse } from '../grpc/events/events.pb';
// import { CreateAdmissionTypeRequestDto, RequestByIdDto, UpdateAdmissionTypeRequestDto } from '../dtos';

// @Controller()
// export class AdmissionTypeController {
//   constructor(private readonly admissionTypeService: AdmissionTypeService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateAdmissionType')
//   public async createAdmissionType(payload: CreateAdmissionTypeRequestDto): Promise<AdmissionTypeResponse> {
//     return this.admissionTypeService.createAdmissionType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetAdmissionTypes')
//   public async getAdmissionsTypes(): Promise<AdmissionTypesResponse> {
//     return this.admissionTypeService.getAdmissionsTypes();
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetAdmissionType')
//   public async getAdmissionTypeById(payload: RequestByIdDto): Promise<AdmissionTypeResponse> {
//     return this.admissionTypeService.getAdmissionTypeById(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateAdmissionType')
//   public async updateAdmissionType(payload: UpdateAdmissionTypeRequestDto): Promise<AdmissionTypeResponse> {
//     return this.admissionTypeService.updateAdmissionType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteAdmissionType')
//   public async deleteAdmissionType(payload: RequestByIdDto): Promise<AdmissionTypeResponse> {
//     return this.admissionTypeService.deleteAdmissionType(payload);
//   }
// }
