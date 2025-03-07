import * as _ from 'lodash';
// import dayjs from 'dayjs';
import * as dayjs from 'dayjs'
import { User } from "../entities/user.entity"
import { BasicHostProfile, HostProfile, Focus as FocusProto, MemberProfile, customListData } from '../grpc/auth/auth.pb';
import { formatEventStatus } from '../../events/mappers/events.mapper';
import { EventStatus } from '../../events/grpc/events/general.pb';
import { UserSource, UserStatus } from '../grpc/auth/shared.pb';
import { entityToGender } from './auth.mapper';
import { entityToUserSource, entityToUserStatus, userSourceToEntity, userStatusToEntity } from './shared.mapper';
import { UserRole } from '../entities/roles/user-role.entity';

export const toHostProfile = (user: User, status: UserStatus, source: UserSource, isMemberFollowingHost: boolean): HostProfile => {
  const upcomingEvents = user.hostedEvents
    .filter((event) => formatEventStatus(event) === EventStatus.UPCOMING_STATUS)
    .map((event) => {
      return {
        id: event.id,
        imageCover: event.imageCover || '',
        name: event.name,
        startDate: dayjs(event.startDate).format('MM/DD/YYYY HH:mm') || '',
        endDate: dayjs(event.endDate).format('MM/DD/YYYY HH:mm') || '',
        imageFlyer: event.imageFlyer || '',
      };
    });
  const pastEvents = user.hostedEvents
    .filter((event) => formatEventStatus(event) === EventStatus.PAST_STATUS)
    .map((event) => {
      return {
        id: event.id,
        imageCover: event.imageCover || '',
        name: event.name,
        startDate: dayjs(event.startDate).format('MM/DD/YYYY HH:mm') || '',
        endDate: dayjs(event.endDate).format('MM/DD/YYYY HH:mm') || '',
        imageFlyer: event.imageFlyer || '',
      };
    });
  const pendingEvents = user.hostedEvents
    .filter((event) => formatEventStatus(event) === EventStatus.PENDING_STATUS)
    .map((event) => {
      return {
        id: event.id,
        imageCover: event.imageCover || '',
        name: event.name,
        startDate: dayjs(event.startDate).format('MM/DD/YYYY HH:mm') || '',
        endDate: dayjs(event.endDate).format('MM/DD/YYYY HH:mm') || '',
        imageFlyer: event.imageFlyer || '',
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
    source: entityToUserSource[status],
    status: entityToUserStatus[status],
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
  };
};

export const toBasicHostProfile = (user: User, status: UserStatus, source: UserSource): BasicHostProfile => {
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

export const toMemberProfile = (user: User, focuses: FocusProto[], role: UserRole, instagramUsername?: string): MemberProfile => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    category: focuses.map((focus) => focus.name).join(', '),
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
    focuses: focuses.map((focus) => ({ id: focus.id, name: focus.name })),
  };
};
