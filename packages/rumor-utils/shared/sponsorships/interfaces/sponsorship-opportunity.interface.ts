import { OpportunityType } from '../enums/opportunity-type.enum';
import { EventResponseDto } from '../../events/dtos/events.dto';
import { CulturalMoment } from '../entities/cultural-moment.entity';
import { SimplifiedCulturalMomentResponseDto } from '../dtos/cultural-moment.dto';
import { SimplifiedSponsorshipInquiryResponseDto } from '../dtos/sponsorship-opportunity.dto';

export interface TargetSponsorAssociation {
  targetSponsorId: string;
  isExcluded?: boolean;
}

export interface CreateSponsorshipOpportunityRequest {
  description: string;
  eventId: string;
  culturalMomentId?: string;
  promoLink?: string;
  opportunityType: OpportunityType;
  targetSponsors?: TargetSponsorAssociation[];  
  paidSponsorshipMinimum?: number;
  paidSponsorshipMaximum?: number;
  isDraft: boolean;
  imageUrl: string;
  deckUrl: string;
}

export interface UpdateSponsorshipOpportunityRequest {
  description?: string;
  eventId?: string;
  culturalMomentId?: string;
  promoLink?: string;
  opportunityType?: OpportunityType;
  targetSponsors?: TargetSponsorAssociation[];
  paidSponsorshipMinimum?: number;
  paidSponsorshipMaximum?: number;
  isDraft?: boolean;
  imageUrl?: string;
  deckUrl?: string;
}

export interface TargetSponsorAssociationResponse {
  id: string;
  targetSponsorId: string;
  isExcluded: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SimplifiedTargetSponsorResponse {
  targetSponsorId: string;
  name: string;
  isExcluded: boolean;
}

export interface SimplifiedSponsorshipInquiryResponse {
  id: string;
  inquirerId: string;
}

export interface SponsorshipOpportunityResponse {
  id: string;
  description: string;
  event: EventResponseDto;
  promoLink?: string;
  opportunityType: OpportunityType;
  paidSponsorshipMinimum: number | null;
  paidSponsorshipMaximum: number | null;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  imageUrl: string;
  deckUrl: string;
  targetSponsors?: SimplifiedTargetSponsorResponse[];
  culturalMoment?: SimplifiedCulturalMomentResponseDto;
  inquiries?: SimplifiedSponsorshipInquiryResponseDto[];
}

export interface SimplifiedEventResponse {
  id: string;
  name: string;
}

export interface SponsorshipEventResponse {
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

export interface EventWithSponsorshipResponse {
  event: SponsorshipEventResponse;
  culturalMoment?: SimplifiedCulturalMomentResponseDto;
  sponsorshipOpportunityId?: string;
}
