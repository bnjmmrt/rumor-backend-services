import { QuizQuestionService } from '../services/quiz-question.service';
import { Request, Response } from 'express'
import {
  GenericResponse,
  GetUserQuizAnswersResponse,
  QuizQuestionResponse,
  QuizQuestionsResponse,
  SaveUserQuizAnswersResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';
import {
  CreateQuizQuestionRequestDto,
  GetUserQuizAnswersRequestDto,
  SaveUserQuizAnswersRequestDto,
  UpdateQuizQuestionRequestDto,
  UpdateUserQuizAnswerRequestDto,
} from 'rumor-utils/shared/events/dtos/quiz-question.dto';

import { UserAndIdRequestDto, RequestByIdDto } from 'rumor-utils/shared/events/dtos/shared.dto';
import { CreateResponse, GetResponse, UpdateResponse, DeleteResponse } from '../../packages/rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class QuizQuestionController {

  public static createQuizQuestion = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateQuizQuestionRequestDto = req.body;
    const quizResponse: QuizQuestionResponse = await QuizQuestionService.createQuizQuestion(payload);
    const successResponse = new CreateResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static updateQuizQuestion = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: UpdateQuizQuestionRequestDto = { ...req.body, ...req.params }
    const quizResponse: QuizQuestionResponse = await QuizQuestionService.updateQuizQuestion(payload);
    const successResponse = new UpdateResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static deleteQuizQuestion = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const quizResponse: QuizQuestionResponse = await QuizQuestionService.deleteQuizQuestion(payload);
    const successResponse = new DeleteResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getEventQuizQuestions = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const quizResponse: QuizQuestionsResponse = await QuizQuestionService.getEventQuizQuestions(payload);
    const successResponse = new GetResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static saveUserQuizAnswers = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: SaveUserQuizAnswersRequestDto = req.body
    const quizResponse: SaveUserQuizAnswersResponse = await QuizQuestionService.saveUserQuizAnswers(payload);
    const successResponse = new CreateResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static updateUserQuizAnswer = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: UpdateUserQuizAnswerRequestDto = { ...req.body, id }
    const quizResponse: GenericResponse = await QuizQuestionService.updateUserQuizAnswer(payload);
    const successResponse = new UpdateResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );


  public static deleteUserQuizAnswer = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const quizResponse: GenericResponse = await QuizQuestionService.deleteUserQuizAnswer(payload);
    const successResponse = new DeleteResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getUserQuizAnswers = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;
    const payload: GetUserQuizAnswersRequestDto = { eventId, userId }
    const quizResponse: GetUserQuizAnswersResponse = await QuizQuestionService.getUserQuizAnswers(payload);
    const successResponse = new GetResponse(quizResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
