import { IsString, IsNotEmpty, IsOptional, IsDate, IsUUID, IsUrl, IsEnum, IsArray, ValidateNested, IsBoolean, IsInt, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateSponsorshipOpportunityRequest,
  UpdateSponsorshipOpportunityRequest,
  SponsorshipOpportunityResponse,
  TargetSponsorAssociationResponse,
  SimplifiedTargetSponsorResponse,
  SimplifiedSponsorshipInquiryResponse,
  SimplifiedEventResponse,
  SponsorshipEventResponse,
  EventWithSponsorshipResponse,
} from '../interfaces/sponsorship-opportunity.interface';
import { OpportunityType } from '../enums/opportunity-type.enum';
import { EventResponseDto } from '../../events/dtos/events.dto';
import { SimplifiedCulturalMomentResponseDto } from '../dtos/cultural-moment.dto';

export class TargetSponsorAssociationDto {
  @IsUUID()
  @IsNotEmpty()
  targetSponsorId: string;

  @IsOptional()
  isExcluded?: boolean;
}

export class CreateSponsorshipOpportunityDto implements CreateSponsorshipOpportunityRequest {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  promoLink: string;

  @IsEnum(OpportunityType)
  @IsNotEmpty()
  opportunityType: OpportunityType;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_SPONSORSHIP)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidSponsorshipMinimum?: number;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_SPONSORSHIP)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidSponsorshipMaximum: number;

  @IsBoolean()
  @IsNotEmpty()
  isDraft: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetSponsorAssociationDto)
  targetSponsors?: TargetSponsorAssociationDto[];

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

export class UpdateSponsorshipOpportunityDto implements UpdateSponsorshipOpportunityRequest {
  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  promoLink?: string;

  @IsEnum(OpportunityType)
  @IsOptional()
  opportunityType?: OpportunityType;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_SPONSORSHIP)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidSponsorshipMinimum?: number;

  @ValidateIf(o => o.opportunityType === OpportunityType.PAID_SPONSORSHIP)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  paidSponsorshipMaximum?: number;

  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TargetSponsorAssociationDto)
  targetSponsors?: TargetSponsorAssociationDto[];

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

export class TargetSponsorAssociationResponseDto implements TargetSponsorAssociationResponse {
  @IsUUID()
  id: string;

  @IsUUID()
  targetSponsorId: string;

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

export class SimplifiedTargetSponsorResponseDto implements SimplifiedTargetSponsorResponse {
  @IsUUID()
  targetSponsorId: string;

  @IsString()
  name: string;

  @IsBoolean()
  isExcluded: boolean;
}

export class SimplifiedSponsorshipInquiryResponseDto implements SimplifiedSponsorshipInquiryResponse {
  @IsString()
  id: string;

  @IsString()
  inquirerId: string;
}

export class SponsorshipOpportunityResponseDto implements SponsorshipOpportunityResponse {
  @IsString()
  id: string;

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @IsString()
  promoLink: string;

  @IsEnum(OpportunityType)
  opportunityType: OpportunityType;

  @IsInt()
  @IsOptional()
  paidSponsorshipMinimum: number | null;

  @IsInt()
  @IsOptional()
  paidSponsorshipMaximum: number | null;

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
  @Type(() => SimplifiedTargetSponsorResponseDto)
  targetSponsors: SimplifiedTargetSponsorResponseDto[];

  @ValidateNested()
  @IsOptional()
  @Type(() => SimplifiedCulturalMomentResponseDto)
  culturalMoment?: SimplifiedCulturalMomentResponseDto;  

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SimplifiedSponsorshipInquiryResponseDto)
  inquiries: SimplifiedSponsorshipInquiryResponseDto[];
}

export class SponsorshipEventResponseDto implements SponsorshipEventResponse {
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

export class EventWithSponsorshipResponseDto implements EventWithSponsorshipResponse {
  @ValidateNested()
  @Type(() => SponsorshipEventResponseDto)
  event: SponsorshipEventResponseDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => SimplifiedCulturalMomentResponseDto)
  culturalMoment: SimplifiedCulturalMomentResponseDto;

  @IsString()
  @IsOptional()
  sponsorshipOpportunityId?: string;
}

export class SimplifiedEventResponseDto implements SimplifiedEventResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;
}
