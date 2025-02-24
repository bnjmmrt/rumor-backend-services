import getSecret from '../utils/aws/secretsManager';
import defaultConfig from './default';
import developmentConfig from './development';
import stagingConfig from './staging';
import productionConfig from './production';
// import { ProgrammerError } from '../utils/errors';

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
                let secretKeys = await getSecret(remoteKey)
                Object.keys(secretKeys).forEach(async key => {
                    this.set(key, secretKeys[key])
                })
            })
        );
    }

    loadConfigValues(values: { [key: string]: any }) {
        Object.keys(values).forEach(key => this.set(key, values[key]));
    }

    validateConfigValues(values: any) {
        const missingKeys = Object.keys(values).filter((key) => values[key] === undefined);
    
        if (missingKeys.length > 0) {
          console.error(`[CONFIG] Missing environment variables: ${missingKeys.join(", ")}`);
          process.exit(1); // Exit the application if any environment variable is missing
        }
    }

    async loadEnvironmentConfig(environmentConfig: { secrets: { remoteKey: string }[], values: { [key: string]: any } }) {
        await this.loadConfigSecrets(environmentConfig.secrets);
        this.loadConfigValues(environmentConfig.values);
    }

    async load() {
        try {

            console.info(`[CONFIG] Loading config...`);

            await this.loadEnvironmentConfig(defaultConfig);

            const { NODE_ENV } = process.env;
            const environment = NODE_ENV  ? NODE_ENV : 'default';
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

                default:
                    // throw new ProgrammerError(`No config for environment '${environment}'`);
            }

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
