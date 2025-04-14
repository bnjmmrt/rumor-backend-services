import config from '../../config';
import * as usersServiceMesh from 'rumor-utils/service-mesh/users';
import * as notificationsServiceMesh from 'rumor-utils/service-mesh/notifications';
import * as schedularsServiceMesh from 'rumor-utils/service-mesh/schedulars';

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

  schedularService() {
    apiService.initialize(config.get('SCHEDULAR_SERVICE_BASE_URL'));
    return schedularsServiceMesh;
  }
}

const serviceMesh = new start();
export default serviceMesh;
