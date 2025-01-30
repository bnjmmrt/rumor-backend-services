import { Gender } from '../../users/src/grpc/auth/auth.pb';
import { EventStatus, GuestStatus } from '../grpc/events/general.pb';
import { parse } from 'qs';
import { SocialProviderType } from '../../users/src/interfaces/shared.interface';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export const getCityNameFromAddressComponents = (addressComponents: AddressComponent[]): string | undefined => {
  for (const component of addressComponents) {
    if (component.types.includes('locality')) {
      return component.long_name;
    }
  }
  for (const component of addressComponents) {
    if (component.types.includes('sublocality')) {
      return component.long_name;
    }
  }
  return undefined;
};

export const isValidEventStatus = (status: string): boolean => {
  return Object.values(EventStatus).includes(status as unknown as EventStatus);
};

export const isValidGuestStatus = (status: string): boolean => {
  return Object.values(GuestStatus).includes(status as unknown as GuestStatus);
};

export const isValidUserGender = (gender: string): boolean => {
  return Object.values(Gender).includes(gender as unknown as Gender);
};

export const validateFilters = (query: string): { error: boolean; response: string } => {
  const parsedFilters = parse(query);
  const socialNetworkNames = parsedFilters?.socialNetworkNames ? parsedFilters.socialNetworkNames : undefined;
  const followerCountFrom = parsedFilters?.followerCountFrom ? parseInt(parsedFilters.followerCountFrom as string) : undefined;
  const followerCountTo = parsedFilters?.followerCountTo ? parseInt(parsedFilters.followerCountTo as string) : undefined;
  const searchValue = parsedFilters?.searchValue ? parsedFilters.searchValue : undefined;
  if (searchValue) {
    if (typeof searchValue !== 'string' || searchValue.length === 0) {
      return { error: true, response: 'searchValue must be a string.' };
    }
  }

  if (socialNetworkNames) {
    if (followerCountFrom === undefined || followerCountTo === undefined) {
      return {
        error: true,
        response: `Please provide both ‘Follower Count From’ and ‘Follower Count To’ when selecting one or more social networks.`,
      };
    }
    if (followerCountFrom > followerCountTo) {
      return { error: true, response: 'followerCountFrom must be less than or equal to followerCountTo.' };
    }

    if (typeof socialNetworkNames === 'string') {
      const socialNetworkArray = socialNetworkNames.split(',').map((name) => name.trim().toUpperCase());

      const invalidNames = socialNetworkArray.filter((name) => !(name in SocialProviderType));

      if (invalidNames.length > 0) {
        return { error: true, response: `Invalid social network names: ${invalidNames.join(', ')}` };
      }

      return { error: false, response: socialNetworkArray.join(',') };
    }
  }
  return { error: false, response: '' };
};
