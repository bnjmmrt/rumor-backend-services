import config from '../../config';
import * as eventsServiceMesh from 'rumor-utils/service-mesh/events';
import * as notificationServiceMesh from 'rumor-utils/service-mesh/notifications';
import apiService from 'rumor-utils/service-mesh/';

class start {
  eventService(token?: string) {
    apiService.initialize(config.get('EVENTS_SERVICE_BASE_URL'), token);
    return eventsServiceMesh;
  }
  notificationService() {
    apiService.initialize(config.get('NOTIFICATIONS_SERVICE_BASE_URL'));
    return notificationServiceMesh;
  }
}

const serviceMesh = new start();
export default serviceMesh;
