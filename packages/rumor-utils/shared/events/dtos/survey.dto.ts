import { CreateSurveyRequest } from '../grpc/events/general.pb';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
export class CreateSurveyRequestDto implements CreateSurveyRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsDate()
  @IsNotEmpty()
  eventStartDate: Date;

  @IsDate()
  @IsNotEmpty()
  eventEndDate: Date;

  @IsDate()
  @IsNotEmpty()
  surveyStartDate: Date;

  @IsDate()
  @IsNotEmpty()
  surveyEndDate: Date;
}
