import {
  EventData,
  EventStatus,
  GuestEventData,
  GuestStatus as GuesStatusGRPC,
  CollaboratorsEvent,
} from '../grpc/events/general.pb';
import { Event } from '../entities/event.entity';
import * as dayjs from 'dayjs';
import {
  EventStatusEnum,
  GuestStatus,
  HostsFollowedByGuestInterface,
} from '../interfaces/event.interface';
import { Collaborator, Guest } from '../entities';
import { entityToGuestStatus } from './guest.mapper';
import { formatDateFromDB } from '../utils/event.utils';

export const toEvent = (
  event: Event,
  totalCheckedInGuests?: number | null | undefined,
  guestCount?: number,
  guest?: Guest,
  totalConfirmedGuests?: number | null | undefined,
  hostsFollowedByGuest?: HostsFollowedByGuestInterface[],
  memberUserId?: string,
): EventData => {
  const currentGuestStatus = guest?.status;
  const invitationDeclinedBy = guest?.declinedBy?.id || '';
  const collaborators: CollaboratorsEvent[] = groupCollaborators(
    event?.collaborators,
    hostsFollowedByGuest,
    guest,
    memberUserId,
  );
  const predefinedStatuses = [
    EventStatusEnum.DRAFT_STATUS,
    EventStatusEnum.PENDING_STATUS,
    EventStatusEnum.DECLINED_STATUS,
    EventStatusEnum.CANCELLED_STATUS,
    EventStatusEnum.PAST_STATUS,
    EventStatusEnum.REJECTED_STATUS,
  ];
  // const eventStatus: EventStatus = predefinedStatuses.includes(event.status) ? EventStatus[event.status] : formatEventStatus(event);
  const eventStatus: EventStatusEnum = predefinedStatuses.includes(event.status)
    ? event.status
    : formatEventStatusToEventStatusEnum(event);
  const location = event.location
    ? { ...event.location, placeId: event.location.googlePlaceId }
    : undefined;
  const ownerDetails = {
    ...event.owner,
    companyLogo: event?.owner?.additionalHostInformation?.companyLogo,
    companyName: event?.owner?.additionalHostInformation?.companyName,
    isFollowedByCurrentGuest: hostsFollowedByGuest?.some(
      follow => follow.hostId === event.owner?.id && follow.followerId === memberUserId,
    ),
  };
  return {
    admissionType: event.admissionType || undefined,
    collaborators: collaborators,
    description: event.description || '',
    enabled: event.enabled || false,
    endDate: formatDateFromDB(event.endDate),
    eventType: event.eventType || undefined,
    furtherInstructions: event.furtherInstructions || '',
    imageCover: event.imageCover || '',
    imageFlyer: event.imageFlyer || '',
    limitOnePlus: event.limitOnePlus || 0,
    location: location,
    owner: ownerDetails,
    quizQuestions: event.quizQuestions || [],
    rsvpDeadline: event.rsvpDeadline
      ? dayjs(event.rsvpDeadline).format('YYYY-MM-DD HH:mm:ssZ') || ''
      : '',
    showLocation: event.showLocation || false,
    startDate: formatDateFromDB(event.startDate),
    status: eventStatus,
    talents: event.talents || [],
    ticketTypes: event.ticketTypes || [],
    useQr: event.useQr || false,
    id: event.id,
    name: event.name || '',
    ageLimit: event.ageLimit || undefined,
    publishDate: event.publishDate ? formatDateFromDB(event.publishDate) : '',
    autoPublished: !event.publishDate,
    isPrivate: event.isPrivate || false,
    capacity: event.capacity || 0,
    guestsCount: guestCount || 0,
    currentGuestStatus: currentGuestStatus ? currentGuestStatus : GuestStatus.NO_STATUS,
    guestId: guest?.id,
    userId: guest?.user?.id,
    timeZone: event?.timeZone,
    invitationDeclinedBy: invitationDeclinedBy,
    featuredEventSection: event.featuredEventSection
      ? {
          id: event.featuredEventSection?.id,
          name: event.featuredEventSection?.name,
          index: event.featuredEventSection?.index,
        }
      : null,
    isPublished: event.isPublished || false,
    totalCheckedInGuests: totalCheckedInGuests || 0,
    totalConfirmedGuests: totalConfirmedGuests || 0,
    guestOptionalMessage: guest?.inviteMessage || '',
    guestNote: guest?.privateGuestNote || '',
    invitationDate: guest?.status === 'INVITED' ? guest?.createdAt?.toISOString() || '' : '',
  };
};

export const groupCollaborators = (
  collaborators: Collaborator[],
  hostsFollowedByGuest?: HostsFollowedByGuestInterface[],
  guest?: Guest,
  memberUserId?: string,
): CollaboratorsEvent[] => {
  try {
    if (!Array.isArray(collaborators)) {
      return [];
    }

    const grouped = {};
    collaborators.forEach(collab => {
      if (!collab?.user) {
        console.log('Collaborator missing user object:', collab);
        return;
      }

      const { user, role, limitInvitationsNumber, ticketType, ...collaboratorDetails } = collab;

      if (!grouped[user.id]) {
        let isFollowedByCurrentGuest = false;
        if (guest && hostsFollowedByGuest?.length) {
          isFollowedByCurrentGuest = hostsFollowedByGuest.some(
            follow => follow.hostId === user.id && follow.followerId === memberUserId,
          );
        }
        grouped[user.id] = {
          ...collaboratorDetails,
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(' '),
          email: user.email || '',
          companyLogo: user.additionalHostInformation?.companyLogo || '',
          companyName: user.additionalHostInformation?.companyName || '',
          role: role,
          tickets: [],
          isFollowedByCurrentGuest,
          isApproved: false,
        };
      }

      if (ticketType?.id && ticketType?.name) {
        grouped[user.id].tickets.push({
          limitInvitationsNumber: limitInvitationsNumber,
          name: ticketType.name,
          id: ticketType.id,
        });
      }
    });
    return Object.values(grouped);
  } catch (e) {
    throw new Error('Error grouping the collaborators.');
  }
};

