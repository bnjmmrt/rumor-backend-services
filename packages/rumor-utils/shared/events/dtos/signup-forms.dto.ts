import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  CreateSignupFormRequest,
  ISignupFormQuestionsRequest,
} from "../grpc/events/general.pb";

export class CreateSignupFormDto implements CreateSignupFormRequest {
  @IsOptional()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  styling: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  hasAccessForAdditionalGuests: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionsDto)
  questions: QuestionsDto[];
}

export class QuestionsDto implements ISignupFormQuestionsRequest {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsBoolean()
  isRequired: boolean;

  @IsString()
  @IsOptional()
  value: string;
}

export class SignupFormAnswersDto implements ISignupFormQuestionsRequest {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsString()
  key: string;

  @IsBoolean()
  isRequired: boolean;

  @IsString()
  @IsOptional()
  answers: string;
}
