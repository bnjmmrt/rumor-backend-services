import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID, IsUrl, IsEnum, IsArray, ValidateNested, IsBoolean, IsInt, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateIndustryOpportunityRequest,
  UpdateIndustryOpportunityRequest,
  IndustryOpportunityResponse,
  TargetIndustryAssociationResponse,
  SimplifiedTargetIndustryResponse,
  SimplifiedIndustryInquiryResponse,
  SimplifiedEventResponse,
  IndustryEventResponse,
  EventWithIndustryResponse,
} from '../interfaces/industry-opportunity.interface';
import { OpportunityType } from '../enums/opportunity-type.enum';
import { EventResponseDto } from '../../events/dtos/events.dto';
import { SimplifiedCulturalMomentResponseDto } from './cultural-moment.dto';

export class TargetIndustryAssociationDto {
  @IsUUID()
  @IsNotEmpty()
  targetIndustryId: string;

  @IsOptional()
  isExcluded?: boolean;
}

export class CreateIndustryOpportunityDto implements CreateIndustryOpportunityRequest {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  promoLink: string;

  @IsEnum(OpportunityType)
  @IsNotEmpty()
  opportunityType: OpportunityType;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_INDUSTRY)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidIndustryMinimum?: number;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_INDUSTRY)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidIndustryMaximum: number;

  @IsBoolean()
  @IsNotEmpty()
  isDraft: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetIndustryAssociationDto)
  targetIndustries?: TargetIndustryAssociationDto[];

  @IsUUID()
  @IsOptional()
  culturalMomentId?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  deckUrl: string;
}

export class UpdateIndustryOpportunityDto implements UpdateIndustryOpportunityRequest {
  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  promoLink?: string;

  @IsEnum(OpportunityType)
  @IsOptional()
  opportunityType?: OpportunityType;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_INDUSTRY)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidIndustryMinimum?: number;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_INDUSTRY)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidIndustryMaximum?: number;

  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetIndustryAssociationDto)
  targetIndustries?: TargetIndustryAssociationDto[];

  @IsUUID()
  @IsOptional()
  culturalMomentId?: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsString()
  @IsOptional()
  deckUrl: string;  
}

export class TargetIndustryAssociationResponseDto implements TargetIndustryAssociationResponse {
  @IsUUID()
  id: string;

  @IsUUID()
  targetIndustryId: string;

  @IsBoolean()
  isExcluded: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
}

export class SimplifiedTargetIndustryResponseDto implements SimplifiedTargetIndustryResponse {
  @IsUUID()
  targetIndustryId: string;

  @IsString()
  name: string;

  @IsBoolean()
  isExcluded: boolean;
}

export class SimplifiedIndustryInquiryResponseDto implements SimplifiedIndustryInquiryResponse {
  @IsString()
  id: string;

  @IsString()
  inquirerId: string;
}

export class IndustryOpportunityResponseDto implements IndustryOpportunityResponse {
  @IsString()
  id: string;

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @IsString()
  @IsOptional()
  promoLink: string;

  @IsEnum(OpportunityType)
  opportunityType: OpportunityType;

  @IsInt()
  @IsOptional()
  paidIndustryMinimum: number | null;

  @IsInt()
  @IsOptional()
  paidIndustryMaximum: number | null;

  @IsBoolean()
  isDraft: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  imageUrl: string;

  @IsString()
  deckUrl: string;

  @IsDate()
  @IsOptional()
  deletedAt: Date | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimplifiedTargetIndustryResponseDto)
  targetIndustries: SimplifiedTargetIndustryResponseDto[];

  @ValidateNested()
  @IsOptional()
  @Type(() => SimplifiedCulturalMomentResponseDto)
  culturalMoment?: SimplifiedCulturalMomentResponseDto;  

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SimplifiedIndustryInquiryResponseDto)
  inquiries: SimplifiedIndustryInquiryResponseDto[];
}

export class IndustryEventResponseDto implements IndustryEventResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  enabled: boolean;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsInt()
  @IsOptional()
  limitOnePlus?: number;

  @IsDate()
  @IsOptional()
  rsvpDeadline?: Date;

  @IsBoolean()
  @IsOptional()
  showLocation?: boolean;

  @IsBoolean()
  useQr: boolean;

  @IsString()
  @IsOptional()
  imageFlyer?: string;

  @IsString()
  @IsOptional()
  imageCover?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDate()
  @IsOptional()
  publishDate?: Date;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt?: Date;
}

export class EventWithIndustryResponseDto implements EventWithIndustryResponse {
  @ValidateNested()
  @Type(() => IndustryEventResponseDto)
  event: IndustryEventResponseDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => SimplifiedCulturalMomentResponseDto)
  culturalMoment: SimplifiedCulturalMomentResponseDto;

  @IsString()
  @IsOptional()
  industryOpportunityId?: string;
}

export class SimplifiedEventResponseDto implements SimplifiedEventResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;
}
