import config from '../../config';
import * as usersServiceMesh from 'rumor-utils/service-mesh/users';
import * as notificationsServiceMesh from 'rumor-utils/service-mesh/notifications';
import * as schedulersServiceMesh from 'rumor-utils/service-mesh/schedulers';

import apiService from 'rumor-utils/service-mesh/';

class start {
  userService(token?: string) {
    apiService.initialize(config.get('USERS_SERVICE_BASE_URL'), token);
    return usersServiceMesh;
  }

  notificationService() {
    apiService.initialize(config.get('NOTIFICATIONS_SERVICE_BASE_URL'));
    return notificationsServiceMesh;
  }

  schedulerService() {
    apiService.initialize(config.get('SCHEDULER_SERVICE_BASE_URL'));
    return schedulersServiceMesh;
  }
}

const serviceMesh = new start();
export default serviceMesh;
