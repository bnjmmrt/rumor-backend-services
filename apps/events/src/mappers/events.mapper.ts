// import { EventData, EventStatus, GuestEventData, GuestStatus as GuesStatusGRPC } from '../grpc/events/general.pb';
// import { Event, Guest } from '../database/entities';
// import * as dayjs from 'dayjs';
// import { EventStatusEnum } from '../interfaces/event.interface';
// import { entityToGuestStatus } from './guest.mapper';

// export const toEvent = (event: Event, qrCodeUtilization: number | null | undefined, guestCount?: number, guest?: Guest): EventData => {
//   const currentGuestStatus = guest?.status;

//   return {
//     admissionType: event.admissionType || undefined,
//     collaborators: event.collaborators || [],
//     description: event.description || '',
//     enabled: event.enabled || false,
//     endDate: dayjs(event.endDate).format('MM/DD/YYYY HH:mm') || '',
//     eventType: event.eventType || undefined,
//     furtherInstructions: event.furtherInstructions || '',
//     imageCover: event.imageCover || '',
//     imageFlyer: event.imageFlyer || '',
//     limitOnePlus: event.limitOnePlus || 0,
//     location: event.location || undefined,
//     owner: event.owner || undefined,
//     quizQuestions: event.quizQuestions || [],
//     rsvpDeadline: event.rsvpDeadline ? dayjs(event.rsvpDeadline).format('MM/DD/YYYY HH:mm') : '',
//     showLocation: event.showLocation || false,
//     startDate: dayjs(event.startDate).format('MM/DD/YYYY HH:mm') || '',
//     status: formatEventStatus(event),
//     talents: event.talents || [],
//     ticketTypes: event.ticketTypes || [],
//     useQr: event.useQr || false,
//     id: event.id,
//     name: event.name || '',
//     ageLimit: event.ageLimit || undefined,
//     publishDate: event.publishDate ? dayjs(event.publishDate).format('MM/DD/YYYY HH:mm') : '',
//     autoPublished: !event.publishDate,
//     isPrivate: event.isPrivate || false,
//     capacity: event.capacity || 0,
//     qrCodeUtilization: qrCodeUtilization,
//     guestsCount: guestCount || 0,
//     currentGuestStatus: currentGuestStatus ? entityToGuestStatus[currentGuestStatus] : GuesStatusGRPC.NO_STATUS,
//     guestId: guest?.id,
//     userId: guest?.user?.id,
//     featuredEventSection: event.featuredEventSection
//       ? {
//           id: event.featuredEventSection?.id,
//           name: event.featuredEventSection?.name,
//           index: event.featuredEventSection?.index,
//         }
//       : null,
//   };
// };

// export const toEventGuest = (event: Event, currentGuest: Guest): GuestEventData => {
//   return {
//     description: event.description || '',
//     enabled: event.enabled || false,
//     endDate: dayjs(event.endDate).format('MM/DD/YYYY HH:mm') || '',
//     eventType: event.eventType || undefined,
//     imageCover: event.imageCover || '',
//     imageFlyer: event.imageFlyer || '',
//     location: event.location || undefined,
//     owner: event.owner || undefined,
//     rsvpDeadline: event.rsvpDeadline ? dayjs(event.rsvpDeadline).format('MM/DD/YYYY HH:mm') : '',
//     showLocation: event.showLocation || false,
//     startDate: dayjs(event.startDate).format('MM/DD/YYYY HH:mm') || '',
//     status: formatEventStatus(event),
//     id: event.id,
//     name: event.name || '',
//     ageLimit: event.ageLimit || undefined,
//     publishDate: event.publishDate ? dayjs(event.publishDate).format('MM/DD/YYYY HH:mm') : '',
//     autoPublished: !event.publishDate,
//     isPrivate: event.isPrivate || false,
//     guest: {
//       guestId: currentGuest.id,
//       userId: currentGuest?.user?.id,
//       guestStatus: currentGuest.status,
//       numFollowers: currentGuest.numFollowers,
//       privateGuestNote: currentGuest.privateGuestNote,
//       maxAdditionalGuests: currentGuest.maxAdditionalGuests,
//       profilePicture: currentGuest?.user?.profilePicture || '',
//       name: `${currentGuest?.user?.firstName || ''} ${currentGuest?.user?.lastName || ''}`,
//     },
//   };
// };

// export const formatEventStatus = (event: Event): EventStatus => {
//   const now = new Date();
//   const { isPublished, startDate, endDate, publishDate, status: eventStatus } = event;

//   const parsedStartDate = new Date(startDate);
//   const parsedEndDate = new Date(endDate);
//   const parsedPublishDate = new Date(publishDate);
//   let status: EventStatus;
//   if (!isPublished && eventStatus && eventStatus === EventStatusEnum.APPROVED_STATUS && parsedPublishDate <= parsedStartDate) {
//     status = EventStatus.SCHEDULED_STATUS;
//   }

//   if (isPublished) {
//     if (parsedStartDate >= now || parsedEndDate >= now) {
//       status = EventStatus.UPCOMING_STATUS;
//     } else if (parsedEndDate < now) {
//       status = EventStatus.PAST_STATUS;
//     }
//   }

//   if (!isPublished && eventStatus && eventStatus !== EventStatusEnum.APPROVED_STATUS) status = EventStatus[eventStatus];
//   return status || EventStatus[eventStatus] || EventStatus.NO_EVENT_STATUS;
// };
