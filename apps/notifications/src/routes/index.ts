import { Router, Request, Response } from "express";
import * as express from "express";
import { EventAnnouncementController } from "../controllers/event-announcement.controller";
import { SignupFormsController } from "../controllers/signup-forms.controller";
import CommunicationService from "../services/communication.service";

const router: Router = express.Router();


router.post('/send-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/send-invitation-messages', sendInvitationMessages);
router.post('/send-text-message', sendTextMessage);
router.post('/send-email-from-template', sendEmailFromTemplate);
router.post('/create-email-template', createEmailTemplate);
router.get('/list-email-templates', listEmailTemplates);
router.post('/delete-email-template', deleteEmailTemplate);
router.post('/get-email-template', getEmailTemplate);

export default router;