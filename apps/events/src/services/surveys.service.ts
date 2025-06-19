import { StatusCodes } from 'http-status-codes';
import { JWT as GoogleAuthJWT } from 'google-auth-library';

import {
  DataSource,
} from 'typeorm';
import {
  User,
} from '../../packages/rumor-utils/shared/entities';
import { Survey } from '../../packages/rumor-utils/shared/events/entities';
import {
  CreateSurveyResponse,
  SurveyListResponse,
  UpdateSurveyRequestDto,
} from '../interfaces/survey.interface';
import { GoogleAddressClient } from '../utils/google';
import database from '../database';

import { CreateSurveyRequestDto } from '../interfaces/survey.interface';
import { SurveyResponses } from '../../packages/rumor-utils/shared/events/entities'
import { SurveyResponseDto } from 'packages/rumor-utils/shared/events/dtos/survey-response.dto';




export class SurveysService {
    public static dbConnection = database;
    public static googleAddressClient = new GoogleAddressClient();
  
    public static googleAuthClient = new GoogleAuthJWT();
    public static dataSource: DataSource;

    public static async createSurvey(payload: CreateSurveyRequestDto): Promise<CreateSurveyResponse> {
    const survey = await this.dbConnection.getRepository(Survey).create(payload);
    const savedSurvey = await this.dbConnection.getRepository(Survey).save(survey);
    return {
      id: savedSurvey.id,
      title: savedSurvey.title,
      message: savedSurvey.message,
      imageUrl: savedSurvey.imageUrl,
      eventStartDate: savedSurvey.eventStartDate,
      eventEndDate: savedSurvey.eventEndDate,
      surveyStartDate: savedSurvey.surveyStartDate,
      surveyEndDate: savedSurvey.surveyEndDate,
      status: savedSurvey.status,
    };
  }

  public static async listSurveys(): Promise<SurveyListResponse> {
    const surveys = await this.dbConnection.getRepository(Survey).find();
    //Add responses count to each survey as well as whether it's upcoming, live, or past
    const surveysWithResponses = await Promise.all(
      surveys.map(async survey => {
        const responses = await this.dbConnection
          .getRepository(SurveyResponses)
          .count({ where: { survey: { id: survey.id } } });
        return { ...survey, responses };
      }),
    );
    //Add whether it's upcoming, live, or past
    const surveysWithStatus = surveysWithResponses.map(survey => {
      const now = new Date();
      if (survey.surveyStartDate > now) {
        return { ...survey, status: 'upcoming' };
      }
      if (survey.surveyStartDate <= now && survey.surveyEndDate >= now) {
        return { ...survey, status: 'live' };
      }
      return { ...survey, status: 'past' };
    });
    return {
      past: surveysWithStatus.filter(survey => survey.status === 'past'),
      live: surveysWithStatus.filter(survey => survey.status === 'live'),
      upcoming: surveysWithStatus.filter(survey => survey.status === 'upcoming'),
    };
  }

  public static async getSurveyById(id: string): Promise<Survey> {
    const qb = this.dbConnection
      .getRepository(Survey)
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.responses', 'response')
      .leftJoinAndSelect('response.user', 'user') // <-- this line loads user info
      .where('survey.id = :id', { id });

    console.log(await qb.getSql());

    const survey = await qb.getOne();
    console.log(survey);

    return survey;
  }

  public static async getSurveyResponders(id: string): Promise<Survey> {
    const survey = await this.dbConnection.getRepository(Survey).findOne({ where: { id } });
    return survey;
  }


  public static async updateSurveyById(
    id: string,
    payload: UpdateSurveyRequestDto,
  ): Promise<Survey> {
    await this.dbConnection.getRepository(Survey).update(id, payload);
    return this.getSurveyById(id);
  }

