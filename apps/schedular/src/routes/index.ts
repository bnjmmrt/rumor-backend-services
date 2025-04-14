import * as express from 'express';
import { Router } from 'express';
import { SchedulerController } from '../controllers/schedular.controller';

const router: Router = express.Router();

router.post('/schedular/trigger', SchedulerController.triggerSchedulerJob);
export default router;
