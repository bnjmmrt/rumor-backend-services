import { FeaturedEventSectionResponse, FeaturedEventSectionsResponse, GenericResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { FeaturedEventSectionsService } from '../services/featured-event-sections.service';
import { CreateFeaturedEventSectionRequestDto } from 'rumor-utils/shared/events/dtos/featured-event-sections.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';

export class FeaturedEventSectionsController {
  constructor(private readonly service: FeaturedEventSectionsService) {}

  //@GrpcMethod(PLATFORM_SERVICE_NAME, 'GetFeaturedEventSections')
  public async getFeaturedEventSections(): Promise<FeaturedEventSectionsResponse> {
    return FeaturedEventSectionsService.getFeaturedEventSections();
  }

  //@GrpcMethod(PLATFORM_SERVICE_NAME, 'GetFeaturedEventSection')
  public async getFeaturedEventSection(payload: IdRequestDto): Promise<FeaturedEventSectionResponse> {
    return FeaturedEventSectionsService.getFeaturedEventSection(payload);
  }

  //@GrpcMethod(PLATFORM_SERVICE_NAME, 'CreateFeaturedEventSection')
  public async createFeaturedEventSection(payload: CreateFeaturedEventSectionRequestDto): Promise<GenericResponse> {
    return FeaturedEventSectionsService.createFeaturedEventSection(payload);
  }

  //@GrpcMethod(PLATFORM_SERVICE_NAME, 'DeleteFeaturedEventSection')
  public async deleteFeaturedEventSection(payload: IdRequestDto): Promise<GenericResponse> {
    return FeaturedEventSectionsService.deleteFeaturedEventSection(payload);
  }
}
