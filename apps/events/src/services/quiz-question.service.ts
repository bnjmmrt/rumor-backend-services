// import { Inject, Injectable, Logger } from '@nestjs/common';
// import {
//   CreateQuizQuestionRequestDto,
//   GetUserQuizAnswersRequestDto,
//   SaveUserQuizAnswersRequestDto,
//   UpdateQuizQuestionRequestDto,
//   UpdateUserQuizAnswerRequestDto,
// } from '../dtos/quiz-question.dto';
// import { GenericResponse, GetUserQuizAnswersResponse, QuizQuestionResponse, QuizQuestionsResponse, SaveUserQuizAnswersResponse } from '../grpc/events/events.pb';
// import { InjectRepository } from '@nestjs/typeorm';
// import { QuizQuestion } from '../entities/quiz-question.entity';
// import { IsNull, Repository } from 'typeorm';
// import { responses } from '../common/responses';
// import { RequestByIdDto } from '../dtos/shared.dto';
// import { Event } from '../entities/event.entity';
// import { UserQuizAnswer } from '../entities/user-quiz-question-answer.entity';
// import { AuthClient } from 'rumor-utils/clients/auth.client';
// import { User } from 'apps/auth/src/entities/user.entity';

// @Injectable()
// export class QuizQuestionService {
//   private readonly logger = new Logger(QuizQuestionService.name);

//   @InjectRepository(Event)
//   private readonly eventRepository: Repository<Event>;

//   @InjectRepository(QuizQuestion)
//   private readonly quizQuestionRepository: Repository<QuizQuestion>;

//   @InjectRepository(UserQuizAnswer)
//   private readonly userQuizAnswerRepository: Repository<UserQuizAnswer>;

//   constructor(
//     @Inject(AuthClient)
//     private readonly authClient: AuthClient,
//   ) {}

//   public async createQuizQuestion(payload: CreateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
//     try {
//       const event: Event = await this.eventRepository.findOne({
//         where: {
//           id: payload.eventId,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!event) {
//         return responses.notFound('Event does not exists');
//       }

//       const quizQuestion = new QuizQuestion();
//       quizQuestion.question = payload.question;
//       quizQuestion.required = payload.required;
//       quizQuestion.order = payload.order;
//       quizQuestion.event = event;

//       const created = await this.quizQuestionRepository.save(quizQuestion);

//       return responses.data(created);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error creating quiz question');
//     }
//   }

//   public async getEventQuizQuestions(payload: RequestByIdDto): Promise<QuizQuestionsResponse> {
//     try {
//       const quizQuestions = await this.quizQuestionRepository.find({
//         where: {
//           event: { id: payload.id },
//           deletedAt: IsNull(),
//         },
//       });

//       return responses.data(quizQuestions);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting quiz questions');
//     }
//   }

//   public async updateQuizQuestion(payload: UpdateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
//     try {
//       const quizQuestion = await this.quizQuestionRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!quizQuestion) return responses.badRequest('Quiz question not found');

//       delete payload.id;
//       const updatedQuizQuestion = this.quizQuestionRepository.merge(quizQuestion, payload);

//       await updatedQuizQuestion.save();

//       return responses.data(updatedQuizQuestion);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating quiz question');
//     }
//   }

//   public async deleteQuizQuestion(payload: RequestByIdDto): Promise<QuizQuestionResponse> {
//     try {
//       const quizQuestion = await this.quizQuestionRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!quizQuestion) return responses.badRequest('Quiz question not found');

//       await quizQuestion.softRemove();

//       return responses.data(quizQuestion);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error deleting quiz question');
//     }
//   }

//   public async saveUserQuizAnswers(payload: SaveUserQuizAnswersRequestDto): Promise<SaveUserQuizAnswersResponse> {
//     try {
//       const user = await this.authClient.getCurrentMember(payload.userId, this.logger);
//       if (!user) return { data: [], ...responses.notFound('User not found') };

//       const partialUser: Partial<User> = { id: user.id };

//       const promises = payload.answers.map(async (item) => {
//         const [question, event] = await Promise.all([
//           this.quizQuestionRepository.findOne({
//             where: { id: item.questionId },
//           }),
//           this.eventRepository.findOne({
//             where: { id: item.eventId },
//           }),
//         ]);

//         if (event && question) {
//           let userAnswer = await this.userQuizAnswerRepository.findOne({
//             where: {
//               user: { id: user.id },
//               question: { id: question.id },
//               event: { id: event.id },
//             },
//           });

//           if (userAnswer) {
//             userAnswer.answer = item.answer;
//           } else {
//             userAnswer = new UserQuizAnswer();
//             userAnswer.answer = item.answer;
//             userAnswer.user = partialUser;
//             userAnswer.question = question;
//             userAnswer.event = event;
//           }

//           return this.userQuizAnswerRepository.save(userAnswer);
//         }
//       });

//       await Promise.all(promises);

//       const response = await this.userQuizAnswerRepository.find({
//         where: { deletedAt: null },
//         relations: { question: true, event: true, user: true },
//       });

//       return responses.data(
//         response.map((item) => ({
//           answer: item.answer,
//           questionId: item.question.id,
//           eventId: item.event.id,
//           id: item.id,
//         })),
//       );
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error saving quiz answers');
//     }
//   }

//   public async updateUserQuizAnswer(payload: UpdateUserQuizAnswerRequestDto): Promise<GenericResponse> {
//     try {
//       const update = await this.userQuizAnswerRepository.update({ id: payload.id }, { answer: payload.answer });
//       if (!update) return responses.notFound('Element not found');
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating quiz answers');
//     }
//   }

//   public async deleteUserQuizAnswer(payload: RequestByIdDto): Promise<GenericResponse> {
//     try {
//       const update = await this.userQuizAnswerRepository.update({ id: payload.id }, { deletedAt: new Date() });
//       if (!update) return responses.notFound('Element not found');
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error deleting quiz answers');
//     }
//   }

//   public async getUserQuizAnswers(payload: GetUserQuizAnswersRequestDto): Promise<GetUserQuizAnswersResponse> {
//     try {
//       const response = await this.userQuizAnswerRepository.find({
//         where: {
//           deletedAt: null,
//           event: {
//             id: payload.eventId,
//           },
//           user: {
//             id: payload.userId,
//           },
//         },
//         relations: { question: true, event: true, user: true },
//       });
//       return responses.data(
//         response.map((item) => {
//           return {
//             answer: item.answer,
//             questionId: item.question.id,
//             eventId: item.event.id,
//             id: item.id,
//           };
//         }),
//       );
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error saving quiz answers');
//     }
//   }
// }
