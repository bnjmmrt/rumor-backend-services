export interface CreateIndustryshipCategoryRequest {
  name: string;
}

export interface UpdateIndustryshipCategoryRequest {
  name: string;
}

export interface IndustryshipCategoryResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
