import getSecret from '../utils/aws/secretsManager';
import defaultConfig from './default';
import developmentConfig from './development';
import stagingConfig from './staging';
import productionConfig from './production';
// import { ProgrammerError } from '../utils/errors';
import uatConfig from './uat';

class Config {
  values: { [key: string]: any };

  constructor() {
    this.values = {};
  }

  set(key: string, value: any) {
    this.values[key] = value;
  }

  get(key: string) {
    return this.values[key];
  }

  getAll() {
    return this.values;
  }

  async loadConfigSecrets(secrets: { remoteKey: string }[]) {
    return Promise.all(
      secrets.map(async ({ remoteKey }) => {
        let secretKeys = await getSecret(remoteKey);
        Object.keys(secretKeys).forEach(async key => {
          this.set(key, secretKeys[key]);
        });
      }),
    );
  }

  loadConfigValues(values: { [key: string]: any }) {
    Object.keys(values).forEach(key => this.set(key, values[key]));
  }

  validateConfigValues(values: any) {
    const missingKeys = Object.keys(values).filter(key => values[key] === undefined);

    if (missingKeys.length > 0) {
      console.error(`[CONFIG] Missing environment variables: ${missingKeys.join(', ')}`);
      process.exit(1); // Exit the application if any environment variable is missing
    }
  }

  async loadEnvironmentConfig(environmentConfig: {
    secrets: { remoteKey: string }[];
    values: { [key: string]: any };
  }) {
    await this.loadConfigSecrets(environmentConfig.secrets);
    this.loadConfigValues(environmentConfig.values);
  }

  async load() {
    try {
      console.info(`[CONFIG] Loading config...`);

      await this.loadEnvironmentConfig(defaultConfig);

      const { NODE_ENV } = process.env;
      const environment = NODE_ENV ? NODE_ENV : 'default';
      this.set('env', environment);

      console.info(`[CONFIG] Loading config for ${environment} environment...`);

      switch (environment) {
        case 'development':
          await this.loadEnvironmentConfig(developmentConfig);
          break;

        case 'staging':
          await this.loadEnvironmentConfig(stagingConfig);
          break;

        case 'production':
          await this.loadEnvironmentConfig(productionConfig);
          break;

        case 'uat':
          await this.loadEnvironmentConfig(uatConfig);
          break;

        default:
        // throw new ProgrammerError(`No config for environment '${environment}'`);
      }

      this.values.FUSIONAUTH_BASE_URL = 'https://rumor.fusionauth.io';
      this.values.FUSIONAUTH_API_KEY = 'P8pvSKPzEOnl9LexOb6oSPh4AFHyDlFUOzhkX-TndpSvaGuBf3oqPamc';
      this.values.FUSIONAUTH_APP_ID = '652bc577-18fd-4c6b-bc68-0a175c7a8da9';
      this.values.FUSIONAUTH_CLIENT_SECRET = 'hQFDad7G983okH3uHNX8HbUaWDZPZkdZW0E6OEyMAJc';
      this.values.FUSIONAUTH_GATEWAY_URI = 'https://uatapi.therumor.com';
      this.values.FUSIONAUTH_TENANT_ID = '3740bb12-e984-4ff1-937e-cd090b5ed0e4';

      //       FUSIONAUTH_API_KEY
      // P8pvSKPzEOnl9LexOb6oSPh4AFHyDlFUOzhkX-TndpSvaGuBf3oqPamc
      // FUSIONAUTH_APP_ID
      // 652bc577-18fd-4c6b-bc68-0a175c7a8da9
      // FUSIONAUTH_BASE_URL
      // https://rumor.fusionauth.io
      // FUSIONAUTH_CLIENT_SECRET
      // hQFDad7G983okH3uHNX8HbUaWDZPZkdZW0E6OEyMAJc
      // FUSIONAUTH_GATEWAY_URI
      // https://uatapi.therumor.com
      // FUSIONAUTH_TENANT_ID
      // 3740bb12-e984-4ff1-937e-cd090b5ed0e4

      console.info(`[CONFIG] Successfully loaded config.`);

      // Validate config values after loading
      this.validateConfigValues(this.values);
    } catch (err) {
      console.error('[CONFIG] Error loading config', err);
    }
  }
}

const config = new Config();

export default config;
