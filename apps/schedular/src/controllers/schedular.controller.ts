// scheduler.controller.ts
import { Request, Response } from 'express';
import { SchedulerService } from '../services/scheduler-service';
import asyncWrapper from 'src/server/helpers/asyncWrapper';
import {
  CreateResponse,
  DeleteResponse,
  GetResponse,
  UpdateResponse,
} from 'rumor-utils/success';

export class SchedulerController {
  public static triggerSchedulerJob = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      console.log('inside scheduler');
      const response: any = await SchedulerService.triggerJob(req.body);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );
}
