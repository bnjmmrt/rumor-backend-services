import { FeaturedEventSectionsService } from '../services/featured-event-sections.service';
import { CreateResponse, DeleteResponse, GetResponse } from 'rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';

export class FeaturedEventSectionsController {
  // constructor(private readonly service: FeaturedEventSectionsService) {}


  public static featuredEventSections = asyncWrapper(async (req, res): Promise<void> => {
    const response = await FeaturedEventSectionsService.featuredEventSections();
    const successResponse = new GetResponse(response, "Feature event sections retreived");
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static createFeaturedEventSection = asyncWrapper(async (req, res): Promise<void> => {
    const payload: any = req.body
    const response = await FeaturedEventSectionsService.createFeaturedEventSection(payload);
    const successResponse = new CreateResponse(response, "Succesfully created feature event section");
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static deleteFeaturedEventSection = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params
    const response = await FeaturedEventSectionsService.deleteFeaturedEventSection(id);
    const successResponse = new DeleteResponse(response, "Succesfully created feature event section");
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
