import * as express from 'express';
import { Router } from 'express';
import { SchedulerController } from '../controllers/scheduler.controller';

const router: Router = express.Router();

router.post('/scheduler/trigger', SchedulerController.triggerSchedulerJob);
export default router;
