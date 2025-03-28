import { Guest as GuestEntity } from '../entities/guest.entity';
import {
  AdditionalGuest,
  Guest,
  GuestData,
  GuestDataSimple,
  GuestStatus as GuestStatusProto,
  InterestData,
  QuizData,
  UserSource,
  VouchesData,
} from '../grpc/events/general.pb';
import { User } from '../../users/entities/user.entity';
import { GuestStatus, TicketStatusEnum } from '../interfaces/event.interface';
import { calculateAge } from '../../../utils/utils';
import { entityToUserSource, entityToUserStatus } from '../../users/mappers/shared.mapper';
import { formatToUnits } from '../../users/utils/auth.util';
import { Focus as FocusProto } from '../../users/grpc/auth/auth.pb';
import { UserVouch } from '../grpc/platform/general.pb';
import { SocialProviderType } from '../../users/interfaces/shared.interface';
import { UserQuizAnswer } from '../entities/user-quiz-question-answer.entity';
import { ListEventUsedTicketsData, TicketStatus } from '../grpc/events/general.pb';
import { Ticket } from '../entities/ticket.entity';
import { entityToGender } from '../../users/mappers/auth.mapper';

export const entityToGuestStatus: { [s in GuestStatus]: GuestStatusProto } = {
  [GuestStatus.NO_STATUS]: GuestStatusProto.NO_STATUS,
  [GuestStatus.DRAFT]: GuestStatusProto.DRAFT,
  [GuestStatus.INVITED]: GuestStatusProto.INVITED,
  [GuestStatus.CONFIRMED]: GuestStatusProto.CONFIRMED,
  [GuestStatus.DECLINED]: GuestStatusProto.DECLINED,
  [GuestStatus.APPLIED]: GuestStatusProto.APPLIED,
  [GuestStatus.REFUSED]: GuestStatusProto.REFUSED,
  [GuestStatus.REVIEW]: GuestStatusProto.REVIEW,
};

export const guestStatusToEntity: { [s in GuestStatusProto]: GuestStatus } = {
  [GuestStatusProto.NO_STATUS]: GuestStatus.NO_STATUS,
  [GuestStatusProto.DRAFT]: GuestStatus.DRAFT,
  [GuestStatusProto.INVITED]: GuestStatus.INVITED,
  [GuestStatusProto.CONFIRMED]: GuestStatus.CONFIRMED,
  [GuestStatusProto.DECLINED]: GuestStatus.DECLINED,
  [GuestStatusProto.APPLIED]: GuestStatus.APPLIED,
  [GuestStatusProto.REFUSED]: GuestStatus.REFUSED,
  [GuestStatusProto.REVIEW]: GuestStatus.REVIEW,
  [GuestStatusProto.UNRECOGNIZED]: GuestStatus.NO_STATUS,
};

export const entityToTicketStatus: { [s in TicketStatusEnum]: TicketStatus } = {
  [TicketStatusEnum.TICKET_GENERATED]: TicketStatus.TICKET_GENERATED,
  [TicketStatusEnum.TICKET_USED]: TicketStatus.TICKET_USED,
  [TicketStatusEnum.TICKET_CANCELED]: TicketStatus.TICKET_CANCELED,
  [TicketStatusEnum.TICKET_EXPIRED]: TicketStatus.TICKET_EXPIRED,
};

export const ticketStatusToEntity: { [s in TicketStatus]: TicketStatusEnum } = {
  [TicketStatus.TICKET_GENERATED]: TicketStatusEnum.TICKET_GENERATED,
  [TicketStatus.TICKET_USED]: TicketStatusEnum.TICKET_USED,
  [TicketStatus.TICKET_CANCELED]: TicketStatusEnum.TICKET_CANCELED,
  [TicketStatus.TICKET_EXPIRED]: TicketStatusEnum.TICKET_EXPIRED,
  [TicketStatus.UNRECOGNIZED]: TicketStatusEnum.TICKET_GENERATED,
};

