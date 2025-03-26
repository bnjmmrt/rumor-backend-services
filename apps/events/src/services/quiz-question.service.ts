import {
  CreateQuizQuestionRequestDto,
  GetUserQuizAnswersRequestDto,
  SaveUserQuizAnswersRequestDto,
  UpdateQuizQuestionRequestDto,
  UpdateUserQuizAnswerRequestDto,
} from 'rumor-utils/shared/events/dtos/quiz-question.dto';
import {
  GenericResponse,
  GetUserQuizAnswersResponse,
  QuizQuestionResponse,
  QuizQuestionsResponse,
  SaveUserQuizAnswersResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';
import { QuizQuestion } from 'rumor-utils/shared/events//entities/quiz-question.entity';
import { IsNull } from 'typeorm';
import { responses } from '../common/responses';
import { RequestByIdDto } from 'rumor-utils/shared/events//dtos/shared.dto';
import { Event } from 'rumor-utils/shared/events//entities/event.entity';
import { UserQuizAnswer } from 'rumor-utils/shared/events//entities/user-quiz-question-answer.entity';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import database from '../database';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { QuizAnswer } from 'rumor-utils/shared/events/grpc/events/general.pb';
import { NotFoundError } from 'rumor-utils/errors';

export class QuizQuestionService {
  public static dbConnection = database;

  public static async createQuizQuestion(
    payload: CreateQuizQuestionRequestDto,
  ): Promise<QuizQuestionResponse> {
    const event: Event = await this.dbConnection.getRepository(Event).findOne({
      where: {
        id: payload.eventId,
        deletedAt: IsNull(),
      },
    });

    if (!event) {
      throw new NotFoundError('Event does not exists');
    }

    const quizQuestion = new QuizQuestion();
    quizQuestion.question = payload.question;
    quizQuestion.required = payload.required;
    quizQuestion.order = payload.order;
    quizQuestion.event = event;

    const created = await this.dbConnection.getRepository(QuizQuestion).save(quizQuestion);

    return responses.data(created);
  }

  public static async getEventQuizQuestions(payload: RequestByIdDto): Promise<QuizQuestion[]> {
    const quizQuestions = await this.dbConnection.getRepository(QuizQuestion).find({
      where: {
        event: { id: payload.id },
        deletedAt: IsNull(),
      },
    });
    return quizQuestions;
  }

  public static async updateQuizQuestion(
    payload: UpdateQuizQuestionRequestDto,
  ): Promise<QuizQuestionResponse> {
    const quizQuestion = await this.dbConnection.getRepository(QuizQuestion).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!quizQuestion) return responses.badRequest('Quiz question not found');

    delete payload.id;
    const updatedQuizQuestion = this.dbConnection
      .getRepository(QuizQuestion)
      .merge(quizQuestion, payload);

    await updatedQuizQuestion.save();

    return responses.data(updatedQuizQuestion);
  }

  public static async deleteQuizQuestion(payload: RequestByIdDto): Promise<QuizQuestionResponse> {
    const quizQuestion = await this.dbConnection.getRepository(QuizQuestion).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!quizQuestion) return responses.badRequest('Quiz question not found');

    await quizQuestion.softRemove();

    return responses.data(quizQuestion);
  }

  public static async saveUserQuizAnswers(
    payload: SaveUserQuizAnswersRequestDto,
  ): Promise<QuizAnswer[]> {
    /* TODO: commenting this since token is not there confirm with mobile team and update this function
     const user: any = await serviceMesh.userService().getCurrentMember();
     if (!user) throw new NotFoundError('User not found')
 
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
     });  */

    const promises = payload.answers.map(async item => {
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
            user: { id: payload.userId },
            question: { id: question.id },
            event: { id: event.id },
          },
        });

        if (userAnswer) {
          userAnswer.answer = item.answer;
        } else {
          userAnswer = new UserQuizAnswer();
          userAnswer.answer = item.answer;
          userAnswer.user = { id: payload.userId };
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

    return response.map(item => ({
      answer: item.answer,
      questionId: item.question.id,
      eventId: item.event.id,
      id: item.id,
    }));
  }

  public static async updateUserQuizAnswer(
    payload: UpdateUserQuizAnswerRequestDto,
  ): Promise<string> {
    const update = await this.dbConnection
      .getRepository(UserQuizAnswer)
      .update({ id: payload.id }, { answer: payload.answer });
    if (!update) throw new NotFoundError('Element not found');
    return '';
  }

  public static async deleteUserQuizAnswer(payload: RequestByIdDto): Promise<GenericResponse> {
    const update = await this.dbConnection
      .getRepository(UserQuizAnswer)
      .update({ id: payload.id }, { deletedAt: new Date() });
    if (!update) throw new NotFoundError('Element not found');
    return responses.ok;
  }

  public static async getUserQuizAnswers(
    payload: GetUserQuizAnswersRequestDto,
  ): Promise<QuizAnswer[]> {
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
    return response.map(item => {
      return {
        answer: item.answer,
        questionId: item.question.id,
        eventId: item.event.id,
        id: item.id,
      };
    });
  }
}
