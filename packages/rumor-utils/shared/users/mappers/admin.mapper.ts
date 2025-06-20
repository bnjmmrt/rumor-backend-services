import * as _ from 'lodash';
import { User } from '../entities/user.entity';
import {
  BasicHostProfile,
  HostProfile,
  Focus as FocusProto,
  MemberProfile,
  customListData,
  SurveyResponse,
} from '../grpc/auth/auth.pb';
import * as dayjs from 'dayjs';
import { formatEventStatus } from '../../events/mappers/events.mapper';
import { EventStatus } from '../../events/grpc/events/general.pb';
import { UserSource, UserStatus } from '../grpc/auth/shared.pb';
import { entityToGender } from './auth.mapper';
import { entityToUserSource, entityToUserStatus } from './shared.mapper';
import { UserRole } from '../entities/roles/user-role.entity';
import { formatDateFromDB } from '../../events/utils/event.utils';
import { EventStatusEnum } from '../../events/interfaces/event.interface';

export const toHostProfile = (
  user: User,
  status: any,
  source: any,
  isMemberFollowingHost: boolean,
  isMemberBlockedHost: boolean,
  roleId: string,
  roleName: string,
  confirmedGuestEvents?: any[],
): HostProfile => {
  const now = new Date();
  const upcomingEvents = user.hostedEvents
    .filter(
      event =>
        event.status === EventStatusEnum.APPROVED_STATUS &&
        !event.isPrivate &&
        event.isPublished &&
        new Date(event.endDate) >= now,
    )
    .map(event => {
      return {
        id: event.id,
        imageCover: event.imageCover || '',
        name: event.name,
        startDate: formatDateFromDB(event.startDate),
        endDate: formatDateFromDB(event.endDate),
        imageFlyer: event.imageFlyer || '',
        eventLocation: event.location || undefined,
        timeZone: event.timeZone || undefined,
      };
    });
  const pastEvents =
    confirmedGuestEvents?.map((guest: any) => {
      return {
        id: guest?.event?.id,
        imageCover: guest?.event?.imageCover || '',
        name: guest?.event?.name,
        startDate: guest?.event?.startDate ? formatDateFromDB(guest.event.startDate) : '',
        endDate: guest?.event?.endDate ? formatDateFromDB(guest.event.endDate) : '',
        imageFlyer: guest?.event?.imageFlyer || '',
        eventLocation: guest?.event?.location || undefined,
        timeZone: guest?.event?.timeZone || undefined,
      };
    }) || [];
  const pendingEvents = user.hostedEvents
    .filter(event => event.status === EventStatusEnum.PENDING_STATUS)
    .map(event => {
      return {
        id: event.id,
        imageCover: event.imageCover || '',
        name: event.name,
        startDate: formatDateFromDB(event.startDate),
        endDate: formatDateFromDB(event.endDate),
        imageFlyer: event.imageFlyer || '',
        eventLocation: event.location || undefined,
        timeZone: event.timeZone || undefined,
      };
    });

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    id: user.id,
    contact: `${_.startCase(user.firstName)} ${_.startCase(user.lastName)}`,
    email: user.email,
    phoneNumber: user.phoneNumber,
    eventsPerYear: user?.additionalHostInformation?.eventsPerYear || 0,
    referredBy: user?.additionalHostInformation?.referredBy || '',
    source: source,
    status: status,
    hostSince: dayjs(user.createdAt).format('MM/DD/YYYY HH:mm') || '',
    bio: user?.additionalHostInformation?.bio || '',
    totalAttendees: 0,
    totalInfluencerSpend: 0,
    totalEvents: pastEvents.length + upcomingEvents.length + pendingEvents.length,
    totalOffersMade: 0,
    upcomingEvents,
    pastEvents,
    pendingEvents,
    companyName: user?.additionalHostInformation?.companyName || '',
    companyLogo: user?.additionalHostInformation?.companyLogo || '',
    socialMedia: user?.additionalHostInformation?.socialMedia || {},
    isMemberFollowingHost,
    website: user?.additionalHostInformation?.website || '',
    isMemberBlockedHost,
    roleId: roleId,
    roleName: roleName,
  };
};

export const toBasicHostProfile = (user: User, status: any, source: any): BasicHostProfile => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    source,
    status,
    hostSince: dayjs(user.createdAt).format('MM/DD/YYYY'),
    companyName: user.additionalHostInformation?.companyName || '',
    companyLogo: user.additionalHostInformation?.companyLogo || '',
    website: user.additionalHostInformation?.website || '',
    socialMedia: user.additionalHostInformation?.socialMedia || {},
    bio: user.additionalHostInformation?.bio || '',
  };
};

/*
TODO: remove
export const toMemberProfile = (
  user: User,
  focuses: FocusProto[],
  role: UserRole,
  instagramUsername?: string,
  eventCount?: number,
  surveyResponses?: SurveyResponse[],
): MemberProfile => {
  return {
    id: user.id,
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    category: focuses.map(focus => focus.name).join(', '),
    city: user.address?.city ?? user.address?.address ?? 'N/A',
    placeId: user.address?.googlePlaceId,
    dateOfBirth: user.dateOfBirth,
    phoneNumber: user.phoneNumber,
    email: user.email,
    gender: entityToGender[user.gender],
    referralCode: '',
    socialStats: {
      instagramFollowersCount: user.socialStats?.instagramFollowersCount || 0,
      facebookFollowersCount: user.socialStats?.facebookFollowersCount || 0,
      youtubeFollowersCount: user.socialStats?.youtubeFollowersCount || 0,
      tiktokFollowersCount: user.socialStats?.tiktokFollowersCount || 0,
      linkedinFollowersCount: user.socialStats?.linkedinFollowersCount || 0,
      xFollowersCount: user.socialStats?.xFollowersCount || 0,
      snapchatFollowersCount: user.socialStats?.snapchatFollowersCount || 0,
    },
    referredBy: [],
    upcomingEvents: [],
    pastEvents: [],
    invitedEvents: [],
    requestedEvents: [],
    status: entityToUserStatus[role.status],
    instagramUsername: instagramUsername,
    customLists: [],
    focuses: focuses.map(focus => ({ id: focus.id, name: focus.name })),
    eventCount,
    surveyResponses:
      user.surveyResponses?.map(response => ({
        id: response.id,
        response: response.response,
        user: {
          ...response.user,
          roles: response.user.roles.map(role => ({
            roleId: role.role.id,
            roleName: role.role.name,
            status: entityToUserStatus[role.status],
            source: role.source ? entityToUserSource[role.source] : undefined,
          })),
        },
        survey: {
          ...response.survey,
          message: response.survey.message || '',
        },
        respondedAt: response.respondedAt.toISOString(),
      })) || [],
  };
}; */
