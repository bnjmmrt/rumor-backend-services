import config from '../../config';
import * as eventsServiceMesh from 'rumor-utils/service-mesh/events';
import * as notificationServiceMesh from 'rumor-utils/service-mesh/notifications';
import * as userServiceMesh from 'rumor-utils/service-mesh/users';
import apiService from 'rumor-utils/service-mesh/';

class start {
  eventService() {
    apiService.initialize(config.get('EVENTS_SERVICE_BASE_URL'));
    return eventsServiceMesh;
  }

  notificationService() {
    apiService.initialize(config.get('NOTIFICATIONS_SERVICE_BASE_URL'));
    return notificationServiceMesh;
  }

  userService() {
    apiService.initialize(config.get('USERS_SERVICE_BASE_URL'));
    return userServiceMesh;
  }
}

const serviceMesh = new start();
export default serviceMesh;
