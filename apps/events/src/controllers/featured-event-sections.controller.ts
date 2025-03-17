import { FeaturedEventSectionResponse, FeaturedEventSectionsResponse, GenericResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { FeaturedEventSectionsService } from '../services/featured-event-sections.service';
import { CreateFeaturedEventSectionRequestDto } from 'rumor-utils/shared/events/dtos/featured-event-sections.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';

export class FeaturedEventSectionsController {
  constructor(private readonly service: FeaturedEventSectionsService) {}

  public async getFeaturedEventSections(): Promise<FeaturedEventSectionsResponse> {
    return FeaturedEventSectionsService.getFeaturedEventSections();
  }

  public async getFeaturedEventSection(payload: IdRequestDto): Promise<FeaturedEventSectionResponse> {
    return FeaturedEventSectionsService.getFeaturedEventSection(payload);
  }

  public async createFeaturedEventSection(payload: CreateFeaturedEventSectionRequestDto): Promise<GenericResponse> {
    return FeaturedEventSectionsService.createFeaturedEventSection(payload);
  }

  public async deleteFeaturedEventSection(payload: IdRequestDto): Promise<GenericResponse> {
    return FeaturedEventSectionsService.deleteFeaturedEventSection(payload);
  }
}
