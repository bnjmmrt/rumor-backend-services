import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  AddFocusRequest,
  CreateInterestRequest,
  EditFocusNameRequest,
  IdRequest,
  QueryParamRequest,
  SaveFocusesForUserRequest,
  SaveInterestsForUserRequest,
  UpdateInterestRequest,
} from '../grpc/platform/platform.pb';

export class AddFocusRequestDto implements AddFocusRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class EditFocusNameRequestDto implements EditFocusNameRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class SaveFocusesForUserRequestoDto implements SaveFocusesForUserRequest {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  focusIds: string[];
}

export class IdRequestDto implements IdRequest {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

// Interest
export class CreateInterestRequestDto implements CreateInterestRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsBoolean()
  @IsOptional()
  enabled: boolean;
}

export class UpdateInterestRequestDto implements UpdateInterestRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class SaveInterestsForUserRequestDto implements SaveInterestsForUserRequest {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  interestsIds: string[];
}

export class QueryParamRequestDto implements QueryParamRequest {
  @IsString()
  @IsOptional()
  query?: string;
}
