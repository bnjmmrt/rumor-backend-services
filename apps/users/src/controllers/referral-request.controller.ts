import { CreateResponse } from "rumor-utils/success";
import { GenericResponse } from "rumor-utils/shared/events/grpc/events/events.pb";
import {
  CreateReferralRequestDto,
  UpdateReferralRequestDto,
} from "rumor-utils/shared/users/dtos/referral-request.dto";
import asyncWrapper from "../server/helpers/asyncWrapper";
import { ReferralRequestService } from "../services/referral-request.service";
import { IdRequestDto } from "rumor-utils/shared/users/dtos/platform.dto";
import {
  GetSentReferralRequestsResponse,
  ReferralRequestsResponse,
} from "rumor-utils/shared/events/grpc/platform/platform.pb";

export class ReferralRequestController {
  public static createReferralRequest = asyncWrapper(
    async (req, res): Promise<void> => {
      const requesterId = (req as any).user;
      const payload: CreateReferralRequestDto = {
        ...req.body,
        requesterId,
      };
      const response: GenericResponse =
        await ReferralRequestService.createReferralRequest(payload);
      const updateResponse = new CreateResponse(response);
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static getAllReferralRequests = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).user;
      const payload: IdRequestDto = { id };
      const response: ReferralRequestsResponse =
        await ReferralRequestService.getReferralRequests(payload);
      const updateResponse = new CreateResponse(response);
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static updateReferralRequest = asyncWrapper(
    async (req, res): Promise<void> => {
      const userId = (req as any).user;
      const { id } = req.params;
      const payload: UpdateReferralRequestDto = {
        ...req.body,
        userId,
        id,
      };
      const response: GenericResponse =
        await ReferralRequestService.updateReferralRequest(payload);
      const updateResponse = new CreateResponse(response);
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static getSentReferralRequests = asyncWrapper(
    async (req, res): Promise<void> => {
      const id = (req as any).user;
      const payload: IdRequestDto = { id };
      const response: GetSentReferralRequestsResponse =
        await ReferralRequestService.getSentReferralRequests(payload);
      const updateResponse = new CreateResponse(response);
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );
}
