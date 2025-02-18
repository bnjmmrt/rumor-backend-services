/* eslint-disable global-require */
import config from './config'
import server from './server';
import {connectionManager, initializeDataSource} from './database';

const start = async () => {
    console.info('[APP] - Starting application...');
    try {
        await config.load();
        await initializeDataSource(); // Initialize the database connection
        await connectionManager.initializeDbConnection();
        if (config.get('runMigrations')) {
            await connectionManager.runMigrations();
        }

        if (config.get('runSeeds')) {
            await connectionManager.runSeeders();
        }

        await server.start();
        console.info('[APP] - Application started. 🚀');
    } catch (err) {
        console.error('[APP] - Failed starting application. Exiting... 👋',err);
        process.exit(1);
    }
};

start();
