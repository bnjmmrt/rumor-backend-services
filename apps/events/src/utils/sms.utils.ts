import { isValidPhoneNumber } from 'rumor-utils/utils/file-utils';
import serviceMesh from '../server/helpers/serviceMeshHandler';

interface SmsComponent {
  textMessage: string;
  phoneNumber: string;
}

export const sendSmsNotification = async (
  smsComponent: SmsComponent,
): Promise<{ success: boolean }> => {
  try {
    const { phoneNumber, textMessage } = smsComponent;
    const validateNumber = isValidPhoneNumber(phoneNumber);
    if (validateNumber) {
      const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, '').trim();
      await serviceMesh.notificationService().sendTextMessage(cleanedNumber, textMessage);
      return {
        success: true,
      };
    } else {
      // Log the issue and exit early (no throw)
      console.log(
        `:warning: Skipping SMS: Invalid phone number "${phoneNumber}". Missing country code?`,
      );
      return {
        success: false,
      }; // or just skip sending, depending on your function structure
    }
  } catch (err) {
    return {
      success: false,
    };
  }
};
