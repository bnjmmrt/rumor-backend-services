export interface CreateCulturalMomentRequest {
  name: string;
}

export interface UpdateCulturalMomentRequest {
  name?: string;
}

export interface CulturalMomentResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
} 

export interface SimplifiedCulturalMomentResponse {
  id: string;
  name: string;
} 