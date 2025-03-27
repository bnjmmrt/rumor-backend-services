import { EventStatus, GuestStatus } from '../grpc/events/general.pb';
import { parse } from 'qs';
import { Gender } from '../../users/grpc/auth/auth.pb';
import { SocialProviderType } from '../../users/interfaces/shared.interface';
import { CreateEventRequestDto, EventLocationDto, UpdateEventRequestDto } from '../dtos/events.dto';
import { Event, EventLocation } from '../entities';

export enum ProviderType {
  FACEBOOK = 0,
  INSTAGRAM = 1,
  TIKTOK = 2,
  GOOGLE = 3,
  LINKEDIN = 4,
  X = 5,
  SNAPCHAT = 6,
  UNRECOGNIZED = -1,
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export const getCityNameFromAddressComponents = (
  addressComponents: AddressComponent[],
): string | undefined => {
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
  const socialNetworkNames = parsedFilters?.socialNetworkNames
    ? parsedFilters.socialNetworkNames
    : undefined;
  const followerCountFrom = parsedFilters?.followerCountFrom
    ? parseInt(parsedFilters.followerCountFrom as string)
    : undefined;
  const followerCountTo = parsedFilters?.followerCountTo
    ? parseInt(parsedFilters.followerCountTo as string)
    : undefined;
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
      return {
        error: true,
        response: 'followerCountFrom must be less than or equal to followerCountTo.',
      };
    }

    if (typeof socialNetworkNames === 'string') {
      const socialNetworkArray = socialNetworkNames
        .split(',')
        .map(name => name.trim().toUpperCase());

      const invalidNames = socialNetworkArray.filter(name => !(name in SocialProviderType));

      if (invalidNames.length > 0) {
        return {
          error: true,
          response: `Invalid social network names: ${invalidNames.join(', ')}`,
        };
      }

      return { error: false, response: socialNetworkArray.join(',') };
    }
  }
  return { error: false, response: '' };
};

/**
 * Validates the event dates to ensure they are in UTC format and logically correct.
 *
 * @param {CreateEventRequestDto} payload - The event data containing startDate, endDate, and optionally publishDate.
 * @returns {{ error: boolean; response?: string }} - Returns an error flag and an optional error message.
 */
export const validateEventDates = (
  payload: CreateEventRequestDto | UpdateEventRequestDto,
): { error: boolean; response?: string } => {
  const currentDate = new Date();
  if (!payload.startDate || !isUtcDate(payload.startDate)) {
    return { error: true, response: 'Start Date must be valid and in UTC standard' };
  }
  if (!payload.endDate || !isUtcDate(payload.endDate)) {
    return { error: true, response: 'End Date must be valid and in UTC standard' };
  }
  // Validate publishDate (if provided)
  if (payload.publishDate) {
    if (!isUtcDate(payload.publishDate)) {
      return { error: true, response: 'Publish Date must be valid and in UTC standard' };
    }

    // Publish date must be later than the current date and time
    if (new Date(payload.publishDate).getTime() < currentDate.getTime()) {
      return { error: true, response: 'Publish date must be later than the current date.' };
    }

    // End date must be later than publish date
    if (new Date(payload.endDate).getTime() <= new Date(payload.publishDate).getTime()) {
      return { error: true, response: 'End date must be later than the publish date.' };
    }
  }
  // Ensure the event start date and time is in the future
  if (!payload.startDate || new Date(payload.startDate).getTime() <= currentDate.getTime()) {
    return { error: true, response: 'Start date and time must be later than the current time.' };
  }

  // Ensure the end date is later than the start date
  if (
    !payload.endDate ||
    new Date(payload.endDate).getTime() <= new Date(payload.startDate).getTime()
  ) {
    return { error: true, response: 'End date must be later than the start date.' };
  }
  return { error: false }; // No errors found
};

export const formatDateFromDB = (date?: Date | null): string => {
  if (!date) return ''; // Return empty if no date is provided
  const endDate = new Date(date);
  // Extract all the necessary components dynamically
  const year = endDate.getUTCFullYear();
  const month = String(endDate.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based, hence +1
  const day = String(endDate.getUTCDate()).padStart(2, '0');
  const hours = String(endDate.getUTCHours()).padStart(2, '0');
  const minutes = String(endDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(endDate.getUTCSeconds()).padStart(2, '0');
  // Format the date string as 'YYYY-MM-DD HH:mm:ss+00'
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`;
};

/**
 * Normalizes a date by removing seconds and milliseconds.
 * Ensures timestamps are comparable without unnecessary precision.
 * @param date - The input date
 * @returns A new Date object with seconds and milliseconds set to zero
 */
export function normalizeDate(date?: Date): Date | undefined {
  if (!date) return undefined;
  const normalized = new Date(date);
  normalized.setSeconds(0, 0); // Remove seconds and milliseconds
  return normalized;
}

/* Checks if a given date string is in valid UTC format (ISO 8601).
 * Expected format: YYYY-MM-DDTHH:mm:ssZ (e.g., 2024-02-05T15:00:00Z).
 *
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} - Returns true if the date string is valid and in UTC format.
 */
export const isUtcDate = (dateString: string): boolean => {
  if (!dateString) return false;

  // Regular expression to match ISO 8601 UTC format (supports optional milliseconds)
  const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

  if (!isoUtcRegex.test(dateString)) return false;

  return true;
};

/**
 * Checks if the event's date or time has changed by comparing only the date, hour, and minute.
 * Ignores differences in seconds and milliseconds.
 *
 * @param newEvent - The updated event details from the frontend.
 * @param existingEvent - The existing event details stored in the database.
 * @returns An object indicating whether changes exist and specifying which fields changed.
 */
export function hasEventDateOrLocationChanged(
  newEvent: UpdateEventRequestDto,
  existingEvent: Event,
): { changed: boolean; changes: string[] } {
  const changes: string[] = [];

  /**
   * Compares two dates while ignoring seconds and milliseconds.
   *
   * @param date1 - The first date to compare.
   * @param date2 - The second date to compare.
   * @returns `true` if the dates are equal (ignoring seconds and milliseconds), otherwise `false`.
   */
  const areDatesEqual = (date1?: Date, date2?: Date): boolean => {
    if (!date1 || !date2) return date1 === date2;
    return normalizeDate(date1)?.toISOString() === normalizeDate(date2)?.toISOString();
  };
  // Convert possible string dates to Date objects
  const newEventStartDate = newEvent.startDate ? new Date(newEvent.startDate) : undefined;
  const newEventEndDate = newEvent.endDate ? new Date(newEvent.endDate) : undefined;

  // Compare start date (ignoring seconds)
  if (!areDatesEqual(newEventStartDate, existingEvent.startDate)) {
    changes.push('startDate');
  }

  // Compare end date (ignoring seconds)
  if (!areDatesEqual(newEventEndDate, existingEvent.endDate)) {
    changes.push('endDate');
  }

  // Compare event location (Deep comparison without external libraries)
  const areLocationsEqual = (loc1?: EventLocationDto, loc2?: EventLocation): boolean => {
    if (!loc1 || !loc2) return loc1 === loc2;
    return (
      loc1.location === loc2.location &&
      loc1.placeId === loc2.googlePlaceId &&
      loc1.city === loc2.city &&
      loc1.latitude === loc2.latitude &&
      loc1.longitude === loc2.longitude
    );
  };

  if (!areLocationsEqual(newEvent.eventLocation, existingEvent.location)) {
    changes.push('eventLocation');
  }
  return { changed: changes.length > 0, changes };
}
