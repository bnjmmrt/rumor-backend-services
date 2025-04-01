import serviceMesh from '../server/helpers/serviceMeshHandler';
import { extractDate } from './event.utils';
import config from '../config';
import { AxiosResponse } from 'axios';

interface MailComponent {
  eventDate: Date;
  eventName: string;
  imageFlyer: string;
  location: string;
  city: string;
  hostName?: string | undefined;
  emailsData?:
    | {
        eventId?: string | undefined;
        id: string;
        firstName: string;
        email: string;
      }
    | undefined;
}

export const sendEventInviteMember = (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, location, city, hostName, emailsData } = mailComponents;
  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'day_of_week',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    { key: 'host_name', value: hostName },
  ];
  const data = emailsData;
  const redirectPath = `users/${data.id}/events/${data.eventId}`;
  params.push(
    { key: 'first_name', value: data.firstName },
    {
      key: 'view_event',
      value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
    },
  );
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Member: Event Invite Recieved', [data.email.trim()], null);
  } catch (error) {}
};

export const sendEventInviteNonMember = (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, location, city, hostName, emailsData } = mailComponents;
  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'day_of_week',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    { key: 'host_name', value: hostName },
  ];
  const data = emailsData;
  const redirectPath = `users/${data.id}/events/${data.eventId}`;
  params.push(
    { key: 'first_name', value: data.firstName },
    {
      key: 'link_to_application',
      value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
    },
  );
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Non-Member: Event Invite Recieved',
        [data.email.trim()],
        null,
      );
  } catch (error) {}
};

export const sendEventCancellation = (
  mailComponents: MailComponent,
  email: string,
  guestName: string,
  message: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, location, city, hostName } = mailComponents;
  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'first_name',
      value: guestName,
    },
    {
      key: 'custom_message',
      value: message,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'day_of_week',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'host_name',
      value: hostName,
    },
  ];
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Event Cancelation Notification', [email.trim()], null);
  } catch (err) {}
};

export const sendEventUpdation = (
  mailComponents: MailComponent,
  email: string,
  userId: string,
  eventId: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const redirectPath = `users/${userId}/events/${eventId}`;
  const { eventDate, eventName, imageFlyer, location, city } = mailComponents;

  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'day_of_week',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'view_event',
      value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
    },
  ];

  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Event Info Updated', [email.trim()], null);
  } catch (err) {}
};

export const sendEventInvitePlusOnes = (
  mailComponents: MailComponent,
  addOnData: any,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { email, userId, firstName, eventId, leadGuestName } = addOnData;
  const redirectPath = `users/${userId}/events/${eventId}`;
  const { eventDate, eventName, imageFlyer, location, city, hostName } = mailComponents;
  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'first_name',
      value: firstName,
    },
    {
      key: 'host_name',
      value: hostName,
    },
    {
      key: 'lead_guest_name',
      value: leadGuestName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'day_of_week',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'link_to_application',
      value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
    },
  ];

  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Non-Member: Invited as Plus ones by Member',
        [email.trim()],
        null,
      );
  } catch (err) {}
};

export const sendGuestEventApproval = (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, location, city, emailsData } = mailComponents;

  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'first_name',
      value: emailsData.firstName,
    },
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'dayOfWeek',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'link_to_application',
      value: config.get('RUMOR_WEBSITE'),
    },
  ];

  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'User Event Request Approved',
        [emailsData.email.trim()],
        null,
      );
  } catch (err) {}
};

export const sendEventAnnouncement = (
  firstName: string,
  hostName: string,
  eventName: string,
  eventId: string,
  email: string,
): Promise<AxiosResponse<any, any>> => {
  const redirectPath = `event-announcement?id=${eventId}`;
  const params = [
    { key: 'event', value: eventName },
    { key: 'host', value: hostName },
    { key: 'recipient_first_name', value: firstName },
    { key: 'url_button', value: redirectPath },
  ];
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'New Event Announcement', [email.trim()], null);
  } catch (error) {}
};

export const sendEventPublishedApproval = (
  mailComponents: MailComponent,
  email: string,
  companyName: string,
  eventId: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, location, city } = mailComponents;
  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const redirectPath = `events/event-details?id=${eventId}`;
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'company_name',
      value: companyName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'dayOfWeek',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'view_event',
      value: config.get('RUMOR_WEBSITE_HOST') + `${redirectPath}`,
    },
  ];
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Host Event Approved by Admin - Published',
        [email.trim()],
        null,
      );
  } catch (e) {}
};

export const sendEventPrePublishApproval = (
  mailComponents: MailComponent,
  email: string,
  companyName: string,
  eventId: string,
  publishDate: Date,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, location, city } = mailComponents;
  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const publishDateData = extractDate(publishDate, timeZone);
  const redirectPath = `events/event-details?id=${eventId}`;
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'company_name',
      value: companyName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'dayOfWeek',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'publish_date',
      value: `${publishDateData.dayOfWeek}, ${publishDateData.month} ${publishDateData.day} `,
    },
    {
      key: 'publish_time',
      value: `${publishDateData.hour}: ${publishDateData.minutes} ${publishDateData.period}`,
    },
    {
      key: 'view_event',
      value: config.get('RUMOR_WEBSITE_HOST') + `${redirectPath}`,
    },
  ];
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Host Event Approved by Admin - Pre-Publish',
        [email.trim()],
        null,
      );
  } catch (e) {}
};

export const sendEventRejection = (
  eventName: string,
  hostName: string,
  email: string,
): Promise<AxiosResponse<any, any>> => {
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'host_name',
      value: hostName,
    },
  ];
  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Host Event Rejected by Admin', [email.trim()], null);
  } catch (e) {}
};

export const sendEventReminder = (
  mailComponents: MailComponent,
  email: string,
  userId: string,
  eventId: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const redirectPath = `users/${userId}/events/${eventId}`;
  const { eventDate, eventName, imageFlyer, location, city } = mailComponents;

  const { month, day, dayOfWeek, hour, minutes, period } = extractDate(eventDate, timeZone);
  const params = [
    {
      key: 'event_name',
      value: eventName,
    },
    {
      key: 'image_url',
      value: imageFlyer,
    },
    {
      key: 'month',
      value: month,
    },
    {
      key: 'day',
      value: day,
    },
    {
      key: 'day_of_week',
      value: dayOfWeek,
    },
    {
      key: 'hour',
      value: hour,
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: `${location}, ${city}`,
    },
    {
      key: 'view_event',
      value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
    },
  ];

  try {
    return serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Event 24 Hour Reminder', [email.trim()], null);
  } catch (err) {}
};
