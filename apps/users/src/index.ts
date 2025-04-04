require('dotenv').config();
import config from './config';
import server from './server';
import database from './database';
import { Seeders } from './seeders';

const start = async () => {
  console.info('[APP] - Starting application...');
  try {
    await config.load();
    await database.initializeDbConnection();
    await Seeders.seedRoles();
    await Seeders.seedInterests();
    await Seeders.seedFocuses();

    await server.start();
    console.info('[APP] - Application started. 🚀');
  } catch (err) {
    console.error('[APP] - Failed starting application. Exiting... 👋', err);
    process.exit(1);
  }
};

start();
