import { TalentResponse, TalentsResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { TalentService } from '../services/talent.service';
import { CreateTalentRequestDto, RequestByIdDto, UpdateTalentRequestDto } from 'rumor-utils/shared/events/dtos';
import asyncWrapper from 'src/server/helpers/asyncWrapper';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'packages/rumor-utils/success';
import { Request, Response } from 'express'

export class TalentController {

  public static createTalent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateTalentRequestDto = req.body
    const talentResponse: TalentResponse = await TalentService.createTalent(
      payload
    );
    const successResponse = new CreateResponse(talentResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getAllTalent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const talentsResponse: TalentsResponse = await TalentService.getAllTalent(
    );
    const successResponse = new GetResponse(talentsResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getTalent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id }
    const talentResponse: TalentResponse = await TalentService.getTalent(
      payload
    );
    const successResponse = new GetResponse(talentResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static updateTalent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: UpdateTalentRequestDto = { id, ...req.body }
    const talentResponse: TalentResponse = await TalentService.updateTalent(
      payload
    );
    const successResponse = new UpdateResponse(talentResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static deleteTalent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id }
    const talentResponse: TalentResponse = await TalentService.deleteTalent(
      payload
    );
    const successResponse = new DeleteResponse(talentResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
