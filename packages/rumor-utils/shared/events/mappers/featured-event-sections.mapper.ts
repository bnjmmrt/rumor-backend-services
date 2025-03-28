import { FeaturedEventSection } from '../entities/featured-event-section.entity';
import { FeaturedEventsSection as FeaturedEventsSectionProto } from '../grpc/platform/general.pb';

export const toFeaturedEventSection = (
  featuredEventSection: FeaturedEventSection,
): FeaturedEventsSectionProto => {
  return {
    id: featuredEventSection?.id,
    name: featuredEventSection?.name,
    index: featuredEventSection?.index,
  };
};
