import * as express from "express";
import { Express, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import * as cors from "cors";
import router from "../routes/index";
import { globalErrorHandler } from "rumor-utils/middlewares/global-error-handler.middleware";

// import context from 'express-http-context';
// import bookingRoutes from '../services/bookings/routes';
// import reportRoutes from '../services/reports/routes';
// import schoolRoutes from '../services/schools/routes';
// import userRoutes from '../services/users/routes';
// import sharedRoutes from '../services/shared/routes';
// import errorHandler from './middleware/errorHandler';
// import { NotFoundEndpointError } from '../utils/errors';
// import bugsnag from '../utils/bugsnag';

const app: Express = express();

app.get("/events/v1/health", (req: Request, res: Response) => {
  res.sendStatus(200);
});

app.use("/events/v1", router);

// const bugsnagMiddleware = bugsnag.getPlugin('express');
// app.use(bugsnagMiddleware.requestHandler);

app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // Pass to next layer of middleware
  next();
});

app.use(helmet());
app.use(bodyParser.json());
// app.use(context.middleware);

// app.use(router);

// app.get('*', (req: Request, res: Response, next: NextFunction) => next(new NotFoundEndpointError(req.path)));

app.use(globalErrorHandler);

export default app;