export const toGuest = (
  guest: GuestEntity,
  focuses: FocusProto[],
  socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {},
  vouches?: UserVouch[] | undefined,
  answers?: UserQuizAnswer[] | undefined,
  interests: InterestData[] = [],
): Guest => {
  let totalFollowerCount = 0;

  if (guest?.user?.socialStats) {
    if (Object.keys(socialNetworkObject).length > 0) {
      totalFollowerCount = Object.keys(socialNetworkObject).reduce((acc, key) => {
        const statKey = `${key.toLowerCase()}FollowersCount`;
        return acc + (guest.user.socialStats[statKey] || 0);
      }, 0);
    } else {
      totalFollowerCount = Object.values(guest.user.socialStats).reduce((acc, val) => {
        return typeof val === 'number' ? acc + val : acc;
      }, 0);
    }
  }

  const roles = guest?.user?.roles?.length > 0 ? guest.user.roles[0] : undefined;
  const addedBy = guest.addedBy ? `${guest.addedBy?.additionalHostInformation?.companyName}` : '';
  const addedByPicture = guest.addedBy ? guest.addedBy?.additionalHostInformation?.companyLogo : '';
  const invitationSourceNumber =
    typeof guest.invitationSource === 'number' && UserSource[guest.invitationSource] !== undefined
      ? guest.invitationSource
      : UserSource.UNRECOGNIZED;
  return {
    userId: guest.user?.id,
    id: guest.id,
    name: `${guest.user?.firstName || ''} ${guest.user?.lastName || ''}`,
    addedBy,
    addedByPicture,
    invitationSource: UserSource[invitationSourceNumber],
    declinedBy: `${guest.declinedBy?.firstName || ''} ${guest.declinedBy?.lastName || ''}`,
    declinedByPicture: guest.declinedBy ? guest.declinedBy?.profilePicture : '',
    status: GuestStatus[guest.status],
    ticketType: guest.ticketType?.name,
    partySize: guest.maxAdditionalGuests + 1,
    numFollowers: formatToUnits(totalFollowerCount),
    baseCity: guest?.user?.address?.address || '',
    category: focuses.length > 0 ? focuses.map(focus => focus.name) : [],
    maxAdditionalGuests: guest.maxAdditionalGuests,
    source: roles ? UserSource[invitationSourceNumber] : null,
    checkIn: guest.checkIn,
    additionalRequestedGuests: guest?.additionalRequestedGuests || 0,
    profilePicture: guest?.user?.profilePicture || '',
    questions: answers?.length
      ? answers.map(item => {
          return toQuizData(item);
        })
      : [],
    vouches: vouches?.length
      ? vouches.map(item => {
          return toVouchesData(item);
        })
      : [],
    email: guest?.user?.email,
    privateGuestNote: guest?.privateGuestNote,
    age: calculateAge(guest.user.dateOfBirth),
    interest: interests ? interests.map(interest => interest.name) : [],
    gender: entityToGender[guest.user.gender] ?? entityToGender.NOT_APPLICABLE,
    additionalGuests: [],
    phoneNumber: guest?.user?.phoneNumber,
  };
};

export const toQuizData = (answer: UserQuizAnswer): QuizData => {
  return {
    question: answer?.question?.question,
    questionId: answer?.question?.id,
    answer: answer?.answer,
    answerId: answer?.id,
    required: answer?.question?.required,
    order: answer?.question?.order,
  };
};

export const toVouchesData = (vouch: UserVouch): VouchesData => {
  return {
    name: vouch?.name,
    email: vouch?.email,
    picture: vouch?.picture,
    isApproved: vouch?.isApproved,
    idUserVouch: vouch?.idUserVouch,
  };
};

export const toGuestData = (
  user: Partial<User>,
  guest: GuestEntity,
  focuses: FocusProto[],
  interests: InterestData[] = [],
  followsYou: boolean,
  favorite: boolean,
  additionalGuestData,
  isSpammedByHost?: boolean,
): GuestData => {
  let addedBy, addedByPicture, declinedBy, declinedByPicture;
  const invitationSourceNumber =
    typeof guest.invitationSource === 'number' && UserSource[guest.invitationSource] !== undefined
      ? guest.invitationSource
      : UserSource.UNRECOGNIZED;
  if (guest.event.owner.id === guest.addedBy?.id) {
    addedBy = guest.addedBy?.additionalHostInformation?.companyName || '';
    addedByPicture = guest.addedBy?.additionalHostInformation?.companyLogo || '';
  } else {
    addedBy = `${guest.addedBy?.firstName || ''} ${guest.addedBy?.lastName || ''}`.trim();
    addedByPicture = guest.addedBy?.profilePicture || '';
  }

  if (guest.event.owner.id === guest.declinedBy?.id) {
    declinedBy = guest.declinedBy?.additionalHostInformation?.companyName || '';
    declinedByPicture = guest.declinedBy?.additionalHostInformation?.companyLogo || '';
  } else {
    declinedBy = `${guest.declinedBy?.firstName || ''} ${guest.declinedBy?.lastName || ''}`.trim();
    declinedByPicture = guest.declinedBy?.profilePicture || '';
  }
  return {
    roles: user.roles.map(item => {
      return {
        roleId: item.role.id,
        roleName: item.role.name,
        status: entityToUserStatus[item.status],
        source: entityToUserSource[item.source],
      };
    }),
    id: guest.id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    name: (user?.firstName || '') + ' ' + (user?.lastName || ''),
    profilePicture: user.profilePicture || '',
    socialMediaStats: user.socialStats,
    gender: user.gender,
    age: calculateAge(user.dateOfBirth),
    address: user.address,
    interest: interests ? interests.map(interest => interest.name) : [],
    isFollow: followsYou,
    isFavorite: favorite,
    addedBy,
    addedByPicture,
    declinedBy,
    declinedByPicture,
    rejectedReason: guest.rejectedReason,
    invitationSource: UserSource[invitationSourceNumber],
    status: guest.status,
    categories: focuses.map(focus => focus.name),
    guestId: guest.id,
    userId: user.id,
    additionalGuests: additionalGuestData,
    checkIn: guest.checkIn,
    addedById: guest.addedBy?.id,
    declinedById: guest.declinedBy?.id,
    isSpammedByHost: isSpammedByHost,
  };
};

