import { CollaboratorService } from '../services/collaborator.service';
import { CollaboratorResponse, EVENTS_SERVICE_NAME, CollaboratorsResponse, GetDefaultRoleConfigByRoleResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { CreateCollaboratorDto, RequestByIdDto, UpdateCollaboratorDto } from 'rumor-utils/shared/events/dtos';
import { GetDefaultRoleConfigByRoleRequestDto } from 'rumor-utils/shared/events/dtos/collaborator.dto';
import { CreateResponse, GetResponse } from 'rumor-utils/success';
import { DataRoleDefault } from 'rumor-utils/shared/events/grpc/events/general.pb';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { Request, Response } from 'express'
export class CollaboratorController {
  // constructor(private readonly collaboratorService: CollaboratorService) {}

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateCollaborator')
  public async createCollaborator(payload: CreateCollaboratorDto): Promise<CollaboratorResponse> {
    return CollaboratorService.createCollaborator(payload);
  }

  //  public static createCollaborator = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  //     // const { id } = req.params;
  //     const payload: CreateCollaboratorDto = req.body
  //     const ageLimitResponse: CollaboratorResponse = await CollaboratorService.createCollaborator(
  //       payload
  //     );
  //     const successResponse = new CreateResponse(ageLimitResponse);
  //     res.status(successResponse.statusCode).json(successResponse);
  //   }
  //   )

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateCollaborator')
  public async updateCollaborator(payload: UpdateCollaboratorDto): Promise<CollaboratorResponse> {
    return CollaboratorService.updateCollaborator(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteCollaborator')
  public async deleteCollaborator(payload: RequestByIdDto): Promise<CollaboratorResponse> {
    return CollaboratorService.deleteCollaborator(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetCollaborator')
  public async getCollaborator(payload: RequestByIdDto): Promise<CollaboratorResponse> {
    return CollaboratorService.getCollaborator(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetCollaborators')
  public async getCollaborators(payload: RequestByIdDto): Promise<CollaboratorsResponse> {
    return CollaboratorService.getCollaborators(payload);
  }

  public static getDefaultRoleConfigByRole = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: GetDefaultRoleConfigByRoleRequestDto = req.query
    const response: DataRoleDefault = await CollaboratorService.getDefaultRoleConfigByRole(
      payload
    );
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
