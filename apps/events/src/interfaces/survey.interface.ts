import { Survey } from "packages/rumor-utils/shared/events/entities/survey.entity";

export interface CreateSurveyRequestDto {
    title: string;
    message: string;
    imageUrl: string;
    eventStartDate: Date;
    eventEndDate: Date;
    surveyStartDate: Date;
    surveyEndDate: Date;
    status: string;
  }
  

  export interface CreateSurveyResponse {
    id: string;
    title: string;
    message: string;
    imageUrl: string;
    eventStartDate: Date;
    eventEndDate: Date;
    surveyStartDate: Date;
    surveyEndDate: Date;
    status: string; 
  }

  export interface SurveyListResponse {
    past: SurveyResponse[];
    live: SurveyResponse[];
    upcoming: SurveyResponse[];
  }

  export interface SurveyResponse {
    id: string;
    title: string;
    imageUrl: string;
    eventStartDate: Date;
    eventEndDate: Date;
    surveyStartDate: Date;
    surveyEndDate: Date;
    status: string;
    responses: number;
  }
  
