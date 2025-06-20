import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID } from 'class-validator';
import {
  CreateTargetIndustryRequest,
  UpdateTargetIndustryRequest,
  TargetIndustryResponse,
} from '../interfaces/target-industry.interface';

export class CreateTargetIndustryDto implements CreateTargetIndustryRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  industryCategoryId: string;
}

export class UpdateTargetIndustryDto implements UpdateTargetIndustryRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  industryCategoryId?: string;
}

export class TargetIndustryResponseDto implements TargetIndustryResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsUUID()
  industryCategoryId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
} 