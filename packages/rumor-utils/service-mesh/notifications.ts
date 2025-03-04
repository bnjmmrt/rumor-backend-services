import apiService from './apiService';

export const sendVerificationCode = (baseURL:string, phoneNumber: string) => apiService.getApi().post(`${baseURL}/send-verification-code`, { phoneNumber });

export const verifyPhoneNumber = (baseURL:string, phoneNumber: string, code: string) => apiService.getApi().post(`${baseURL}/auth/validate`, { phoneNumber, code });

export const sendInvitationMessages = (baseURL:string, phoneNumbers: string[], senderName: string) => apiService.getApi().post(`${baseURL}/auth/validate`, { phoneNumbers, senderName });

export const sendTextMessage = (baseURL:string, phoneNumber: string, message: string) => apiService.getApi().post(`${baseURL}/auth/validate`, { phoneNumber, message });

export const sendEmailFromTemplate = (baseURL:string, dynamicData, template: string, to: string[], from?: string) => apiService.getApi().post(`${baseURL}/auth/validate`, { dynamicData, template, to, from });

export const getTemplateById = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/auth/validate`);

export const sendPushNotification = (baseURL:string, tokens: string[], title: string, body: string) => apiService.getApi().post(`${baseURL}/auth/validate`, { tokens, title, body });