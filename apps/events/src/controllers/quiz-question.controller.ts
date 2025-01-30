// import { Controller } from '@nestjs/common';
// import { QuizQuestionService } from '../services/quiz-question.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import {
//   EVENTS_SERVICE_NAME,
//   GenericResponse,
//   GetUserQuizAnswersResponse,
//   QuizQuestionResponse,
//   QuizQuestionsResponse,
//   SaveUserQuizAnswersResponse,
// } from '../grpc/events/events.pb';
// import {
//   CreateQuizQuestionRequestDto,
//   GetUserQuizAnswersRequestDto,
//   SaveUserQuizAnswersRequestDto,
//   UpdateQuizQuestionRequestDto,
//   UpdateUserQuizAnswerRequestDto,
// } from '../dtos/quiz-question.dto';
// import { RequestByIdDto } from '../dtos/shared.dto';

// @Controller()
// export class QuizQuestionController {
//   constructor(private readonly eventsService: QuizQuestionService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateQuizQuestion')
//   public async createQuizQuestion(payload: CreateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
//     return this.eventsService.createQuizQuestion(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateQuizQuestion')
//   public async updateQuizQuestion(payload: UpdateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
//     return this.eventsService.updateQuizQuestion(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteQuizQuestion')
//   public async deleteQuizQuestion(payload: RequestByIdDto): Promise<QuizQuestionResponse> {
//     return this.eventsService.deleteQuizQuestion(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventQuizQuestions')
//   public async getEventQuizQuestions(payload: RequestByIdDto): Promise<QuizQuestionsResponse> {
//     return this.eventsService.getEventQuizQuestions(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'SaveUserQuizAnswers')
//   public async saveUserQuizAnswers(payload: SaveUserQuizAnswersRequestDto): Promise<SaveUserQuizAnswersResponse> {
//     return this.eventsService.saveUserQuizAnswers(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateUserQuizAnswer')
//   public async updateUserQuizAnswer(payload: UpdateUserQuizAnswerRequestDto): Promise<GenericResponse> {
//     return this.eventsService.updateUserQuizAnswer(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteUserQuizAnswer')
//   public async deleteUserQuizAnswer(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.eventsService.deleteUserQuizAnswer(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetUserQuizAnswers')
//   public async getUserQuizAnswers(payload: GetUserQuizAnswersRequestDto): Promise<GetUserQuizAnswersResponse> {
//     return this.eventsService.getUserQuizAnswers(payload);
//   }
// }
