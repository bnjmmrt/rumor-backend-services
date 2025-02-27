import { Router, Request, Response } from "express";
import * as express from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";
import CommunicationService from "../services/communication.service";

const router: Router = express.Router();

router.get("/send-verification-code", CommunicationService.sendVerificationCode);

export default router;
