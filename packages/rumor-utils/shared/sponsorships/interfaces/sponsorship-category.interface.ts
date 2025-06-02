export interface CreateSponsorshipCategoryRequest {
  name: string;
}

export interface UpdateSponsorshipCategoryRequest {
  name: string;
}

export interface SponsorshipCategoryResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
