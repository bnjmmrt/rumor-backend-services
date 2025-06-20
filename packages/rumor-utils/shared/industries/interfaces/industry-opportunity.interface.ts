import { OpportunityType } from '../enums/opportunity-type.enum';
import { EventResponseDto } from '../../events/dtos/events.dto';
import { CulturalMoment } from '../entities/cultural-moment.entity';
import { SimplifiedCulturalMomentResponseDto } from '../dtos/cultural-moment.dto';
import { SimplifiedIndustryInquiryResponseDto } from '../dtos/industry-opportunity.dto';

export interface TargetIndustryAssociation {
  targetIndustryId: string;
  isExcluded?: boolean;
}

export interface CreateIndustryOpportunityRequest {
  description: string;
  eventId: string;
  culturalMomentId?: string;
  promoLink?: string;
  opportunityType: OpportunityType;
  targetIndustries?: TargetIndustryAssociation[];  
  paidIndustryMinimum?: number;
  paidIndustryMaximum?: number;
  isDraft: boolean;
  imageUrl: string;
  deckUrl: string;
}

export interface UpdateIndustryOpportunityRequest {
  description?: string;
  eventId?: string;
  culturalMomentId?: string;
  promoLink?: string;
  opportunityType?: OpportunityType;
  targetIndustries?: TargetIndustryAssociation[];
  paidIndustryMinimum?: number;
  paidIndustryMaximum?: number;
  isDraft?: boolean;
  imageUrl?: string;
  deckUrl?: string;
}

export interface TargetIndustryAssociationResponse {
  id: string;
  targetIndustryId: string;
  isExcluded: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SimplifiedTargetIndustryResponse {
  targetIndustryId: string;
  name: string;
  isExcluded: boolean;
}

export interface SimplifiedIndustryInquiryResponse {
  id: string;
  inquirerId: string;
}

export interface IndustryOpportunityResponse {
  id: string;
  description: string;
  event: EventResponseDto;
  promoLink?: string;
  opportunityType: OpportunityType;
  paidIndustryMinimum: number | null;
  paidIndustryMaximum: number | null;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  imageUrl: string;
  deckUrl: string;
  targetIndustries?: SimplifiedTargetIndustryResponse[];
  culturalMoment?: SimplifiedCulturalMomentResponseDto;
  inquiries?: SimplifiedIndustryInquiryResponseDto[];
}

export interface SimplifiedEventResponse {
  id: string;
  name: string;
}

export interface IndustryEventResponse {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
  timeZone?: string;
  limitOnePlus?: number;
  rsvpDeadline?: Date;
  showLocation?: boolean;
  useQr: boolean;
  imageFlyer?: string;
  imageCover?: string;
  status?: string;
  publishDate?: Date;
  isPublished?: boolean;
  isPrivate?: boolean;
  capacity?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface EventWithIndustryResponse {
  event: IndustryEventResponse;
  culturalMoment?: SimplifiedCulturalMomentResponseDto;
  industryOpportunityId?: string;
}
