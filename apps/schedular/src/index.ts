require('dotenv').config();
import config from './config';
import server from './server';
import database from './database';
import { SchedulerService } from './services/scheduler-service';

const start = async () => {
  console.info('[APP] - Starting application...');
  try {
    await config.load();
    await database.initializeDbConnection();

    await server.start();
    await SchedulerService.scheduleEventOnServerRestart();
    console.info('[APP] - Application started. 🚀');
  } catch (err) {
    console.error('[APP] - Failed starting application. Exiting... 👋', err);
    process.exit(1);
  }
};

start();
