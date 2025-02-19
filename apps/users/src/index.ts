/* eslint-disable global-require */
require("dotenv").config();
import config from './config'
import server from './server';
import { connectionManager, initializeDataSource } from './database';

const start = async () => {
    console.info('[APP] - Starting application...');
    try {
        await config.load();
        await initializeDataSource();
        await connectionManager.initializeDbConnection();

        await server.start();
        console.info('[APP] - Application started. 🚀');
    } catch (err) {
        console.error('[APP] - Failed starting application. Exiting... 👋',err);
        process.exit(1);
    }
};

start();
