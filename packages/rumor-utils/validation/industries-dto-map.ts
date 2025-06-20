import { CreateIndustryCategoryDto, UpdateIndustryCategoryDto } from '../shared/industries/dtos/industry-category.dto';
import { CreateTargetIndustryDto, UpdateTargetIndustryDto } from '../shared/industries/dtos/target-industry.dto';

export const industryCategory = {
  POST: CreateIndustryCategoryDto,
  PATCH: UpdateIndustryCategoryDto,
};

export const targetIndustry = {
  POST: CreateTargetIndustryDto,
  PATCH: UpdateTargetIndustryDto,
};