export const toEventGuest = (
  event: Event,
  currentGuest?: Guest | null,
  currentUserId?: string,
): GuestEventData => {
  const predefinedStatuses = [
    EventStatusEnum.DRAFT_STATUS,
    EventStatusEnum.PENDING_STATUS,
    EventStatusEnum.DECLINED_STATUS,
    EventStatusEnum.CANCELLED_STATUS,
  ];
  const eventStatus: EventStatusEnum = predefinedStatuses.includes(event.status)
    ? event.status
    : formatEventStatusToEventStatusEnum(event);
  return {
    description: event.description || '',
    enabled: event.enabled || false,
    endDate: formatDateFromDB(event.endDate),
    eventType: event.eventType || undefined,
    imageCover: event.imageCover || '',
    imageFlyer: event.imageFlyer || '',
    location: event.location || undefined,
    owner: event.owner || undefined,
    rsvpDeadline: event.rsvpDeadline ? formatDateFromDB(event.rsvpDeadline) : '',
    showLocation: event.showLocation || false,
    startDate: formatDateFromDB(event.startDate),
    status: eventStatus,
    id: event.id,
    name: event.name || '',
    ageLimit: event.ageLimit || undefined,
    publishDate: event.publishDate ? formatDateFromDB(event.publishDate) : '',
    autoPublished: !event.publishDate,
    isPrivate: event.isPrivate || false,
    timeZone: event?.timeZone,
    guest: currentGuest
      ? {
          guestId: currentGuest.id,
          userId: currentGuest?.user?.id,
          guestStatus: currentGuest.status,
          numFollowers: currentGuest.numFollowers,
          privateGuestNote: currentGuest.privateGuestNote,
          maxAdditionalGuests: currentGuest.maxAdditionalGuests,
          profilePicture: currentGuest?.user?.profilePicture || '',
          name: `${currentGuest?.user?.firstName || ''} ${currentGuest?.user?.lastName || ''}`,
        }
      : undefined,
    featuredEventSection: event.featuredEventSection
      ? {
          id: event.featuredEventSection?.id,
          name: event.featuredEventSection?.name,
          index: event.featuredEventSection?.index,
        }
      : null,
    isCurrentUserIsGuest: currentGuest?.user?.id === currentUserId ? true : false,
  };
};

export const formatEventStatus = (event: Event): EventStatus => {
  const now = new Date();
  const { isPublished, startDate, endDate, publishDate, status: eventStatus } = event;

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  const parsedPublishDate = new Date(publishDate);
  let status: EventStatus;
  if (
    !isPublished &&
    eventStatus &&
    eventStatus === EventStatusEnum.APPROVED_STATUS &&
    parsedPublishDate <= parsedStartDate
  ) {
    status = EventStatus.SCHEDULED_STATUS;
  }

  if (isPublished) {
    if (parsedStartDate >= now || parsedEndDate >= now) {
      status = EventStatus.UPCOMING_STATUS;
    } else if (parsedEndDate < now) {
      status = EventStatus.PAST_STATUS;
    }
  }

  if (!isPublished && eventStatus && eventStatus !== EventStatusEnum.APPROVED_STATUS)
    status = EventStatus[eventStatus];
  return status || EventStatus[eventStatus] || EventStatus.NO_EVENT_STATUS;
};

export const formatEventStatusToEventStatusEnum = (event: Event): EventStatusEnum => {
  const now = new Date();
  const { isPublished, startDate, endDate, publishDate, status: eventStatus } = event;

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  const parsedPublishDate = new Date(publishDate);
  let status: EventStatus;

  if (
    !isPublished &&
    publishDate &&
    eventStatus &&
    eventStatus === EventStatusEnum.APPROVED_STATUS &&
    parsedPublishDate <= parsedStartDate
  ) {
    status = EventStatus.SCHEDULED_STATUS;
  }

  if (isPublished) {
    if (parsedStartDate >= now || parsedEndDate >= now) {
      status = EventStatus.UPCOMING_STATUS;
    }
    // else if (parsedEndDate < now) {
    //   status = EventStatus.PAST_STATUS;
    // }
  }

  if (!isPublished && eventStatus && eventStatus !== EventStatusEnum.APPROVED_STATUS) {
    status = EventStatus[eventStatus];
  }

  const finalStatus = status || EventStatus[eventStatus] || EventStatus.NO_EVENT_STATUS;

  // Convert numeric status to its corresponding string from EventStatusEnum
  return EventStatusEnum[EventStatus[finalStatus] as keyof typeof EventStatusEnum];
};
