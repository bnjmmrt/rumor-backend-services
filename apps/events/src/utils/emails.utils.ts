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
    hostName?: string;
    emailsData?: {
        eventId?: string | undefined;
        id: string;
        firstName: string;
        email: string;
    } | undefined;
};

export const sendEventInviteMember = async (mailComponents: MailComponent): Promise<AxiosResponse<any, any>> => {
    const { eventDate, eventName, imageFlyer, location, city, hostName, emailsData } = mailComponents;
    const { month, day, dayOfWeek, hour, minutes } = extractDate(eventDate);
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
            value: minutes,
        },
        {
            key: 'address',
            value: `${location}, ${city}`,
        },
        { key: 'host_name', value: hostName },
    ];
    const data = emailsData;
    const redirectPath = `users/${data.id}/events/${data.eventId}`;
    params.push({ key: 'first_name', value: data.firstName }, {
            key: 'view_event',
            value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
    });
        try {
           return await serviceMesh.notificationService().sendEmailFromTemplate(params, 'Member: Event Invite Recieved', [data.email], null)
        } catch (error) { }
};

export const sendEventInviteNonMember = async (mailComponents: MailComponent): Promise<AxiosResponse<any, any>> => {
    const { eventDate, eventName, imageFlyer, location, city, hostName, emailsData } = mailComponents;
    const { month, day, dayOfWeek, hour, minutes } = extractDate(eventDate);
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
            value: minutes,
        },
        {
            key: 'address',
            value: `${location}, ${city}`,
        },
        { key: 'host_name', value: hostName },
    ];
    const data = emailsData;
    const redirectPath = `users/${data.id}/events/${data.eventId}`;
        params.push({ key: 'first_name', value: data.firstName }, {
            key: 'link_to_application',
            value: config.get('RUMOR_WEBSITE') + `${redirectPath}`,
        });
        try {
           return await serviceMesh.notificationService().sendEmailFromTemplate(params, 'Non-Member: Event Invite Recieved', [data.email], null)
        } catch (error) { }
}

export const sendEventCancellation = async (mailComponents: MailComponent, email: string, guestName: string, message: string): Promise<AxiosResponse<any, any>> => {
    const { eventDate, eventName, imageFlyer, location, city, hostName } = mailComponents;
    const { month, day, dayOfWeek, hour, minutes } = extractDate(eventDate);
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
                value: minutes,
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
                return await serviceMesh.notificationService().sendEmailFromTemplate(params, "Event Cancelation Notification", [email], null)
            } catch(err) { }
}

export const sendEventUpdation = async (mailComponents: MailComponent, email: string, userId: string, eventId: string): Promise<AxiosResponse<any, any>> => {
    const redirectPath = `users/${userId}/events/${eventId}`;
    const { eventDate, eventName, imageFlyer, location, city } = mailComponents;

    const { month, day, dayOfWeek, hour, minutes } = extractDate(eventDate);
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
            value: minutes,
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
        return await serviceMesh.notificationService().sendEmailFromTemplate(params, "Event Info Updated", [email], null)
    } catch (err) { }
}

export const sendEventInvitePlusOnes = async (mailComponents: MailComponent, addOnData: any): Promise<AxiosResponse<any, any>> => {
    const {email, userId, firstName, eventId, leadGuestName} = addOnData
    const redirectPath = `users/${userId}/events/${eventId}`;
    const { eventDate, eventName, imageFlyer, location, city, hostName } = mailComponents;
    const { month, day, dayOfWeek, hour, minutes } = extractDate(eventDate);
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
            value: minutes,
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
        return await serviceMesh.notificationService().sendEmailFromTemplate(params, "Non-Member: Invited as Plus ones by Member", [email], null)
    } catch (err) { }
}