/* eslint-disable global-require */
import config from './config'
import server from './server';
import database from './database';

const start = async () => {
    console.info('[APP] - Starting application...');
    try {
        await config.load();
        await database.initializeDbConnection();

        await server.start();
        console.info('[APP] - Application started. 🚀');
    } catch (err) {
        console.error('[APP] - Failed starting application. Exiting... 👋',err);
        process.exit(1);
    }
};

start();
