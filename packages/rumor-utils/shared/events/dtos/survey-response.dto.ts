import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

export class SurveyResponseDto {
  @IsString()
  @IsNotEmpty()
  surveyId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  response: string;

  @IsString()
  @IsNotEmpty()
  respondedAt: string;
}
