// import { Injectable, Logger } from '@nestjs/common';
// import { FeaturedEventSectionResponse, FeaturedEventSectionsResponse, GenericResponse } from '../grpc/platform/platform.pb';
// import { responses } from '../common/responses';
// import { CreateFeaturedEventSectionRequestDto } from '../dtos/featured-event-sections.dto';
// import { IdRequestDto } from '../dtos/platform.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { FeaturedEventSection } from '../entities/featured-event-section.entity';
// import { IsNull, Repository } from 'typeorm';
// import { toFeaturedEventSection } from '../mappers/featured-event-sections.mapper';

// @Injectable()
// export class FeaturedEventSectionsService {
//   private readonly logger = new Logger(FeaturedEventSectionsService.name);

//   @InjectRepository(FeaturedEventSection)
//   private readonly featuredEventSectionRepository: Repository<FeaturedEventSection>;

//   async getFeaturedEventSections(): Promise<FeaturedEventSectionsResponse> {
//     try {
//       const featuredEventSections = await this.featuredEventSectionRepository.find({ where: { deletedAt: IsNull() }, order: { index: 'ASC' } });
//       return responses.data(featuredEventSections.map((featuredEventSection) => toFeaturedEventSection(featuredEventSection)));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Uknown error occured, please try again');
//     }
//   }

//   async getFeaturedEventSection(payload: IdRequestDto): Promise<FeaturedEventSectionResponse> {
//     try {
//       const featuredEventSection = await this.featuredEventSectionRepository.findOne({ where: { id: payload.id, deletedAt: IsNull() } });
//       if (!featuredEventSection) return responses.notFound('Featured event section was not found!');

//       return responses.data(toFeaturedEventSection(featuredEventSection));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Uknown error occured, please try again');
//     }
//   }

//   async createFeaturedEventSection(payload: CreateFeaturedEventSectionRequestDto): Promise<GenericResponse> {
//     try {
//       const featuredEventSections = await this.featuredEventSectionRepository.find({ where: { deletedAt: IsNull() }, order: { index: 'ASC' } });

//       // Check if a section with the same name exists
//       const existingFeaturedEventSection = featuredEventSections.find(
//         (featuredEventSection) => featuredEventSection.name.toLowerCase().replace(' ', '') === payload.name.toLowerCase().replace(' ', ''),
//       );
//       if (existingFeaturedEventSection) {
//         return responses.conflict('Featured event section with this name already exists!');
//       }

//       // Find the smallest available index
//       const usedIndexes = featuredEventSections.map((section) => section.index);
//       let newIndex = 0;
//       while (usedIndexes.includes(newIndex)) {
//         newIndex++;
//       }

//       const featuredEventSection = new FeaturedEventSection();
//       featuredEventSection.name = payload.name;
//       featuredEventSection.index = newIndex;

//       await this.featuredEventSectionRepository.save(featuredEventSection);

//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Uknown error occured, please try again');
//     }
//   }

//   async deleteFeaturedEventSection(payload: IdRequestDto): Promise<GenericResponse> {
//     try {
//       const featuredEventSection = await this.featuredEventSectionRepository.findOneBy({ id: payload.id });
//       if (!featuredEventSection) return responses.notFound('Featured event section was not found or has already been deleted!');

//       await featuredEventSection.softRemove();
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Uknown error occured, please try again');
//     }
//   }
// }