  public static async getMostRecentSurvey(userId: string): Promise<Survey | null> {
    // Get current date
    const now = new Date();

    // Query to find the most recent live survey that the user hasn't responded to
    const survey = await this.dbConnection
      .getRepository(Survey)
      .createQueryBuilder('survey')
      // Only get surveys that are currently live
      .where('survey.surveyStartDate <= :now', { now })
      .andWhere('survey.surveyEndDate >= :now', { now })
      // Exclude surveys that the user has already responded to
      .andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('response.survey_id')
          .from(SurveyResponses, 'response')
          .where('response.user_id = :userId', { userId })
          .getQuery();
        return 'survey.id NOT IN ' + subQuery;
      })
      // Get the most recent one first
      .orderBy('survey.createdAt', 'DESC')
      // We only need one result
      .getOne();
    console.log('CHOI');
    console.log(survey);

    return survey;
  }

  public static async respondToSurvey(id: string, payload: SurveyResponseDto): Promise<Survey> {
    // First, fetch the Survey entity using the id
    const survey = await this.dbConnection.getRepository(Survey).findOne({
      where: { id: id },
    });

    if (!survey) {
      throw new Error(`Survey with id ${id} not found`);
    }

    // Then, fetch the User entity using the userId from payload
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error(`User with id ${payload.userId} not found`);
    }

    // Now create the SurveyResponses entity with the correct relations
    const surveyResponse = this.dbConnection.getRepository(SurveyResponses).create({
      response: payload.response,
      respondedAt: new Date(payload.respondedAt),
      survey: survey,
      user: user,
    });

    const resp = await this.dbConnection.getRepository(SurveyResponses).save(surveyResponse);
    console.log('resp', resp);

    return this.getSurveyById(id);
  }

  public static async getSurveyPage(userId: string): Promise<any[]> {
    // Get current date for checking live surveys
    const now = new Date();

    // Fetch live surveys with pagination
    const surveys = await this.dbConnection
      .getRepository(Survey)
      .createQueryBuilder('survey')
      .where('survey.surveyStartDate <= :now', { now })
      .andWhere('survey.surveyEndDate >= :now', { now })
      .orderBy('survey.createdAt', 'DESC')
      .getMany();

    // Fetch this user's responses for these surveys
    const surveyIds = surveys.map(survey => survey.id);

    // Get all responses for these surveys by this user
    const responses = await this.dbConnection
      .getRepository(SurveyResponses)
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.survey', 'survey') // Add this line to load the survey relation
      .where('survey.id IN (:...surveyIds)', { surveyIds })
      .andWhere('response.user.id = :userId', { userId })
      .getMany();

    // Create a map of survey ID to response for quick lookup
    const responseMap = new Map();
    responses.forEach(response => {
      responseMap.set(response.survey.id, response);
    });

    // Combine surveys with their responses
    const surveysWithResponses = surveys.map(survey => {
      const userResponse = responseMap.get(survey.id) || null;
      return {
        ...survey,
        userResponse: userResponse,
        hasResponded: !!userResponse,
      };
    });

    return surveysWithResponses;
  }

  public static async updateSurveyResponse(
    id: string,
    payload: SurveyResponseDto,
  ): Promise<Survey> {
    // First, fetch the existing SurveyResponse entity
    const existingResponse = await this.dbConnection.getRepository(SurveyResponses).findOne({
      where: { id },
    });

    if (!existingResponse) {
      throw new Error(`Survey response with id ${id} not found`);
    }

    // Fetch the Survey entity using surveyId from payload
    const survey = await this.dbConnection.getRepository(Survey).findOne({
      where: { id: payload.surveyId },
    });

    if (!survey) {
      throw new Error(`Survey with id ${payload.surveyId} not found`);
    }

    // Fetch the User entity using userId from payload
    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error(`User with id ${payload.userId} not found`);
    }

    // Update the SurveyResponses entity with relations
    await this.dbConnection.getRepository(SurveyResponses).update(id, {
      response: payload.response,
      respondedAt: new Date(), // Use current date for update
      survey: survey,
      user: user,
    });

    return this.getSurveyById(payload.surveyId);
  }
}