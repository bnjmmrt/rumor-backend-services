import { CreateSponsorshipOpportunityDto, UpdateSponsorshipOpportunityDto } from '../shared/sponsorships/dtos/sponsorship-opportunity.dto';
import { CreateSponsorshipCategoryDto, UpdateSponsorshipCategoryDto } from '../shared/sponsorships/dtos/sponsorship-category.dto';
import { CreateTargetSponsorDto, UpdateTargetSponsorDto } from '../shared/sponsorships/dtos/target-sponsor.dto';
import { CreateCulturalMomentDto, UpdateCulturalMomentDto } from '../shared/sponsorships/dtos/cultural-moment.dto';
import { CreateSponsorshipInquiryDto, UpdateSponsorshipInquiryDto } from '../shared/sponsorships/dtos/sponsorship-inquiry.dto';

export const sponsorshipOpportunity = {
  POST: CreateSponsorshipOpportunityDto,
  PATCH: UpdateSponsorshipOpportunityDto,
};

export const sponsorshipCategory = {
  POST: CreateSponsorshipCategoryDto,
  PATCH: UpdateSponsorshipCategoryDto,
};

export const targetSponsor = {
  POST: CreateTargetSponsorDto,
  PATCH: UpdateTargetSponsorDto,
};

export const culturalMoment = {
  POST: CreateCulturalMomentDto,
  PATCH: UpdateCulturalMomentDto,
};

export const sponsorshipInquiry = {
  POST: CreateSponsorshipInquiryDto,
  PATCH: UpdateSponsorshipInquiryDto,
}; 