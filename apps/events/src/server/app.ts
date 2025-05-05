import * as express from 'express';
import { Express, Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as cors from 'cors';
import router from '../routes/index';
import errorHandler from 'rumor-utils/middlewares/global-error-handler.middleware';
import { NotFoundError } from 'rumor-utils/errors/not-found.error';
import ConnectionManager from '../database/index';

const app: Express = express();
app.use(bodyParser.json());

app.use(helmet());

app.use(
  cors({
    origin: '*', // Allows any domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.get('/events/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', timestamp: new Date() }).status(200);
});

app.get('/events/v1/db-health',async (req: Request, res: Response) => {
  const dbRepository = await ConnectionManager.getRepository('events').query('SELECT 1');
  res.json({ status: dbRepository ? 'UP' : 'DOWN', timestamp: new Date() }).status(200);
})

app.use('/events/v1', router);
app.get('*', (req: Request, res: Response, next: NextFunction) =>
  next(new NotFoundError(req.path)),
);
app.use(errorHandler);

export default app;
