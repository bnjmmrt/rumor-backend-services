import * as EventDtoMap from './events-dto-map';
import * as SponsorshipsDtoMap from './sponsorships-dto-map';
import * as IndustriesDtoMap from './industries-dto-map';

// import {} from './users-dto-map';

const DtoMap = {
  ...EventDtoMap,
  ...SponsorshipsDtoMap,
  ...IndustriesDtoMap,
};

export default DtoMap;
