import { FocusResponse, GenericResponse, InterestResponse, InterestsResponse } from "rumor-utils/shared/events/grpc/platform/platform.pb";
import { ForgotPasswordRequestDto } from "rumor-utils/shared/users/dtos/auth.dto";
import { CreateResponse, GetResponse } from "rumor-utils/success";
import asyncWrapper from "../server/helpers/asyncWrapper";
import { AuthService } from "../services/auth.service";
import { PlatformService } from "../services/platform.service";
import { AddFocusRequestDto, CreateInterestRequestDto, EditFocusNameRequestDto, IdRequestDto, SaveFocusesForUserRequestoDto, SaveInterestsForUserRequestDto, UpdateInterestRequestDto } from "rumor-utils/shared/users/dtos/platform.dto";

export class PlatformController {

    public static getFocuses = asyncWrapper(
        async (req, res): Promise<void> => {
            const response: FocusResponse = await PlatformService.getFocuses();
            const getResponse = new GetResponse(response);
            res.status(getResponse.statusCode).json(getResponse);
        }
    );

    public static getUserFocuses = asyncWrapper(
        async (req, res): Promise<void> => {
            const {id} = req.params
            const payload: IdRequestDto = {id};
            const response: FocusResponse = await PlatformService.getUserFocuses(payload);
            const getResponse = new GetResponse(response);
            res.status(getResponse.statusCode).json(getResponse);
        }
    );

    public static addFocus = asyncWrapper(
        async (req, res): Promise<void> => {
            const payload: AddFocusRequestDto = req.body;
            const response: GenericResponse = await PlatformService.addFocus(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static editFocusName = asyncWrapper(
        async (req, res): Promise<void> => {
            const payload: EditFocusNameRequestDto = req.body;
            const response: GenericResponse = await PlatformService.editFocusName(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static saveFocusesForUser = asyncWrapper(
        async (req, res): Promise<void> => {
            const { userId } = req.params
            const payload: SaveFocusesForUserRequestoDto = { ...req.body, userId };
            const response: GenericResponse = await PlatformService.saveFocusesForUser(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static createInterest = asyncWrapper(
        async (req, res): Promise<void> => {
            const payload: CreateInterestRequestDto = req.body;
            const response: GenericResponse = await PlatformService.createInterest(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static listInterests = asyncWrapper(
        async (req, res): Promise<void> => {
            const response: GenericResponse = await PlatformService.listInterests();
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static getUserInterests = asyncWrapper(
        async (req, res): Promise<void> => {
            const { id } = req.params
            const payload: IdRequestDto = { id };
            const response: InterestsResponse = await PlatformService.getUserInterests(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static saveInterestsForUser = asyncWrapper(
        async (req, res): Promise<void> => {
            const payload: SaveInterestsForUserRequestDto = req.body;
            const response: GenericResponse = await PlatformService.saveInterestsForUser(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static updateInterest = asyncWrapper(
        async (req, res): Promise<void> => {
            const payload: UpdateInterestRequestDto = req.body;
            const response: InterestResponse = await PlatformService.updateInterest(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );

    public static deleteInterest = asyncWrapper(
        async (req, res): Promise<void> => {
            const payload: IdRequestDto = req.body;
            const response: GenericResponse = await PlatformService.deleteInterest(payload);
            const createResponse = new CreateResponse(response);
            res.status(createResponse.statusCode).json(createResponse);
        }
    );
}