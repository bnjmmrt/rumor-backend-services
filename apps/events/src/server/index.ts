import app from './app';
import config from '../config';

const start = async () => {
  const port = config.get('PORT');
  console.info('[SERVER] Starting server...');
  return new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => {
        console.info('[SERVER] Server started on port:', port);
        resolve(server);
      })
      .on('error', (err: Error) => {
        console.error('[SERVER] Failed starting server:', err.message);
        reject(err);
      });

    const shutdown = () => {
      console.info('[SERVER] Shutdown signal received. Closing server...');
      server.close(() => {
        console.info('[SERVER] Server closed gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown); 
    process.on('SIGINT', shutdown);
  });
};

export default { start };
