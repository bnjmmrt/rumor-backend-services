import { createHash } from 'crypto';
import { HostSignUpRequestDto, MemberAddressDto, MemberSignUpRequestDto } from '../../../users/src/dtos/auth.dto';
import { Address } from 'rumor-utils/entities/users/entities/address.entity';
import { User } from 'rumor-utils/entities/users/entities/user.entity';
import { genderToEntity } from '../../../users/src/mappers/auth.mapper';
import { UpdateHostProfileRequestDto } from '../../../users/src/dtos/admin.dto';
import { getCityNameFromAddressComponents } from '../../../events/src/utils/event.utils';

export const newMember = (payload: MemberSignUpRequestDto, address: Address): User => {
  const user = new User();
  user.firstName = payload.firstName;
  user.lastName = payload.lastName;
  user.phoneNumber = payload.phoneNumber;
  user.email = payload.email;
  user.gender = genderToEntity[payload.gender];
  user.dateOfBirth = standardizeDateOfBirth(payload.dateOfBirth);
  user.address = address;
  user.instagramUserName = payload.instagramUserName;
  return user;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const newAddress = async (payload: MemberAddressDto, placeLocation: any): Promise<Address> => {
  const address = new Address();
  if (placeLocation) {
    const geoLocation = placeLocation?.results[0]?.geometry?.location;
    const addressComponents = placeLocation?.results[0]?.address_components || [];
    const city = getCityNameFromAddressComponents(addressComponents);

    address.city = city;
    address.latitude = geoLocation?.lat;
    address.longitude = geoLocation?.lng;
  }

  address.address = payload.address;
  address.googlePlaceId = payload.placeId;
  return address;
};

export const newHost = (payload: HostSignUpRequestDto): User => {
  const user = new User();
  user.firstName = payload.firstName;
  user.lastName = payload.lastName;
  user.email = payload.email;
  user.phoneNumber = payload.phoneNumber;
  user.additionalHostInformation = {
    companyName: payload.companyName,
    companyLogo: '',
    website: payload?.website || null,
    referredBy: payload?.referredBy || null,
    eventsPerYear: payload.eventsPerYear,
    bio: payload?.bio || null,
    socialMedia: {},
  };
  return user;
};

export const hostToUpdate = (host: User, payload: UpdateHostProfileRequestDto): User => {
  host.firstName = payload.firstName || host.firstName;
  host.lastName = payload.lastName || host.lastName;
  host.email = payload.email || host.email;
  host.phoneNumber = payload.phoneNumber || host.phoneNumber;

  host.additionalHostInformation = {
    companyName: payload.companyName || host.additionalHostInformation?.companyName || '',
    companyLogo: payload.companyLogo || host.additionalHostInformation?.companyLogo || '',
    website: payload.website || host.additionalHostInformation?.website || '',
    referredBy: payload.referredBy || host.additionalHostInformation?.referredBy,
    eventsPerYear: payload.eventsPerYear || host.additionalHostInformation?.eventsPerYear,
    bio: payload.bio || host.additionalHostInformation?.bio,
    socialMedia: {
      instagram: payload.socialMedia.instagram !== undefined ? payload.socialMedia.instagram : host.additionalHostInformation?.socialMedia?.instagram,
      tiktok: payload.socialMedia.tiktok !== undefined ? payload.socialMedia.tiktok : host.additionalHostInformation?.socialMedia?.tiktok,
      linkedin: payload.socialMedia.linkedin !== undefined ? payload.socialMedia.linkedin : host.additionalHostInformation?.socialMedia?.linkedin,
      youtube: payload.socialMedia.youtube !== undefined ? payload.socialMedia.youtube : host.additionalHostInformation?.socialMedia?.youtube,
      facebook: payload.socialMedia.facebook !== undefined ? payload.socialMedia.facebook : host.additionalHostInformation?.socialMedia?.facebook,
      x: payload.socialMedia.x !== undefined ? payload.socialMedia.x : host.additionalHostInformation?.socialMedia?.x,
    },
  };
  return host;
};

export const formatToUnits = (num: number) => {
  const abbrev = ['', 'K', 'M'];
  const unrangifiedOrder = Math.floor(Math.log10(Math.abs(num)) / 3);
  const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
  return num / Math.pow(10, order * 3) + abbrev[order];
};

// Generates a code verifier
export const generateCodeVerifier = (length: number = 128): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
};

// Generates a code challenge using SHA-256
export const generateCodeChallenge = (codeVerifier: string): string => {
  const hash = createHash('sha256').update(codeVerifier).digest();
  const base64Url = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return base64Url;
};

export const isWithinTimeRange = (
  timestamp: Date | null,
  duration: string | null,
): {
  validate: boolean;
  timeLeft: string;
} => {
  if (!timestamp || !duration) {
    return {
      validate: false,
      timeLeft: '',
    };
  }
  let durationMs: number;
  switch (duration) {
    case '1h':
      durationMs = 1 * 60 * 60 * 1000;
      break;
    case '8h':
      durationMs = 8 * 60 * 60 * 1000;
      break;
    case '24h':
      durationMs = 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error('Invalid duration provided');
  }

  const currentTime = new Date().getTime();
  const timestampTime = new Date(timestamp).getTime();
  const timeDifference = currentTime - timestampTime;
  if (timeDifference >= durationMs) {
    return {
      validate: false,
      timeLeft: '0h 0m 0s',
    };
  }
  const timeLeftMs = durationMs - timeDifference;
  const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  return {
    validate: true,
    timeLeft: `${hours}h ${minutes}m ${seconds}s`,
  };
};

export const generateRandomPassword = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

export const generateTemporaryToken = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    token += charset.charAt(Math.floor(Math.random() * n));
  }
  return token;
};

export const standardizeDateOfBirth = (dateOfBirth: string): string => {
  const [year, month, day] = dateOfBirth.split('-');
  return `${month}/${day}/${year}`;
};

export const formatSinceDate = (prefix: string, date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  // Extract the last two digits of the year and add an apostrophe
  const [month, year] = formattedDate.split(' ');
  const shortYear = `'${year.slice(-2)}`;

  return `${prefix} since ${month} ${shortYear}`;
};
