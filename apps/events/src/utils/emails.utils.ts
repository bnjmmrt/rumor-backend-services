import serviceMesh from '../server/helpers/serviceMeshHandler';
import { extractDate } from './event.utils';
import config from '../config';
import { AxiosResponse } from 'axios';
import { EventAnnouncementAttachment } from 'rumor-utils/shared/events/interfaces/event.interface';

interface MailComponent {
  eventDate: Date;
  eventName: string;
  imageFlyer: string;
  location?: string | undefined;
  city: string;
  hostName?: string | undefined;
  branchLink?: string;
  emailsData?:
    | {
        eventId?: string | undefined;
        id: string;
        firstName: string;
        email: string;
      }
    | undefined;
}

export const sendEventInviteMember = async (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, city, hostName, emailsData, branchLink } =
    mailComponents;
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
      value: city,
    },
    { key: 'host_name', value: hostName },
  ];
  const data = emailsData;
  const redirectPath = `users/${data.id}/events/${data.eventId}`;
  params.push(
    { key: 'first_name', value: data.firstName },
    {
      key: 'view_event',
      value: branchLink || 'https://app.therumor.com/app',
    },
  );
  try {
    const mailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Member: Event Invite Recieved',
        [data.email.trim().toLowerCase()],
        null,
      );
    return mailData;
  } catch (error) {
    console.log(`Invite New User failed at function sendEventInviteMember:: ${error}`);
  }
};

export const sendEventInviteNonMember = async (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, city, hostName, emailsData, branchLink } =
    mailComponents;
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
      key: 'email',
      value: emailsData.email.trim(),
    },
    {
      key: 'address',
      value: city,
    },
    { key: 'host_name', value: hostName },
  ];
  const data = emailsData;
  const redirectPath = `users/${data.id}/events/${data.eventId}`;
  params.push(
    { key: 'first_name', value: data.firstName },
    {
      key: 'link_to_application',
      value: branchLink || 'https://app.therumor.com/app',
    },
  );
  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Non-Member: Event Invite Recieved',
        [data.email.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (error) {
    console.log(`Invite User as NonMember failed at function sendEventInviteNonMember:: ${error}`);
  }
};

export const sendEventInviteToConfirmedGuest = async (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  try {
    const { eventDate, eventName, imageFlyer, city, hostName, emailsData, branchLink } =
      mailComponents;
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
        key: 'email',
        value: emailsData.email.trim(),
      },
      {
        key: 'address',
        value: city,
      },
      { key: 'host_name', value: hostName },
    ];
    const data = emailsData;
    const redirectPath = `users/${data.id}/events/${data.eventId}`;
    params.push(
      { key: 'first_name', value: data.firstName },
      {
        key: 'view_ticket',
        value: branchLink || 'https://app.therumor.com/app',
      },
    );
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Member + Non-Member:  Added to Confirmed',
        [data.email.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (error) {
    console.log(
      `Invite User as confirmed guest failed at function sendEventInviteToConfirmedGuest:: ${error}`,
    );
  }
};

export const sendEventCancellation = async (
  mailComponents: MailComponent,
  email: string,
  guestName: string,
  message: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, city, hostName } = mailComponents;
  console.log('* ** * hostname', hostName);
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
      value: city,
    },
    {
      key: 'host_name',
      value: hostName || 'Rumor',
    },
  ];
  console.log('* * * ** * * * PARAMS', params);
  try {
    const emaildata = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Event Cancelation Notification',
        [email.trim().toLowerCase()],
        null,
      );
    return emaildata;
  } catch (err) {
    console.log(`Event Cancellation failed at function sendEventCancellation:: ${err}`);
  }
};

export const sendEventUpdation = async (
  mailComponents: MailComponent,
  email: string,
  userId: string,
  eventId: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const redirectPath = `users/${userId}/events/${eventId}`;
  const { eventDate, eventName, imageFlyer, city, branchLink } = mailComponents;

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
      value: city,
    },
    {
      key: 'view_event',
      value: branchLink || 'https://app.therumor.com/app',
    },
  ];

  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Event Info Updated', [email.trim().toLowerCase()], null);
    return emailData;
  } catch (err) {
    console.log(`Event Updation failed at function sendEventUpdation:: ${err}`);
  }
};

