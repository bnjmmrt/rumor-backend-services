import * as _ from 'lodash';
import { User } from '../entities/user.entity';
import {
  Gender as GenderProto,
  CurrentMember,
  Focus as FocusProto,
  Member,
  Host,
  HostedEvent,
  UserDataSimple,
  CurrentUser,
  ConfirmedMember,
  SimpleUser,
  UsersList,
  MemberProfile,
  customListData,
} from '../grpc/auth/auth.pb';
import { Gender, RawHost } from '../interfaces/auth.interface';
import * as dayjs from 'dayjs';
import { formatSinceDate, formatToUnits } from '../utils/auth.util';
import { entityToProviderType } from './social.mapper';
import { entityToUserSource, entityToUserStatus } from './shared.mapper';
import { UserRole } from '../entities/roles/user-role.entity';
import { SocialProviderType, UserStatus } from '../interfaces/shared.interface';
import { InterestData } from '../../events/grpc/events/general.pb';
import { calculateAge } from '../../../utils/utils';

export const genderToEntity: { [g in GenderProto]: Gender } = {
  [GenderProto.MALE]: Gender.MALE,
  [GenderProto.FEMALE]: Gender.FEMALE,
  [GenderProto.NON_BINARY]: Gender.NON_BINARY,
  [GenderProto.NOT_APPLICABLE]: Gender.NOT_APPLICABLE,
  [GenderProto.UNRECOGNIZED]: Gender.NOT_APPLICABLE,
};

export const entityToGender: { [g in Gender]: GenderProto } = {
  [Gender.MALE]: GenderProto.MALE,
  [Gender.FEMALE]: GenderProto.FEMALE,
  [Gender.NON_BINARY]: GenderProto.NON_BINARY,
  [Gender.NOT_APPLICABLE]: GenderProto.NOT_APPLICABLE,
};

export const toCurrentMember = (user: User, focuses: FocusProto[], role: UserRole, instagramUsername?: string): CurrentMember => {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    gender: entityToGender[user.gender],
    dateOfBirth: user.dateOfBirth,
    imageUrl: user.profilePicture,
    address: {
      address: user?.address?.address,
      placeId: user?.address?.googlePlaceId,
    },
    approved: role?.status === UserStatus.ACTIVE,
    referralCode: 'user.referralCode',
    focuses,
    socialProviders: user.socialProviders.map((provider) => {
      return {
        type: entityToProviderType[provider.type],
        accessToken: provider.longLivedToken,
        username: provider.username,
      };
    }),
    userRoles: user.roles.map((role) => {
      return {
        id: role.id,
        name: role.role.name,
        parentRoleId: null,
      };
    }),
    instagramUsername: instagramUsername,
    source: '',
    roleStatus: '',
  };
};

export const toSimpleUser = (user: User, role?: UserRole): SimpleUser => {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    imageUrl: user.profilePicture,
    approved: role?.status === UserStatus.ACTIVE,
    referralCode: 'user.referralCode',
  };
};

export const toCreateUser = (user: User): SimpleUser => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    imageUrl: user.profilePicture || '',
  };
};

export const toCurrentUser = (user: User, focuses: FocusProto[], roles: UserRole[]): CurrentUser => {
  // Construct role data based on user roles
  const roleData = roles.map(role => {
    // Basic structure for each role
    const baseRoleData = {
      id: role.id,
      userId: user.id,
      roleName: role.role.name,
      status: role.status,
      source: role.source || null,
    };

    // Add role-specific data based on roleName
    if (role.role.name === 'member') {
      return {
        ...baseRoleData,
        focuses: focuses,
        socialProviders: user.socialProviders || [],
        memberSince: formatSinceDate('Member', user.createdAt),
      };
    }

    if (role.role.name === 'host' || role.role.name === 'co_host') {
      return {
        ...baseRoleData,
        hostSince: formatSinceDate('Host', user.createdAt),
        companyName: user.additionalHostInformation?.companyName || null,
        eventsPerYear: user.additionalHostInformation?.eventsPerYear || null,
        website: user.additionalHostInformation?.website || null,
        referredBy: user.additionalHostInformation?.referredBy || null,
        companyLogo: user.additionalHostInformation?.companyLogo || null,
      };
    }

    // For non-member or admin roles (UserRole)
    return baseRoleData;
  });
  // Return the CurrentUser object with the roles data
  return {
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    role: roleData,
  };
};

