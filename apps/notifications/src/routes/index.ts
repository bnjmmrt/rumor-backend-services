import { Router } from "express";
import * as express from "express";
import { CommunicationController } from "../controllers/communication.controller";
const router: Router = express.Router();


router.post('/send-verification-code', CommunicationController.sendVerificationCode);
router.post('/verify-code', CommunicationController.verifyCode);
router.post('/send-invitation-messages', CommunicationController.sendInvitationMessages);
router.post('/send-text-message', CommunicationController.sendTextMessage);
router.post('/template-email/send', CommunicationController.sendEmailFromTemplate);
router.post('/template-email', CommunicationController.createEmailTemplate);
router.get('/template-emails', CommunicationController.listEmailTemplates);
router.delete('/template-email', CommunicationController.deleteEmailTemplate);
router.post('/get-email-template', CommunicationController.getEmailTemplate);

export default router;