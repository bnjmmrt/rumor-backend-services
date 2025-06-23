export interface CreateTargetIndustryRequest {
  name: string;
  industryCategoryId: string;
}

export interface UpdateTargetIndustryRequest {
  name?: string;
  industryCategoryId?: string;
}

export interface TargetIndustryResponse {
  id: string;
  name: string;
  industryCategoryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
} 