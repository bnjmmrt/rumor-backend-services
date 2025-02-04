import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import {
  CreateQuizQuestionRequest,
  GetUserQuizAnswersRequest,
  SaveUserQuizAnswersRequest,
  UpdateQuizQuestionRequest,
  UpdateUserQuizAnswerRequest,
} from '../grpc/events/events.pb';
import { Type } from 'class-transformer';

export class CreateQuizQuestionRequestDto implements CreateQuizQuestionRequest {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateQuizQuestionRequestDto implements UpdateQuizQuestionRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

class QuizAnswerDto {
  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsUUID()
  @IsOptional()
  id?: string;
}

export class SaveUserQuizAnswersRequestDto implements SaveUserQuizAnswersRequest {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}

export class UpdateUserQuizAnswerRequestDto implements UpdateUserQuizAnswerRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class GetUserQuizAnswersRequestDto implements GetUserQuizAnswersRequest {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}
