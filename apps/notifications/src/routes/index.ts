import { Router } from "express";
import * as express from "express";
import { CommunicationController } from "../controllers/communication.controller";
import { NotificationController } from "../controllers/notification.controller";
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

/**
 * Route for Notification Creation - Will be used in service Mesh for interservice communication call
 */

router.post('/notification/create',NotificationController.createNotification);

/**
 * Routes for  - Will be used by user apps - host, member
 */

router.get('/notifications', NotificationController.getAllNotifications);
router.get('/notification:notificationId', NotificationController.getNotificationDetail);
router.delete('/notification/:notificationId',NotificationController.deleteNotificationById);

/**
 * Routes for  - Will be used by admin
 */
router.get('/notifications-list', NotificationController.listNotifications);
router.get('/notifications/summary', NotificationController.getNotificationSummary);
router.delete('/notifications/bulk-delete', NotificationController.deleteMultipleNotifications);


export default router;