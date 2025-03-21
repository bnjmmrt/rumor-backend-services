import { CreateReferralCodeRequestDto, ReferredUserRequestDto, UpdateReferralCodeRequestDto } from "rumor-utils/shared/users/dtos/referral-code.dto";
import asyncWrapper from "../server/helpers/asyncWrapper";
import { CreateResponse, GetResponse } from "rumor-utils/success";
import { ReferralCodeService } from "../services/referral-code.service";
import { ReferralCodeData } from "rumor-utils/shared/events/grpc/platform/general.pb";
import { IdRequestDto, QueryParamRequestDto } from "rumor-utils/shared/users/dtos/platform.dto";

export class ReferralCodeController {
  public static createReferralCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CreateReferralCodeRequestDto = req.body;
      const response: ReferralCodeData =
      await ReferralCodeService.createReferralCode(payload);
      const createResponse = new CreateResponse(response, 'Referral code created successfully!');
      res.status(createResponse.statusCode).json(createResponse);
    }
  );

  public static getReferralCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const payload: IdRequestDto = { id };
      const response: ReferralCodeData =
        await ReferralCodeService.getReferralCode(payload);
      const getResponse = new GetResponse(response, 'Referral code retrieved successfully!');
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static getReferralCodes = asyncWrapper(
    async (req, res): Promise<void> => {
      const query = req.query;
      const payload: QueryParamRequestDto = { query };
      const response: ReferralCodeData[] =
        await ReferralCodeService.getReferralCodes(payload);
      const getResponse = new GetResponse(response, 'Referral codes retrieved successfully!');
      res.status(getResponse.statusCode).json(getResponse);
    }
  );

  public static updateReferralCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateReferralCodeRequestDto = req.body;
      const response: ReferralCodeData =
        await ReferralCodeService.updateReferralCode(payload);
      const updateResponse = new CreateResponse(response, 'Referral codes updated successfully!');
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static deactivateReferralCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const payload: IdRequestDto = { id };
      const response: ReferralCodeData =
        await ReferralCodeService.deactivateReferralCode(payload);
      const updateResponse = new CreateResponse(response, 'Referral code deactivated successfully!');
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static activateReferralCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const payload: IdRequestDto = { id };
      const response: ReferralCodeData =
      await ReferralCodeService.activateReferralCode(payload);
      const updateResponse = new CreateResponse(response, 'Referral code activated successfully!');
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static deleteReferralCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const {id} = req.params;
      const payload: IdRequestDto = {id};
      const response: ReferralCodeData =
        await ReferralCodeService.deleteReferralCode(payload);
      const updateResponse = new CreateResponse(response, 'Referral code deleted successfully!');
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );

  public static saveReferredUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ReferredUserRequestDto = req.body;
      const response: string = await ReferralCodeService.saveReferredUser(payload);
      const updateResponse = new CreateResponse(response, 'Referral code saved successfully!');
      res.status(updateResponse.statusCode).json(updateResponse);
    }
  );
}