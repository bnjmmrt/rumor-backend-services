import { FeaturedEventSectionResponse, FeaturedEventSectionsResponse, GenericResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { FeaturedEventSectionsService } from '../services/featured-event-sections.service';
import { CreateFeaturedEventSectionRequestDto } from 'rumor-utils/shared/events/dtos/featured-event-sections.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import { GetResponse } from 'packages/rumor-utils/success';

export class FeaturedEventSectionsController {
  // constructor(private readonly service: FeaturedEventSectionsService) {}

  public static async getFeaturedEventSections(): Promise<any> {
    async (req, res): Promise<void> => {
      const response: FeaturedEventSectionsResponse = await FeaturedEventSectionsService.getFeaturedEventSections();
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  }

  public static async getFeaturedEventSection(payload: IdRequestDto): Promise<FeaturedEventSectionResponse> {
    return FeaturedEventSectionsService.getFeaturedEventSection(payload);
  }

  // public static async createFeaturedEventSection(payload: CreateFeaturedEventSectionRequestDto): Promise<GenericResponse> {
  //   async (req, res): Promise<void> => {
  //     const response: FeaturedEventSectionsResponse = await FeaturedEventSectionsService.getFeaturedEventSections();
  //     const successResponse = new GetResponse(response);
  //     res.status(successResponse.statusCode).json(successResponse);
  //   }
  // }

  public static async deleteFeaturedEventSection(payload: IdRequestDto): Promise<GenericResponse> {
    return FeaturedEventSectionsService.deleteFeaturedEventSection(payload);
  }
}
