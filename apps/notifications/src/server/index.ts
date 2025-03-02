import app from './app';
import config from '../config';

const start = async () => {
    const port = config.get('PORT');
    console.info('[SERVER] Starting server...');
    return new Promise((resolve, reject) => {
        const server = app
            .listen(port, () => {
                console.info('[SERVER] Server started on port: ', port);
                resolve(server);
            })
            .on('error', (err: Error) => {
                console.info('[SERVER] Failed starting server:', err.message);
                reject(err);
            });
    });
};

export default { start };
