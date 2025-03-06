import * as express from "express";
import { Express, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import * as cors from "cors";
import router from "../routes/index";
import errorHandler  from "rumor-utils/middlewares/global-error-handler.middleware";
import { NotFoundError } from "rumor-utils/errors/not-found.error";

const app: Express = express();

app.use(bodyParser.json());

app.use(helmet());

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"], 
    allowedHeaders: ["X-Requested-With", "Content-Type"], 
    credentials: true,
  })
);

app.get("/users/v1/health", (req: Request, res: Response) => {
  res.json({ status: "UP" , timestamp:new Date()}).status(200);
});

app.use("/users/v1", router);

app.get('*', (req: Request, res: Response, next: NextFunction) => next(new NotFoundError(req.path)));
app.use(errorHandler);

export default app;
