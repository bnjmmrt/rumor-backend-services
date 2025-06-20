import { IndustryOpportunity } from '../entities/industry-opportunity.entity';
import { User } from '../../users/entities/user.entity';

export interface TargetIndustryAssociation {
  targetIndustryId: string;
}
  
export interface CreateIndustryInquiryRequest {
  inquirerUserId: string;
  industryOpportunityId: string;
  targetIndustries?: TargetIndustryAssociation[];
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  message?: string;
}

export interface UpdateIndustryInquiryRequest {
  industryOpportunityId?: string;
  targetIndustries?: TargetIndustryAssociation[];
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  message?: string;
}

export interface TargetIndustryAssociationResponse {
  id: string;
  targetIndustryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SimplifiedTargetIndustryResponse {
  targetIndustryId: string;
  name: string;
}
  
export interface IndustryInquiryResponse {
  id: string;
  industryOpportunity: IndustryOpportunity;
  targetIndustries: SimplifiedTargetIndustryResponse[];
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
