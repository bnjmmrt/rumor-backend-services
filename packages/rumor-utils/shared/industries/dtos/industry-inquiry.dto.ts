import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID, IsEmail, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { IndustryOpportunity } from '../entities/industry-opportunity.entity';

export class TargetIndustryAssociationDto {
  @IsUUID()
  @IsNotEmpty()
  targetIndustryId: string;
}

export class CreateIndustryInquiryDto {
  @IsUUID()
  @IsNotEmpty()
  inquirerUserId: string;

  @IsUUID()
  @IsNotEmpty()
  industryOpportunityId: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetIndustryAssociationDto)
  targetIndustries?: TargetIndustryAssociationDto[];

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateIndustryInquiryDto {
  @IsUUID()
  @IsOptional()
  industryOpportunityId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetIndustryAssociationDto)
  targetIndustries?: TargetIndustryAssociationDto[];

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class TargetIndustryAssociationResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  targetIndustryId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
}

export class SimplifiedTargetIndustryResponseDto {
  @IsUUID()
  targetIndustryId: string;

  @IsString()
  name: string;
}

export class IndustryInquiryResponseDto {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => IndustryOpportunity)
  industryOpportunity: IndustryOpportunity;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimplifiedTargetIndustryResponseDto)
  targetIndustries: SimplifiedTargetIndustryResponseDto[];

  @ValidateNested()
  @Type(() => User)
  inquirer: User;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  companyName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
} 