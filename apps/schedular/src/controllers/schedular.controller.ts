// scheduler.controller.ts
import { Request, Response } from 'express';
import { SchedulerService } from '../services/scheduler-service';
import asyncWrapper from '../server/helpers/asyncWrapper';
import {
  CreateResponse,
} from 'rumor-utils/success';

export class SchedulerController {
  public static triggerSchedulerJob = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const response: string = await SchedulerService.triggerJob(req.body);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );
}
