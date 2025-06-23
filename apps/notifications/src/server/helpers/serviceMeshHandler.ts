import config from '../../config';
import * as eventsServiceMesh from 'rumor-utils/service-mesh/events';
import * as usersServiceMesh from 'rumor-utils/service-mesh/users';
import * as schedulersServiceMesh from 'rumor-utils/service-mesh/schedulers';
import apiService from 'rumor-utils/service-mesh/';

class start {
  eventService() {
    apiService.initialize(config.get('EVENTS_SERVICE_BASE_URL'));
    return eventsServiceMesh;
  }

  userService() {
    apiService.initialize(config.get('USERS_SERVICE_BASE_URL'));
    return usersServiceMesh;
  }

  schedulerService() {
    apiService.initialize(config.get('SCHEDULER_SERVICE_BASE_URL'));
    return schedulersServiceMesh;
  }
}

const serviceMesh = new start();
export default serviceMesh;
