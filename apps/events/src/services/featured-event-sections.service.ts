import { FeaturedEventSectionResponse, FeaturedEventSectionsResponse, GenericResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { responses } from '../common/responses';
import { CreateFeaturedEventSectionRequestDto } from 'rumor-utils/shared/events/dtos/featured-event-sections.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import { FeaturedEventSection } from 'rumor-utils/shared/events/entities/featured-event-section.entity';
import { IsNull } from 'typeorm';
import { toFeaturedEventSection } from 'rumor-utils/shared/events/mappers/featured-event-sections.mapper';
import database from '../database';

export class FeaturedEventSectionsService {
  public static dbConnection = database;

  public static async getFeaturedEventSections(): Promise<FeaturedEventSectionsResponse> {
    try {
      const featuredEventSections = await this.dbConnection.getRepository(FeaturedEventSection).find({ where: { deletedAt: IsNull() }, order: { index: 'ASC' } });
      return responses.data(featuredEventSections.map((featuredEventSection) => toFeaturedEventSection(featuredEventSection)));
    } catch (err) {
      return responses.badRequest('Uknown error occured, please try again');
    }
  }

  public static async getFeaturedEventSection(payload: IdRequestDto): Promise<FeaturedEventSectionResponse> {
    try {
      const featuredEventSection = await this.dbConnection.getRepository(FeaturedEventSection).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
      if (!featuredEventSection) return responses.notFound('Featured event section was not found!');

      return responses.data(toFeaturedEventSection(featuredEventSection));
    } catch (err) {
      return responses.badRequest('Uknown error occured, please try again');
    }
  }

  public static async createFeaturedEventSection(payload: CreateFeaturedEventSectionRequestDto): Promise<GenericResponse> {
    try {
      const featuredEventSections = await this.dbConnection.getRepository(FeaturedEventSection).find({ where: { deletedAt: IsNull() }, order: { index: 'ASC' } });

      // Check if a section with the same name exists
      const existingFeaturedEventSection = featuredEventSections.find(
        (featuredEventSection) => featuredEventSection.name.toLowerCase().replace(' ', '') === payload.name.toLowerCase().replace(' ', ''),
      );
      if (existingFeaturedEventSection) {
        return responses.conflict('Featured event section with this name already exists!');
      }

      // Find the smallest available index
      const usedIndexes = featuredEventSections.map((section) => section.index);
      let newIndex = 0;
      while (usedIndexes.includes(newIndex)) {
        newIndex++;
      }

      const featuredEventSection = new FeaturedEventSection();
      featuredEventSection.name = payload.name;
      featuredEventSection.index = newIndex;

      await this.dbConnection.getRepository(FeaturedEventSection).save(featuredEventSection);

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Uknown error occured, please try again');
    }
  }

  public static async deleteFeaturedEventSection(payload: IdRequestDto): Promise<GenericResponse> {
    try {
      const featuredEventSection = await this.dbConnection.getRepository(FeaturedEventSection).findOneBy({ id: payload.id });
      if (!featuredEventSection) return responses.notFound('Featured event section was not found or has already been deleted!');

      await featuredEventSection.softRemove();
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Uknown error occured, please try again');
    }
  }

}
