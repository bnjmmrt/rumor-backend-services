// import { Injectable, Logger } from '@nestjs/common';
// import * as firebase from 'firebase-admin';
// import { ConfigService } from '@nestjs/config';
// import { PushNotificationPayload } from './firebase-notifications.interface';

// @Injectable()
// export class FirebaseNotificationsService {
//   private readonly logger = new Logger(FirebaseNotificationsService.name);

//   constructor(private readonly configService: ConfigService) {
//     firebase.initializeApp({
//       credential: firebase.credential.cert({
//         projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
//         clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
//         privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
//       }),
//     });
//   }

//   async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
//     try {
//       const response = await firebase.messaging().sendEachForMulticast({
//         tokens: payload.tokens,
//         webpush: {
//           notification: {
//             title: payload.title,
//             body: payload.body,
//           },
//         },
//       });

//       if (response.successCount !== payload.tokens.length) {
//         const firebaseResponses = response.responses;
//         const failures = firebaseResponses.filter((response) => !response.success);
//         // not returning a failure here as a notification could fail to send due to several reasons like
//         // expired tokens, unregistered tokens (on app uninstall etc.). If the request is successful, we will
//         // consider it as a success
//         this.logger.warn(`some push notification failed to send, failures: ${JSON.stringify(failures)}`);
//       }

//       return true;
//     } catch (err) {
//       this.logger.error(err);
//       return false;
//     }
//   }
// }


import * as firebase from "firebase-admin";
import dotenv from "dotenv";
import { PushNotificationPayload } from './firebase-notifications.interface';

dotenv.config(); // Load environment variables from .env file


class FirebaseNotificationsService {
  constructor() {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      const response = await firebase.messaging().sendEachForMulticast({
        tokens: payload.tokens,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
          },
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
export const firebaseNotificationsService = new FirebaseNotificationsService();
