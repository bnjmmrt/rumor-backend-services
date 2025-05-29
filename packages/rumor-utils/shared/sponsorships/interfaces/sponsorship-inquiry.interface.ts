import { SponsorshipOpportunity } from '../entities/sponsorship-opportunity.entity';
import { User } from '../../users/entities/user.entity';

export interface TargetSponsorAssociation {
  targetSponsorId: string;
}
  
export interface CreateSponsorshipInquiryRequest {
  inquirerUserId: string;
  sponsorshipOpportunityId: string;
  targetSponsors?: TargetSponsorAssociation[];
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  message?: string;
}

export interface UpdateSponsorshipInquiryRequest {
  sponsorshipOpportunityId?: string;
  targetSponsors?: TargetSponsorAssociation[];
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  message?: string;
}

export interface TargetSponsorAssociationResponse {
  id: string;
  targetSponsorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SimplifiedTargetSponsorResponse {
  targetSponsorId: string;
  name: string;
}
  
export interface SponsorshipInquiryResponse {
  id: string;
  sponsorshipOpportunity: SponsorshipOpportunity;
  targetSponsors: SimplifiedTargetSponsorResponse[];
  inquirer: User;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
