import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import {
  CreateCulturalMomentRequest,
  UpdateCulturalMomentRequest,
  CulturalMomentResponse,
  SimplifiedCulturalMomentResponse
} from '../interfaces/cultural-moment.interface';

export class CreateCulturalMomentDto implements CreateCulturalMomentRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCulturalMomentDto implements UpdateCulturalMomentRequest {
  @IsString()
  @IsOptional()
  name?: string;
}

export class CulturalMomentResponseDto implements CulturalMomentResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
} 


export class SimplifiedCulturalMomentResponseDto implements SimplifiedCulturalMomentResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;
} 