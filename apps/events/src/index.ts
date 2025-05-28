require('dotenv').config();
import config from './config';
import server from './server';
import connectionManager from './database';
import { Seeders } from './seeders';

const start = async () => {
  console.info('[APP] - Starting application...');
  try {
    await config.load();
    await connectionManager.initializeDbConnection();
    if (config.get('runMigrations')) {
      await connectionManager.runMigrations();
    }
    await Seeders.seedEventTypes();
    await Seeders.seedEventAgeLimits();
    await Seeders.seedSignupFormStaticQuestions();
    await Seeders.seedEventBranchLinks();
    await Seeders.seedSponsorshipCategories();
    if (config.get('runSeeds')) {
      await connectionManager.runSeeders();
    }

    await server.start();
    console.info('[APP] - Application started. 🚀');
  } catch (err) {
    console.error('[APP] - Failed starting application. Exiting... 👋', err);
    process.exit(1);
  }
};

start();
