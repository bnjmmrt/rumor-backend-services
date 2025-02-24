import {
  CreateQuizQuestionRequestDto,
  GetUserQuizAnswersRequestDto,
  SaveUserQuizAnswersRequestDto,
  UpdateQuizQuestionRequestDto,
  UpdateUserQuizAnswerRequestDto,
} from 'rumor-utils/shared/events/dtos/quiz-question.dto';
import { GenericResponse, GetUserQuizAnswersResponse, QuizQuestionResponse, QuizQuestionsResponse, SaveUserQuizAnswersResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { QuizQuestion } from 'rumor-utils/shared/events//entities/quiz-question.entity';
import { IsNull } from 'typeorm';
import { responses } from '../common/responses';
import { RequestByIdDto } from 'rumor-utils/shared/events//dtos/shared.dto';
import { Event } from 'rumor-utils/shared/events//entities/event.entity';
import { UserQuizAnswer } from 'rumor-utils/shared/events//entities/user-quiz-question-answer.entity';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import database from '../database';
import * as serviceMesh from 'rumor-utils/service-mesh';
import config from 'src/config';

export class QuizQuestionService {
  public static dbConnection = database;

  public static async createQuizQuestion(payload: CreateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
    try {
      const event: Event = await this.dbConnection.getRepository(Event).findOne({
        where: {
          id: payload.eventId,
          deletedAt: IsNull(),
        },
      });

      if (!event) {
        return responses.notFound('Event does not exists');
      }

      const quizQuestion = new QuizQuestion();
      quizQuestion.question = payload.question;
      quizQuestion.required = payload.required;
      quizQuestion.order = payload.order;
      quizQuestion.event = event;

      const created = await this.dbConnection.getRepository(QuizQuestion).save(quizQuestion);

      return responses.data(created);
    } catch (err) {
      return responses.badRequest('Error creating quiz question');
    }
  }

  public static async getEventQuizQuestions(payload: RequestByIdDto): Promise<QuizQuestionsResponse> {
    try {
      const quizQuestions = await this.dbConnection.getRepository(QuizQuestion).find({
        where: {
          event: { id: payload.id },
          deletedAt: IsNull(),
        },
      });

      return responses.data(quizQuestions);
    } catch (err) {
      return responses.badRequest('Error getting quiz questions');
    }
  }

  public static async updateQuizQuestion(payload: UpdateQuizQuestionRequestDto): Promise<QuizQuestionResponse> {
    try {
      const quizQuestion = await this.dbConnection.getRepository(QuizQuestion).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!quizQuestion) return responses.badRequest('Quiz question not found');

      delete payload.id;
      const updatedQuizQuestion = this.dbConnection.getRepository(QuizQuestion).merge(quizQuestion, payload);

      await updatedQuizQuestion.save();

      return responses.data(updatedQuizQuestion);
    } catch (err) {
      return responses.badRequest('Error updating quiz question');
    }
  }

  public static async deleteQuizQuestion(payload: RequestByIdDto): Promise<QuizQuestionResponse> {
    try {
      const quizQuestion = await this.dbConnection.getRepository(QuizQuestion).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!quizQuestion) return responses.badRequest('Quiz question not found');

      await quizQuestion.softRemove();

      return responses.data(quizQuestion);
    } catch (err) {
      return responses.badRequest('Error deleting quiz question');
    }
  }

  public static async saveUserQuizAnswers(payload: SaveUserQuizAnswersRequestDto): Promise<SaveUserQuizAnswersResponse> {
    try {
      const user = await serviceMesh.getCurrentMember(config.get('API_BASE_URL'),payload.userId);
      if (!user) return { data: [], ...responses.notFound('User not found') };

      const partialUser: Partial<User> = { id: user.id };

      const promises = payload.answers.map(async (item) => {
        const [question, event] = await Promise.all([
          this.dbConnection.getRepository(QuizQuestion).findOne({
            where: { id: item.questionId },
          }),
          this.dbConnection.getRepository(Event).findOne({
            where: { id: item.eventId },
          }),
        ]);

        if (event && question) {
          let userAnswer = await this.dbConnection.getRepository(UserQuizAnswer).findOne({
            where: {
              user: { id: user.id },
              question: { id: question.id },
              event: { id: event.id },
            },
          });

          if (userAnswer) {
            userAnswer.answer = item.answer;
          } else {
            userAnswer = new UserQuizAnswer();
            userAnswer.answer = item.answer;
            userAnswer.user = partialUser;
            userAnswer.question = question;
            userAnswer.event = event;
          }

          return this.dbConnection.getRepository(UserQuizAnswer).save(userAnswer);
        }
      });

      await Promise.all(promises);

      const response = await this.dbConnection.getRepository(UserQuizAnswer).find({
        where: { deletedAt: null },
        relations: { question: true, event: true, user: true },
      });

      return responses.data(
        response.map((item) => ({
          answer: item.answer,
          questionId: item.question.id,
          eventId: item.event.id,
          id: item.id,
        })),
      );
    } catch (err) {
      return responses.badRequest('Error saving quiz answers');
    }
  }

  public static async updateUserQuizAnswer(payload: UpdateUserQuizAnswerRequestDto): Promise<GenericResponse> {
    try {
      const update = await this.dbConnection.getRepository(UserQuizAnswer).update({ id: payload.id }, { answer: payload.answer });
      if (!update) return responses.notFound('Element not found');
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error updating quiz answers');
    }
  }

  public static async deleteUserQuizAnswer(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      const update = await this.dbConnection.getRepository(UserQuizAnswer).update({ id: payload.id }, { deletedAt: new Date() });
      if (!update) return responses.notFound('Element not found');
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error deleting quiz answers');
    }
  }

  public static async getUserQuizAnswers(payload: GetUserQuizAnswersRequestDto): Promise<GetUserQuizAnswersResponse> {
    try {
      const response = await this.dbConnection.getRepository(UserQuizAnswer).find({
        where: {
          deletedAt: null,
          event: {
            id: payload.eventId,
          },
          user: {
            id: payload.userId,
          },
        },
        relations: { question: true, event: true, user: true },
      });
      return responses.data(
        response.map((item) => {
          return {
            answer: item.answer,
            questionId: item.question.id,
            eventId: item.event.id,
            id: item.id,
          };
        }),
      );
    } catch (err) {
      return responses.badRequest('Error saving quiz answers');
    }
  }
}