export const toGuestDataSimple = (
  guest: GuestEntity,
  focuses: FocusProto[],
  isRestricted: boolean = false,
  restrictedId?: string,
  invitedGuests: GuestDataSimple[] = [],
): GuestDataSimple => {
  const user = guest.user;
  const roleInfo = user.roles?.find(
    item => item.role.name === 'member' || item.role.name === 'non_member',
  );
  const addedBy = guest.addedBy
    ? `${guest.addedBy?.firstName || ''} ${guest.addedBy?.lastName || ''}`
    : '';
  const addedByPicture = guest.addedBy ? guest.addedBy?.profilePicture : '';
  const invitationSourceNumber =
    typeof guest.invitationSource === 'number' && UserSource[guest.invitationSource] !== undefined
      ? guest.invitationSource
      : UserSource.UNRECOGNIZED;

  return {
    id: guest.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture || '',
    status: roleInfo?.status ? GuestStatus[roleInfo?.status] : GuestStatus.NO_STATUS,
    source: roleInfo?.source || '',
    guestStatus: isRestricted ? GuestStatus.DECLINED : guest.status,
    guestId: isRestricted && restrictedId ? restrictedId : guest.id,
    username: user.username || '',
    ticketType: guest.ticketType?.name,
    numberAdditionalGuests: guest.maxAdditionalGuests,
    category: focuses.map(focus => focus.name),
    checkIn: guest.checkIn,
    phoneNumber: user.phoneNumber,
    age: calculateAge(user.dateOfBirth),
    addedBy,
    addedByPicture,
    invitationSource: invitationSourceNumber,
    userId: user.id,
    invitees: invitedGuests,
    maxAdditionalGuests: guest.maxAdditionalGuests,
  };
};

export const toTicketData = (ticket: Ticket): ListEventUsedTicketsData => {
  return {
    userId: ticket.user.id,
    guestId: ticket.guest.id,
    ticketId: ticket.id,
    status: entityToTicketStatus[ticket.status],
  };
};

export const toAdditionalGuestData = (
  additionalGuest: GuestEntity,
  plusOnesFocuses: FocusProto[],
  plusOnesInterests: InterestData[] = [],
): AdditionalGuest => {
  let totalFollowerCount = 0;

  if (additionalGuest?.user?.socialStats) {
    totalFollowerCount = Object.values(additionalGuest.user.socialStats).reduce((acc, val) => {
      return typeof val === 'number' ? acc + val : acc;
    }, 0);
  }

  const addedBy = additionalGuest.addedBy
    ? `${additionalGuest.addedBy?.firstName || ''} ${additionalGuest.addedBy?.lastName || ''}`
    : '';
  const addedByPicture = additionalGuest.addedBy ? additionalGuest.addedBy?.profilePicture : '';
  const invitationSourceNumber =
    typeof additionalGuest.invitationSource === 'number' &&
    UserSource[additionalGuest.invitationSource] !== undefined
      ? additionalGuest.invitationSource
      : UserSource.UNRECOGNIZED;

  return {
    id: additionalGuest.user?.id,
    firstName: additionalGuest.user?.firstName,
    lastName: additionalGuest.user?.lastName,
    guestId: additionalGuest.id,
    interest: plusOnesInterests ? plusOnesInterests.map(interest => interest.name) : [],
    category: plusOnesFocuses ? plusOnesFocuses.map(focus => focus.name) : [],
    profilePicture: additionalGuest?.user?.profilePicture,
    ticketType: additionalGuest?.ticketType?.name,
    numFollowers: formatToUnits(totalFollowerCount),
    status: GuestStatus[additionalGuest.status],
    baseCity: additionalGuest?.user?.address?.address || '',
    checkIn: additionalGuest.checkIn,
    gender: entityToGender[additionalGuest.user.gender] ?? entityToGender.NOT_APPLICABLE,
    invitationSource: UserSource[invitationSourceNumber],
    isBanned: false,
    addedBy,
    addedByPicture,
    declinedBy: additionalGuest.declinedBy
      ? `${additionalGuest.declinedBy?.firstName || ''} ${additionalGuest.declinedBy?.lastName || ''}`
      : '',
    declinedByPicture: additionalGuest.declinedBy ? additionalGuest.declinedBy?.profilePicture : '',
  };
};
