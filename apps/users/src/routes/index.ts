import * as express from 'express';
import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router: Router = express.Router();

router.get('/admin/login',(req: Request, res: Response) => {
  AuthController.login(req.body);
})

export default router;