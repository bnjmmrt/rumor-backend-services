export interface CreateTargetSponsorRequest {
  name: string;
  sponsorshipCategoryId: string;
}

export interface UpdateTargetSponsorRequest {
  name?: string;
  sponsorshipCategoryId?: string;
}

export interface TargetSponsorResponse {
  id: string;
  name: string;
  sponsorshipCategoryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
} 