export const toMember = (
  user: User,
  focuses: FocusProto[] = [],
  interests: InterestData[] = [],
  role: UserRole,
  socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {},
  instagramUsername: string = 'N/A',
): Member => {
  let totalFollowerCount = 0;

  if (user.socialStats) {
    if (Object.keys(socialNetworkObject).length > 0) {
      totalFollowerCount = Object.keys(socialNetworkObject).reduce((acc, key) => {
        const statKey = `${key.toLowerCase()}FollowersCount`;
        return acc + (user.socialStats[statKey] || 0);
      }, 0);
    } else {
      totalFollowerCount = Object.values(user.socialStats).reduce((acc, val) => {
        return typeof val === 'number' ? acc + val : acc;
      }, 0);
    }
  }

  const followerCount = formatToUnits(totalFollowerCount) || 'N/A';

  return {
    id: user.id,
    name: `${_.startCase(user.firstName || '')} ${_.startCase(user.lastName || '')}`,
    gender: user.gender,
    types: focuses.map((focus) => focus.name),
    categories: interests.map((interest) => interest.name),
    city: user.address?.city ?? user.address?.address ?? 'N/A',
    followerCount,
    status: role.status ?? 'UNRECOGNIZED',
    profilePicture: user.profilePicture,
    email: user.email,
    instagramUsername,
    role: role.role.name,
    age: calculateAge(user.dateOfBirth),
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth
  };
};

export const toUser = (
  user: User,
  focuses: FocusProto[] = [],
  interests: InterestData[] = [],
  role: UserRole,
  socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {},
): UsersList => {
  let totalFollowerCount = 0;

  if (user.socialStats) {
    if (Object.keys(socialNetworkObject).length > 0) {
      totalFollowerCount = Object.keys(socialNetworkObject).reduce((acc, key) => {
        const statKey = `${key.toLowerCase()}FollowersCount`;
        return acc + (user.socialStats[statKey] || 0);
      }, 0);
    } else {
      totalFollowerCount = Object.values(user.socialStats).reduce((acc, val) => {
        return typeof val === 'number' ? acc + val : acc;
      }, 0);
    }
  }

  const followerCount = formatToUnits(totalFollowerCount) || 'N/A';

  return {
    id: user.id,
    name: `${_.startCase(user.firstName || '')} ${_.startCase(user.lastName || '')}`,
    gender: entityToGender[user.gender] ?? entityToGender.NOT_APPLICABLE,
    categories: focuses.map((focus) => focus.name),
    interests: interests.map((interest) => interest.name),
    city: user.address?.city ?? user.address?.address ?? 'N/A',
    followerCount,
    profilePicture: user.profilePicture,
    type: role.role.name,
    age: calculateAge(user.dateOfBirth),
  };
};

export const toHost = (user: RawHost): Host => {
  const hostedEvents: HostedEvent[] = [];
  hostedEvents.push({ type: 'all', count: user.all_events_count });
  hostedEvents.push({ type: 'upcoming', count: user.upcoming_events_count });
  hostedEvents.push({ type: 'past', count: user.past_events_count });
  hostedEvents.push({ type: 'declined', count: user.declined_events_count });
  hostedEvents.push({ type: 'draft', count: user.draft_events_count });
  hostedEvents.push({ type: 'pending', count: user.pending_events_count });

  return {
    id: user.user_id,
    companyName: user.user_additional_host_information?.companyName || null,
    companyPicture: user.user_additional_host_information?.companyLogo || null,
    referredBy: user.user_additional_host_information?.referredBy || null,
    website: user.user_additional_host_information?.website || null,
    profilePicture: user.user_profile_picture || null,
    phoneNumber: user.user_phone_number || null,
    hostSince: user.user_role_created_at || null,
    source: user.user_role_source || null,
    contactName: `${_.startCase(user.user_first_name)} ${_.startCase(user.user_last_name)}`,
    email: user.user_email,
    appliedOn: dayjs(user.user_created_at).format('DD/MM/YYYY'),
    status: user.user_role_status,
    referralCode: '',
    hostedEvents,
  };
};

export const toUserDataSimple = (user: User): UserDataSimple => {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    name: (user?.firstName || '') + ' ' + (user?.lastName || ''),
  };
};

export const toConfirmedMember = (user: User): ConfirmedMember => {
  return {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

export const toMemberProfile = (user: User, focuses: FocusProto[] = [], interests: InterestData[] = [], role: UserRole, customLists: customListData[], instagramUsername?: string, eventCount: number = 0): MemberProfile => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    category: focuses.map((focus) => focus.name).join(', '),
    city: user.address?.city ?? user.address?.address ?? 'N/A',
    dateOfBirth: user.dateOfBirth,
    placeId: user?.address?.googlePlaceId,
    phoneNumber: user.phoneNumber,
    email: user.email,
    gender: user.gender,
    socialStats: {
      instagramFollowersCount: user.socialStats?.instagramFollowersCount || 0,
    },
    referredBy: [],
    upcomingEvents: [],
    pastEvents: [],
    invitedEvents: [],
    requestedEvents: [],
    status: role?.status,
    role: role?.role?.name,
    roleId: role?.role?.id,
    interest: interests.map((interest) => interest.name).join(', '),
    age: calculateAge(user.dateOfBirth),
    imageUrl: user.profilePicture || '',
    instagramUsername: instagramUsername,
    customLists: customLists,
    focuses: focuses.map((focus) => ({ id: focus.id, name: focus.name })),
    eventCount: eventCount
  };
};
