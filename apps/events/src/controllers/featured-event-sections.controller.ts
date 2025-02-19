// import { Controller } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
// import { FeaturedEventSectionResponse, FeaturedEventSectionsResponse, GenericResponse, PLATFORM_SERVICE_NAME } from '../grpc/platform/platform.pb';
// import { FeaturedEventSectionsService } from '../services/featured-event-sections.service';
// import { CreateFeaturedEventSectionRequestDto } from '../dtos/featured-event-sections.dto';
// import { IdRequestDto } from '../dtos/platform.dto';

// @Controller()
// export class FeaturedEventSectionsController {
//   constructor(private readonly service: FeaturedEventSectionsService) {}

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetFeaturedEventSections')
//   public async getFeaturedEventSections(): Promise<FeaturedEventSectionsResponse> {
//     return this.service.getFeaturedEventSections();
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'GetFeaturedEventSection')
//   public async getFeaturedEventSection(payload: IdRequestDto): Promise<FeaturedEventSectionResponse> {
//     return this.service.getFeaturedEventSection(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'CreateFeaturedEventSection')
//   public async createFeaturedEventSection(payload: CreateFeaturedEventSectionRequestDto): Promise<GenericResponse> {
//     return this.service.createFeaturedEventSection(payload);
//   }

//   @GrpcMethod(PLATFORM_SERVICE_NAME, 'DeleteFeaturedEventSection')
//   public async deleteFeaturedEventSection(payload: IdRequestDto): Promise<GenericResponse> {
//     return this.service.deleteFeaturedEventSection(payload);
//   }
// }
