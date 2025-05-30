import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID, IsEmail, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { SponsorshipOpportunity } from '../entities/sponsorship-opportunity.entity';

export class TargetSponsorAssociationDto {
  @IsUUID()
  @IsNotEmpty()
  targetSponsorId: string;
}

export class CreateSponsorshipInquiryDto {
  @IsUUID()
  @IsNotEmpty()
  inquirerUserId: string;

  @IsUUID()
  @IsNotEmpty()
  sponsorshipOpportunityId: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetSponsorAssociationDto)
  targetSponsors?: TargetSponsorAssociationDto[];

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

export class UpdateSponsorshipInquiryDto {
  @IsUUID()
  @IsOptional()
  sponsorshipOpportunityId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetSponsorAssociationDto)
  targetSponsors?: TargetSponsorAssociationDto[];

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

export class TargetSponsorAssociationResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  targetSponsorId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
}

export class SimplifiedTargetSponsorResponseDto {
  @IsUUID()
  targetSponsorId: string;

  @IsString()
  name: string;
}

export class SponsorshipInquiryResponseDto {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => SponsorshipOpportunity)
  sponsorshipOpportunity: SponsorshipOpportunity;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimplifiedTargetSponsorResponseDto)
  targetSponsors: SimplifiedTargetSponsorResponseDto[];

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