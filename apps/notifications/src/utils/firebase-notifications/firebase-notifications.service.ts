import * as firebase from "firebase-admin";
import { PushNotificationPayload } from './firebase-notifications.interface';
import config from '../../config'

class FirebaseNotificationsService {
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: config.get('FIREBASE_PROJECT_ID'), 
        clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: config.get(`FIREBASE_PRIVATE_KEY`)?.replace(/\\n/g, "\n"),
      }),
    });

    try {
      const response = await firebase.messaging().sendEachForMulticast({
        tokens: payload.tokens,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            image: payload.image
          },
        },
        notification: {
          title: payload.title, 
          body: payload.body,
          imageUrl: payload.image
        },
      });

      if (response.successCount !== payload.tokens.length) {
        const failures = response.responses.filter((res) => !res.success);
        console.warn(`Some push notifications failed: ${JSON.stringify(failures)}`);
      }

      return true;
    } catch (err) {
      console.error("Error sending push notification:", err);
      return false;
    }
  }
}

// Export an instance to use in Express routes
const firebaseNotificationsService = new FirebaseNotificationsService();
export default firebaseNotificationsService;