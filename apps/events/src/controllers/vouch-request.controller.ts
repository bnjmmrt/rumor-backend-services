import { VouchRequestService } from '../services/vouch-request.service';
import { VouchRequestsResponse, PLATFORM_SERVICE_NAME, GenericResponse, GetUserVouchesResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { CreateVouchRequestDto, UpdateVouchRequestDto } from 'rumor-utils/shared/users/dtos/vouch-request.dto';
import {GetUserVouchRequestDto, IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { UpdateResponse, CreateResponse, GetResponse} from 'rumor-utils/success';

export class VouchRequestController {

public static createVouchRequest = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateVouchRequestDto = {
        requesterId: (req as any).user,
        ...req.body
      }
      const response: GenericResponse = await VouchRequestService.createVouchRequest(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getAllVouchRequests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = {
        id: (req as any).user
      }
      const response: VouchRequestsResponse = await VouchRequestService.getVouchRequests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static updateVouchRequest = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateVouchRequestDto = {
        userId: (req as any).user,
        id: req.params.id,
        ...req.body
      }
      const response: GenericResponse = await VouchRequestService.updateVouchRequest(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getUserVouches = asyncWrapper(
    async (req, res): Promise<void> => {
        const payload: IdRequestDto = {
            id: req.params.id
          }
      const response: GetUserVouchesResponse = await VouchRequestService.getUserVouches(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getUserVouchesByEvent = asyncWrapper(
    async (req, res): Promise<void> => {
        const payload: GetUserVouchRequestDto = {
            requesterId: req.params.id,
            eventId: req.params.eventId
          }
      const response: GetUserVouchesResponse = await VouchRequestService.getUserVouchesByEvent(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );
}
