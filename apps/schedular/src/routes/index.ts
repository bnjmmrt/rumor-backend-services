import * as express from 'express';
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { RoleController } from '../controllers/role.controller';
import { SettingsController } from '../controllers/settings.controller';
import { SocialController } from '../controllers/social.controller';
import AuthMiddleware from '../server/middleware/auth';
import { PlatformController } from '../controllers/platform.controller';
import { ReferralRequestController } from '../controllers/referral-request.controller';
import { ReferralCodeController } from '../controllers/referral-code.controller';
import FilesController from '../controllers/files.controller';


const router: Router = express.Router();

// Admin routes
router.get('/auth/admin/members', AuthMiddleware.fusionAuthRequired, AdminController.getMembers);
