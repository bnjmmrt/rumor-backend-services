import { Router } from "express";
import * as express from "express";
import { CommunicationController } from "../controllers/communication.controller";
const router: Router = express.Router();


router.post('/communication/send-verification-code', CommunicationController.sendVerificationCode);
router.post('/communication/verify-code', CommunicationController.verifyCode);
router.post('/communication/send-invitation-messages', CommunicationController.sendInvitationMessages);
router.post('/communication/send-text-message', CommunicationController.sendTextMessage);
router.post('/communication/template-email/send', CommunicationController.sendEmailFromTemplate);
router.post('/communication/template-email', CommunicationController.createEmailTemplate);
router.get('/communication/template-emails', CommunicationController.listEmailTemplates);
router.delete('/communication/template-email', CommunicationController.deleteEmailTemplate);
router.post('/get-email-template', CommunicationController.getEmailTemplate);

export default router;