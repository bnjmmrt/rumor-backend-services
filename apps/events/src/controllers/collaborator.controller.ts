// import { Controller } from '@nestjs/common';
// import { CollaboratorService } from '../services/collaborator.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { CollaboratorResponse, EVENTS_SERVICE_NAME, CollaboratorsResponse, GetDefaultRoleConfigByRoleResponse } from '../grpc/events/events.pb';
// import { CreateCollaboratorDto, RequestByIdDto, UpdateCollaboratorDto } from '../dtos';
// import { GetDefaultRoleConfigByRoleRequestDto } from '../dtos/collaborator.dto';

// @Controller('collaborator')
// export class CollaboratorController {
//   constructor(private readonly collaboratorService: CollaboratorService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateCollaborator')
//   public async createCollaborator(payload: CreateCollaboratorDto): Promise<CollaboratorResponse> {
//     return this.collaboratorService.createCollaborator(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateCollaborator')
//   public async updateCollaborator(payload: UpdateCollaboratorDto): Promise<CollaboratorResponse> {
//     return this.collaboratorService.updateCollaborator(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteCollaborator')
//   public async deleteCollaborator(payload: RequestByIdDto): Promise<CollaboratorResponse> {
//     return this.collaboratorService.deleteCollaborator(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetCollaborator')
//   public async getCollaborator(payload: RequestByIdDto): Promise<CollaboratorResponse> {
//     return this.collaboratorService.getCollaborator(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetCollaborators')
//   public async getCollaborators(payload: RequestByIdDto): Promise<CollaboratorsResponse> {
//     return this.collaboratorService.getCollaborators(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetDefaultRoleConfigByRole')
//   public async getDefaultRoleConfigByRole(payload: GetDefaultRoleConfigByRoleRequestDto): Promise<GetDefaultRoleConfigByRoleResponse> {
//     return this.collaboratorService.getDefaultRoleConfigByRole(payload);
//   }
// }
