import { SurveysService } from '../services/surveys.service';
import { Request, Response } from 'express';

import {
  CreateResponse,
  GetResponse,
  UpdateResponse,
} from '../../packages/rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';

import {
  CreateSurveyRequestDto,
  UpdateSurveyRequestDto,
} from 'src/interfaces/survey.interface';
import { SurveyResponseDto } from 'packages/rumor-utils/shared/events/dtos/survey-response.dto';

export class SurveysController {        
  public static createSurvey = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateSurveyRequestDto = req.body;
    const response = await SurveysService.createSurvey(payload);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listSurveys = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const response = await SurveysService.listSurveys();
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getSurveyById = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const response = await SurveysService.getSurveyById(id);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static updateSurveyById = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const payload: UpdateSurveyRequestDto = req.body;
      const response = await SurveysService.updateSurveyById(id, payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static getSurveyResponders = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const response = await SurveysService.getSurveyResponders(id);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static getMostRecentSurvey = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const response = await SurveysService.getMostRecentSurvey(userId);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static respondToSurvey = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const payload: SurveyResponseDto = req.body;

      payload.respondedAt = new Date().toISOString();
      const response = await SurveysService.respondToSurvey(id, payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static getSurveyPage = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const userId = req.query.userId as string;

    const response = await SurveysService.getSurveyPage(userId);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static updateSurveyResponse = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const payload: SurveyResponseDto = req.body;
      const response = await SurveysService.updateSurveyResponse(id, payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );
}