import { IsString, IsNotEmpty, IsOptional, IsDate, IsArray } from 'class-validator';
import { TargetSponsorResponseDto } from './target-sponsor.dto';

export class CreateSponsorshipCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateSponsorshipCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class SponsorshipCategoryResponseDto {
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

  @IsArray()
  @IsOptional()
  targetSponsors?: TargetSponsorResponseDto[];
}
