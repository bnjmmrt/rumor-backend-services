import { IsString, IsNotEmpty, IsOptional, IsDate, IsArray } from 'class-validator';
import { TargetIndustryResponseDto } from './target-industry.dto';

export class CreateIndustryCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateIndustryCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class IndustryCategoryResponseDto {
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
  targetIndustries?: TargetIndustryResponseDto[];
}
