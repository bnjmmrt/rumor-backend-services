import * as express from 'express';
import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/auth/admin/login', async (req: Request, res: Response) => {
  let loginData = await AuthController.login(req.body);
  res.json(loginData)
})

export default router;