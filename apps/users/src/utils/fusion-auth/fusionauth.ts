import config from '../../config';
import FusionAuthClient from '@fusionauth/typescript-client';
class FusionAuthClientHandler {
     fusionAuthClient() {
          const fusionAuthClient = new FusionAuthClient(config.get('FUSIONAUTH_API_KEY'),config.get('FUSIONAUTH_BASE_URL'), config.get('FUSIONAUTH_TENANT_ID')); 
        return fusionAuthClient
      }
}

const fusionAuthClientHandler = new FusionAuthClientHandler()
export default fusionAuthClientHandler;