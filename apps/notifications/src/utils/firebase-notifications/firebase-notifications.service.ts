import * as firebase from 'firebase-admin';
import { PushNotificationPayload } from './firebase-notifications.interface';
import config from '../../config';

class FirebaseNotificationsService {
  private static app: firebase.app.App | null = null;

  private getFirebaseApp(): firebase.app.App {
    if (!FirebaseNotificationsService.app) {
      FirebaseNotificationsService.app = firebase.initializeApp({
        credential: firebase.credential.cert({
          projectId: config.get('FIREBASE_PROJECT_ID'),
          clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: config.get(`FIREBASE_PRIVATE_KEY`)?.replace(/\\n/g, '\n'),
        }),
      });
    }
    return FirebaseNotificationsService.app;
  }

  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Validar que haya tokens antes de enviar
      if (!payload.tokens || payload.tokens.length === 0) {
        console.log('There are no tokens to send notifications to.');
        return true;
      }

      const firebaseApp = this.getFirebaseApp();
      const response = await firebaseApp.messaging().sendEachForMulticast({
        tokens: payload.tokens,
        data: { ...payload.data },
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
      });

      if (response.successCount !== payload.tokens.length) {
        const failures = response.responses.filter(res => !res.success);
        console.warn(`Some push notifications failed: ${JSON.stringify(failures)}`);
      }

      return true;
    } catch (err) {
      console.error('Error sending push notification:', err);
      return false;
    }
  }
}

// Export an instance to use in Express routes
const firebaseNotificationsService = new FirebaseNotificationsService();
export default firebaseNotificationsService;
