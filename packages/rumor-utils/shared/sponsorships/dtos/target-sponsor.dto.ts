import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID } from 'class-validator';
import {
  CreateTargetSponsorRequest,
  UpdateTargetSponsorRequest,
  TargetSponsorResponse,
} from '../interfaces/target-sponsor.interface';

export class CreateTargetSponsorDto implements CreateTargetSponsorRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  sponsorshipCategoryId: string;
}

export class UpdateTargetSponsorDto implements UpdateTargetSponsorRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  sponsorshipCategoryId?: string;
}

export class TargetSponsorResponseDto implements TargetSponsorResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsUUID()
  sponsorshipCategoryId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
} 