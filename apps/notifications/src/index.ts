require('dotenv').config();
import config from './config';
import server from './server';
import connectionManager from './database';
import { SeedDatabase } from './seeders';

const start = async () => {
  console.info('[APP] - Starting application...');
  try {
    await config.load();
    await connectionManager.initializeDbConnection();
    if (config.get('runMigrations')) {
      await connectionManager.runMigrations();
    }

    if (config.get('runSeeds')) {
      await connectionManager.runSeeders();
    }

    await SeedDatabase.seed();
    await server.start();
    console.info('[APP] - Application started. 🚀');
  } catch (err) {
    console.error('[APP] - Failed starting application. Exiting... 👋', err);
    process.exit(1);
  }
};

start();
