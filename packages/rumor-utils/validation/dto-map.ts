import * as EventDtoMap from './events-dto-map';
import * as SponsorshipsDtoMap from './sponsorships-dto-map';

// import {} from './users-dto-map';

const DtoMap = {
  ...EventDtoMap,
  ...SponsorshipsDtoMap,
};

export default DtoMap;
