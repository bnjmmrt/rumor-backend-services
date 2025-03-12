import { AdmissionTypeService } from '../services/admission-type.service';
import { EVENTS_SERVICE_NAME, AdmissionTypeResponse, AdmissionTypesResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { CreateAdmissionTypeRequestDto, RequestByIdDto, UpdateAdmissionTypeRequestDto } from 'rumor-utils/shared/events/dtos';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { AdmissionType } from 'rumor-utils/shared/entities';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import { Request, Response } from 'express'
export class AdmissionTypeController {

  public static createAdmissionType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateAdmissionTypeRequestDto = req.body
    const response: AdmissionType = await AdmissionTypeService.createAdmissionType(payload);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getAdmissionsTypes = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const response: AdmissionType[] = await AdmissionTypeService.getAdmissionsTypes();
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getAdmissionTypeById = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id: id }
    const response: AdmissionType = await AdmissionTypeService.getAdmissionTypeById(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static updateAdmissionType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: UpdateAdmissionTypeRequestDto = { id: id, ...req.body }
    const response: AdmissionType = await AdmissionTypeService.updateAdmissionType(payload);
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static deleteAdmissionType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id: id, ...req.body }
    const response: AdmissionType = await AdmissionTypeService.deleteAdmissionType(payload);
    const successResponse = new DeleteResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
