export enum NotificationDeliveryType {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULED = 'SCHEDULED',
}

export enum NotificationDeliveryChannel {
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum AdminNotificationRecipients {
  MEMBERS = 'MEMBERS',
  HOSTS = 'HOSTS',
  NON_MEMBERS = 'NON_MEMBERS',
}

/*
Redefined enum below
export enum NotificationType {
  SMS = 0,
  EMAIL = 1,
  PUSH = 2,
  UNRECOGNIZED = -1,
} */

export enum RecipientsType {
  MEMBERS = 0,
  HOSTS = 1,
  NON_MEMBERS = 2,
  UNRECOGNIZED = -1,
}

export enum NotificationStatus {
  SENT = 0,
  SCHEDULED = 1,
  INACTIVE = 2,
  ACTIVE = 3,
  DRAFT = 4,
  UNRECOGNIZED = -1,
}

export enum NotificationSource {
  AUTOMATED = 0,
  CUSTOM = 1,
  UNRECOGNIZED = -1,
}

export enum NotificationType {
  APPLICATION_APPOVED = 'applicationAppoved',
  PROFILE_REFERRALS = 'profileReferrals',
  EVENT_REMINDER = 'eventReminder',
  EVENT_CANCELLED = 'eventCancelled',
  EVENT_INVITATION = 'eventInvitation',
  EVENT_INVITATION_NON_MEMBER = 'eventInvitationNonMember',
  EVENT_POSTED = 'eventPosted',
  EVENT_POSTED_CITY = 'eventPostedCity',
  EVENT_REQUEST_APPROVED = 'eventRequestApproved',
  EVENT_REQUEST_DENIED = 'eventRequestDenied',
  EVENT_VOUCH = 'eventVouch',
  EVENT_ANNOUNCEMENT = 'eventAnnouncement',
  SIGNUP_FORM_APPROVED = 'signUpFormApproved',
  SIGNUP_FORM_REJECTED = 'signUpFormRejected',
  USER_APPLICATION = 'userApplication',
  HOST_APPLICATION = 'hostApplication',
  EVENT_SUBMITTED = 'eventSubmitted',
  EVENT_EDITED = 'eventEdited',
  HOST_REPORT = 'hostReport',
  HOST_FEEDBACK = 'hostFeedback',
  USER_REPORT = 'userReport',
  USER_FEEDBACK = 'userFeedback',
  EVENT_SUBMISSION_APPROVED = 'eventSubmissionApproved',
  EVENT_APPROVED = 'eventApproved',
  NEW_GUEST_REQUEST = 'newGuestRequest',
  RSVP_SIGNUP_FORM_REQUEST = 'rsvpSignupFormRequest',
  MANUAL_ADMIN_NOTIFICATION = 'manualAdminNotification',
}

/** Generic Response */
export interface GenericResponse {
  status: number;
  error?: Error | undefined;
}

/** Error */
export interface Error {
  type: string;
  message: string;
}

export interface CreateAdminNotificationRequest {
  title?: string;
  message: string;
  scheduledDate?: string;
  recipients: AdminNotificationRecipients[];
  channels: NotificationDeliveryChannel[];
  deliveryType: NotificationDeliveryType;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  date: string;
  time: string;
  type: NotificationType[];
  recipients: RecipientsType[];
  emails: string[];
  userIds: string[];
  source?: NotificationSource | undefined;
  templateId?: string | undefined;
}

export interface NotificationData {
  title?: string | undefined;
  message?: string | undefined;
  date?: string | undefined;
  time?: string | undefined;
  type: NotificationType[];
  recipients: RecipientsType[];
  emails: string[];
  userIds: string[];
  status?: NotificationStatus | undefined;
  source?: NotificationSource | undefined;
  templateId?: string | undefined;
  id?: string | undefined;
}

export interface RequestById {
  id: string;
}

export interface GetNotificationResponse {
  status: number;
  error?: Error | undefined;
  data?: NotificationData | undefined;
}

export interface ListNotificationsRequest {
  query?: string | undefined;
}

export interface ListNotificationsResponse {
  status: number;
  error?: Error | undefined;
  data: NotificationData[];
}

export interface SendPushNotificationRequest {
  userId: string;
  title: string;
  body: string;
}