export const sendEventInvitePlusOnes = async (
  mailComponents: MailComponent,
  addOnData: any,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { email, userId, firstName, eventId, leadGuestName, branchLink } = addOnData;
  const redirectPath = `users/${userId}/events/${eventId}`;
  const { eventDate, eventName, imageFlyer, city, hostName } = mailComponents;
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
      key: 'email',
      value: email.trim(),
    },
    {
      key: 'minutes',
      value: `${minutes} ${period}`,
    },
    {
      key: 'address',
      value: city,
    },
    {
      key: 'link_to_application',
      value: branchLink || 'https://app.therumor.com/app',
    },
  ];

  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Non-Member: Invited as Plus ones by Member',
        [email.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (err) {
    console.log(`Invite Plus One failed at function sendEventInvitePlusOnes:: ${err}`);
  }
};

export const sendGuestEventApproval = async (
  mailComponents: MailComponent,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, city, emailsData, branchLink } = mailComponents;

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
      value: city,
    },
    {
      key: 'link_to_application',
      value: branchLink || 'https://app.therumor.com/app',
    },
    {
      key: 'email',
      value: emailsData.email,
    },
  ];

  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'User Event Request Approved',
        [emailsData.email.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (err) {
    console.log(`Guest Approval failed at function sendGuestEventApproval:: ${err}`);
  }
};

export const sendEventAnnouncement = async (
  firstName: string,
  hostName: string,
  eventName: string,
  eventId: string,
  email: string,
  branchLink?: string,
  copy?: string,
  attachments?: EventAnnouncementAttachment[],
): Promise<AxiosResponse<any, any>> => {
  const redirectPath = branchLink || 'https://app.therumor.com/app';
  const params = [
    { key: 'event', value: eventName },
    { key: 'host', value: hostName },
    { key: 'recipient_first_name', value: firstName },
    { key: 'url_button', value: redirectPath },
    { key: 'copy', value: copy },
  ];
  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Non-Member: New Event Announcement',
        [email.trim().toLowerCase()],
        null,
        attachments || undefined
      );
    return emailData;
  } catch (error) {
    console.log(`Event Announcement failed at function sendEventInviteMember:: ${error}`);
  }
};

export const sendEventPublishedApproval = async ({
  mailComponents,
  email,
  companyName,
  eventId,
  timeZone,
}: {
  mailComponents: MailComponent;
  email: string;
  companyName: string;
  eventId: string;
  timeZone: string;
}): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, city, branchLink } = mailComponents;
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
      value: city,
    },
    {
      key: 'view_event',
      value: branchLink || config.get('RUMOR_WEBSITE_HOST') + `${redirectPath}`,
    },
  ];
  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Host Event Approved by Admin - Published',
        [email.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (e) {
    console.log(`Event Published Approval failed at function sendEventPublishedApproval:: ${e}`);
  }
};

export const sendEventPrePublishApproval = async ({
  createPayload,
  ownerEmail,
  companyName,
  eventId,
  publishDate,
  timeZone,
}: {
  createPayload: MailComponent;
  ownerEmail: string;
  companyName: string;
  eventId: string;
  publishDate: Date;
  timeZone: string;
}): Promise<AxiosResponse<any, any>> => {
  const { eventDate, eventName, imageFlyer, city, branchLink } = createPayload;

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
      value: city,
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
      value: branchLink || config.get('RUMOR_WEBSITE_HOST') + `/${redirectPath}`,
    },
  ];
  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Host Event Approved by Admin - Pre-Publish',
        [ownerEmail.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (e) {
    console.log(`Event Pre Publish Approval failed at function sendEventPrePublishApproval:: ${e}`);
  }
};

export const sendEventRejection = async (
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
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(
        params,
        'Host Event Rejected by Admin',
        [email.trim().toLowerCase()],
        null,
      );
    return emailData;
  } catch (e) {
    console.log(`Event Rejection failed at function sendEventRejection:: ${e}`);
  }
};

export const sendEventReminder = async (
  mailComponents: MailComponent,
  email: string,
  userId: string,
  eventId: string,
  timeZone: string,
): Promise<AxiosResponse<any, any>> => {
  const redirectPath = `users/${userId}/events/${eventId}`; //TODO  : this should be view rsvp button url (need to update)
  const { eventDate, eventName, imageFlyer, city, branchLink } = mailComponents;

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
      value: city,
    },
    {
      key: 'view_rsvp',
      value: branchLink || 'https://app.therumor.com/app',
    },
  ];

  try {
    const emailData = await serviceMesh
      .notificationService()
      .sendEmailFromTemplate(params, 'Event 24 Hour Reminder', [email.trim().toLowerCase()], null);
    return emailData;
  } catch (err) {
    console.log(`Event Reminder failed at function sendEventReminder:: ${err}`);
  }
};