import { QuizQuestionService } from '../services/quiz-question.service';
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
import { RequestByIdDto } from 'rumor-utils/shared/events/dtos/shared.dto';

export class QuizQuestionController {

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateQuizQuestion')
  public async createQuizQuestion(payload: CreateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
    return QuizQuestionService.createQuizQuestion(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateQuizQuestion')
  public async updateQuizQuestion(payload: UpdateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
    return QuizQuestionService.updateQuizQuestion(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteQuizQuestion')
  public async deleteQuizQuestion(payload: RequestByIdDto): Promise<QuizQuestionResponse> {
    return QuizQuestionService.deleteQuizQuestion(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventQuizQuestions')
  public async getEventQuizQuestions(payload: RequestByIdDto): Promise<QuizQuestionsResponse> {
    return QuizQuestionService.getEventQuizQuestions(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'SaveUserQuizAnswers')
  public async saveUserQuizAnswers(payload: SaveUserQuizAnswersRequestDto): Promise<SaveUserQuizAnswersResponse> {
    return QuizQuestionService.saveUserQuizAnswers(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateUserQuizAnswer')
  public async updateUserQuizAnswer(payload: UpdateUserQuizAnswerRequestDto): Promise<GenericResponse> {
    return QuizQuestionService.updateUserQuizAnswer(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteUserQuizAnswer')
  public async deleteUserQuizAnswer(payload: RequestByIdDto): Promise<GenericResponse> {
    return QuizQuestionService.deleteUserQuizAnswer(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetUserQuizAnswers')
  public async getUserQuizAnswers(payload: GetUserQuizAnswersRequestDto): Promise<GetUserQuizAnswersResponse> {
    return QuizQuestionService.getUserQuizAnswers(payload);
  }
}
