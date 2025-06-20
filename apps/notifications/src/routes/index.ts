import { Router } from 'express';
import * as express from 'express';
import { CommunicationController } from '../controllers/communication.controller';
import { NotificationController } from '../controllers/notification.controller';
import { AdminNotificationController } from '../controllers/admin-notification.controller';
import AuthMiddleware from '../server/middleware/auth';

const router: Router = express.Router();

/**
 * @description - Routes used for sending Text Messages
 */

router.post('/communication/send-verification-code', CommunicationController.sendVerificationCode);
router.post('/communication/verify-code', CommunicationController.verifyCode);
router.post(
  '/communication/send-invitation-messages',
  CommunicationController.sendInvitationMessages,
);
router.post('/communication/send-text-message', CommunicationController.sendTextMessage);

/**
 * @description - Route for sending email using template ID
 */
router.post('/communication/template-email/send', CommunicationController.sendEmailFromTemplate);

/**
 * @description - Routes for managing Email Templates
 */
router.post('/communication/template-email', CommunicationController.createEmailTemplate);
router.get('/communication/template-emails', CommunicationController.listEmailTemplates);
router.delete('/communication/template-email', CommunicationController.deleteEmailTemplate);
router.get('/get-email-template', CommunicationController.getEmailTemplate);

/**
 * Route for Sending the Notification - Will be used in service Mesh for interservice communication call
 */
router.post('/notification', NotificationController.sendNotification);

/**
 * Route for Testing the Push Notifications
 */
router.post('/notification/push', NotificationController.sendPushNotification);

/**
 * Route for Notification Creation - Will be used in service Mesh for interservice communication call
 */

// router.post('/notification', NotificationController.createNotification);

/**
 * Routes for  - User Notifications - Host, Member
 */

router.get('/notifications', AuthMiddleware.fusionAuth, NotificationController.getAllNotifications);
router.get(
  '/notification/:notificationId',
  AuthMiddleware.fusionAuth,
  NotificationController.getNotificationDetail,
);
router.delete(
  '/notification/:notificationId',
  AuthMiddleware.fusionAuth,
  NotificationController.deleteNotificationById,
);

/**
 * Routes for  - Admin Notifications
 */
router.get(
  '/notifications-list',
  AuthMiddleware.fusionAuthRequired,
  NotificationController.listNotifications,
);
router.get(
  '/notifications/summary',
  AuthMiddleware.fusionAuth,
  NotificationController.getNotificationSummary,
);
router.delete(
  '/notifications/bulk-delete',
  AuthMiddleware.fusionAuthRequired,
  NotificationController.deleteMultipleNotifications,
);
//Called from Admin Panel
router.post(
  '/admin-notifications',
  AuthMiddleware.fusionAuthRequired,
  AdminNotificationController.createAdminNotification,
);
router.put(
  '/admin-notifications/:notificationId',
  AuthMiddleware.fusionAuthRequired,
  AdminNotificationController.updateAdminNotification,
);
router.get(
  '/admin-notifications',
  AuthMiddleware.fusionAuthRequired,
  AdminNotificationController.getAllAdminNotifications,
);
router.get(
  '/admin-notifications/:notificationId',
  AuthMiddleware.fusionAuthRequired,
  AdminNotificationController.getAdminNotification,
);
router.delete(
  '/admin-notifications/:notificationId',
  AuthMiddleware.fusionAuthRequired,
  AdminNotificationController.deleteNotificationById,
);
//Interservice call
router.post(
  '/admin-notifications/:notificationId/send',
  AdminNotificationController.sendAdminNotification,
);

export default router;
