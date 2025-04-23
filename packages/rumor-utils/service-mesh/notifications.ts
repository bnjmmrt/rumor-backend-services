import apiService from './apiService';

export const sendVerificationCode = (phoneNumber: string) =>
  apiService.getApi().post(`/communication/send-verification-code`, { phoneNumber });

// export const verifyPhoneNumber = (phoneNumber: string, code: string) => apiService.getApi().post(`/auth/validate`, { phoneNumber, code });

export const verifyCode = (phoneNumber: string, code: string) =>
  apiService.getApi().post(`/communication/verify-code`, { phoneNumber, code });

export const sendInvitationMessages = (phoneNumbers: string[], senderName: string) =>
  apiService.getApi().post(`/communication/send-invitation-messages`, { phoneNumbers, senderName });

export const sendTextMessage = (phoneNumber: string, message: string) =>
  apiService.getApi().post(`/communication/send-text-message`, { phoneNumber, message });

export const sendEmailFromTemplate = (dynamicData, template: string, to: string[], from?: string) =>
  apiService
    .getApi()
    .post(`/communication/template-email/send`, { dynamicData, template, to, from });

export const getTemplateById = (id: string) => apiService.getApi().get(`/auth/validate`);

export const sendPushNotification = (tokens: string[], title: string, body: string) =>
  apiService.getApi().post(`/auth/validate`, { tokens, title, body });

export const sendNotification = (
  notificationType: string,
  recipients: string | string[],
  linkedEventId?: string,
  linkedUserId?: string,
  linkedHostId?: string,
) =>
  apiService
    .getApi()
    .post(`/notification`, {
      notificationType,
      recipients,
      linkedEventId,
      linkedUserId,
      linkedHostId,
    });
