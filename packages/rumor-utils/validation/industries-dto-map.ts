import { CreateIndustryOpportunityDto, UpdateIndustryOpportunityDto } from '../shared/industries/dtos/industry-opportunity.dto';
import { CreateIndustryCategoryDto, UpdateIndustryCategoryDto } from '../shared/industries/dtos/industry-category.dto';
import { CreateTargetIndustryDto, UpdateTargetIndustryDto } from '../shared/industries/dtos/target-industry.dto';
import { CreateCulturalMomentDto, UpdateCulturalMomentDto } from '../shared/industries/dtos/cultural-moment.dto';
import { CreateIndustryInquiryDto, UpdateIndustryInquiryDto } from '../shared/industries/dtos/industry-inquiry.dto';

export const industryOpportunity = {
  POST: CreateIndustryOpportunityDto,
  PATCH: UpdateIndustryOpportunityDto,
};

export const industryCategory = {
  POST: CreateIndustryCategoryDto,
  PATCH: UpdateIndustryCategoryDto,
};

export const targetIndustry = {
  POST: CreateTargetIndustryDto,
  PATCH: UpdateTargetIndustryDto,
};

export const culturalMoment = {
  POST: CreateCulturalMomentDto,
  PATCH: UpdateCulturalMomentDto,
};

export const industryInquiry = {
  POST: CreateIndustryInquiryDto,
  PATCH: UpdateIndustryInquiryDto,
}; 