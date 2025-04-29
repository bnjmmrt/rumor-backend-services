import {
  GenericResponse,
  GetUserRequestsResponse,
  GetAttendeeCountRequest,
  PaginatedGuestEventsResponse,
  Attendees,
  Guests,
  FetchBulkGuestsData,
  SimpleGuestEventsResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';
import { VouchRequestService } from './vouch-request.service';
import { responses } from '../common/responses';
import {
  Between,
  Brackets,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  QueryRunner,
} from 'typeorm';
import {
  CsvUploadRecords,
  Event,
  Guest,
  RestrictedInvites,
  QuizQuestion,
  TicketType,
  User,
  UserAttendeeStats,
} from 'rumor-utils/shared/events/entities';
import {
  EventLocationInterface,
  EventStatusEnum,
  GuestStatus,
  ManageGuestsAction,
  UploadType,
} from 'rumor-utils/shared/events/interfaces/event.interface';
import { NotFoundError, BadRequestError, ValidationError } from 'rumor-utils/errors';
import {
  AddGuestsRequestDto,
  CancelEventInvitationRequestDto,
  DeclineEventInvitationRequestDto,
  GuestsQueryRequestDto,
  GuestsRequestDto,
  InvitedGuestRequestDto,
  ListEventGuestsDto,
  ListUsersEventInviteesRequestDto,
  ListUsersInviteesDto,
  ManageBulkGuestsRequestDto,
  RequestBecomeGuestRequestDto,
  UpdateGuestsRequestDto,
  UpdateRequestBecomeGuestRequestDto,
  ManageGuestsRequestDto,
  InvitedGuestsRequestDto,
  BulkUploadGuestsRequestDto,
  FetchBulkGuestsRequestDto,
  InviteNewUserRequestDto,
  AcceptEventInvitationRequestDto,
} from 'rumor-utils/shared/events/dtos/guest.dto';
import {
  entityToGuestStatus,
  toGuestData,
  guestStatusToEntity,
  toAdditionalGuestData,
  toGuest,
  toGuestDataSimple,
  toQuizData,
  toVouchesData,
} from 'rumor-utils/shared/events/mappers/guest.mapper';
import { parse, ParsedQs } from 'qs';
import {
  hasPagination,
  IdRequestDto,
  UserAndIdRequestDto,
  RequestByUserAndEventDto,
} from 'rumor-utils/shared/users/dtos/shared.dto';
import { Member, SimpleUser, CsvRecord } from 'rumor-utils/shared/users/grpc/auth/auth.pb';
import { Gender } from 'rumor-utils/shared/users/interfaces/auth.interface';
import { toEventGuest } from 'rumor-utils/shared/events/mappers/events.mapper';
import { haversineDistance } from 'rumor-utils/utils/utils';
import { isValidGuestStatus, isValidUserGender, validateFilters } from '../utils/event.utils';
import { ProviderType } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { UserQuizAnswer } from 'rumor-utils/shared/events/entities/user-quiz-question-answer.entity';
import { SocialProviderType } from 'rumor-utils/shared/users/interfaces/shared.interface';
import {
  GuestDataSimple,
  UserAttendee,
  UserSource,
  GuestData,
  GuestDetails,
  BulkUserData,
  UserEventInviteesData,
  QuizData,
  SimpleGuestEventData,
} from 'rumor-utils/shared/events/grpc/events/general.pb';
import database from '../database';
import config from '../config';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { HostUserSettings } from 'rumor-utils/shared/users/entities/host-user-settings.entity';
import { v4 as uuidv4 } from 'uuid';
import { toSimpleUser } from 'rumor-utils/shared/users/mappers/auth.mapper';
import { HostFollowing } from 'rumor-utils/shared/users/entities/host-following.entity';
import { HostFavorite } from 'rumor-utils/shared/users/entities/host-favorite.entity';
import { HostCustomUsersLists } from 'rumor-utils/shared/users/entities/host-custom-users-lists.entity';
import { HostUserMapping } from 'rumor-utils/shared/users/entities/host-user-mapping.entity';
import { processCsvFile, generateErrorCsv, isValidPhoneNumber } from 'rumor-utils/utils/file-utils';
import S3Service from '../utils/aws/s3';
import { stringify } from 'csv-stringify';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import {
  sendEventInviteMember,
  sendEventInviteNonMember,
  sendEventInvitePlusOnes,
  sendEventInviteToConfirmedGuest,
  sendGuestEventApproval,
} from '../utils/emails.utils';
import { sendSmsNotification } from '../utils/sms.utils';
import * as dayjs from 'dayjs';
import { Role, UserRole } from 'rumor-utils/shared/entities';
import { UserSource as UserSourceEnum } from 'rumor-utils/shared/users/interfaces/shared.interface';
export class GuestService {
  public static dbConnection = database;

  public static filterLocationsByDistance(
    currentLat: number,
    currentLng: number,
    locations: EventLocationInterface[],
  ): EventLocationInterface[] {
    const maxDistance = 50; //50 miles

    return locations.filter(location => {
      const distance = haversineDistance(currentLat, currentLng, location.lat, location.long);
      return distance <= maxDistance;
    });
  }

  /**
   * Manages guests for an event based on the provided action.
   *
   * This function:
   * - Validates the event and host.
   * - Ensures guest status and action are valid.
   * - Handles guest creation, updates, and deletions based on action type.
   * - Calls `fetchGuestsOperation` to get the list of guests.
   * - Calls appropriate functions to modify guest data.
   * - Returns success or error responses based on the operation.
   */
  public static async manageGuests(
    payload: ManageGuestsRequestDto,
    token: string,
  ): Promise<{ message: string }> {
    const parsedQuery = parse(payload.query);
    const eventId = parsedQuery?.eventId as string;
    // Fetch the event by its ID
    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: eventId }, relations: { location: true, owner: true } });
    if (!event) throw new NotFoundError('Event');

    // Validate ticket type if provided in the request
    let ticketType = await this.dbConnection
      .getRepository(TicketType)
      .findOne({ where: { id: payload.ticketTypeId } });
    if (!ticketType) throw new NotFoundError('Ticket type');

    // Fetch the host profile
    const host = (await serviceMesh.userService(token).getBasicHostProfile(payload.hostId)).data;
    if (!host) throw new NotFoundError('Host not found');

    // Normalize and validate guest status (convert to uppercase and check if it exists in GuestStatus)
    const guestStatus = payload?.guestStatus
      ? payload.guestStatus.toString().trim().toUpperCase()
      : undefined;
    const currentStatus = payload?.currentStatus
      ? payload.currentStatus.toString().trim().toUpperCase()
      : undefined;
    if (currentStatus && !Object.keys(GuestStatus).includes(currentStatus))
      throw new BadRequestError('Invalid current Guest status');
    if (guestStatus && !Object.keys(GuestStatus).includes(guestStatus))
      throw new BadRequestError('Invalid Guest status');

    // Normalize and validate action (convert to uppercase and check if it exists in ManageGuestsAction)
    const action = payload.action ? payload.action.toString().trim().toUpperCase() : undefined;
    if (action && !Object.keys(ManageGuestsAction).includes(action))
      throw new BadRequestError('Invalid action for managing guest status');

    // Extract relevant fields from payload
    const {
      hostId,
      ticketTypeId,
      maxAdditionalGuests,
      inviteMessage,
      privateGuestNote,
      sendNotification,
    } = payload;

    // Prevent sending invites if the event is not approved
    if (
      (GuestStatus[guestStatus] === GuestStatus.CONFIRMED ||
        GuestStatus[guestStatus] === GuestStatus.INVITED) &&
      event.status !== EventStatusEnum.APPROVED_STATUS
    ) {
      throw new BadRequestError(
        'You cannot send invites until the event has been approved by the Rumor admin',
      );
    }

    switch (action) {
      case ManageGuestsAction.CREATE:
        // Only allow certain guest statuses for creation
        if (
          guestStatus &&
          (guestStatus === GuestStatus.DRAFT ||
            guestStatus === GuestStatus.INVITED ||
            guestStatus === GuestStatus.CONFIRMED)
        ) {
          // Fetch guests based on the provided filters
          const data = await this.getFilteredGuestIds(payload, token);
          // Ensure data is valid and contains an array of users
          if (data && Array.isArray(data)) {
            // Prepare the payload for creating guests
            const payloadCreateGuest = {
              eventId,
              hostId,
              users: data, // List of user IDs
              ticketTypeId,
              maxAdditionalGuests,
              inviteMessage,
              privateGuestNote,
              guestStatus,
              sendInvite: sendNotification,
            };

            // Call the function to create guests
            const createGuests = await this.addGuests(payloadCreateGuest, token);

            // Check if guests were successfully created
            if (createGuests.result.length > 0) {
              if (createGuests.isExist) {
                throw new BadRequestError(`The user already has a status on the guest list.`);
              } else {
                return { message: `Guest created with status ${guestStatus}` };
              }
            }
          } else {
            throw new BadRequestError('Invalid guest status for CREATE action.');
          }
        }
        break;

      case ManageGuestsAction.UPDATE:
        if (
          guestStatus &&
          (guestStatus === GuestStatus.INVITED ||
            guestStatus === GuestStatus.CONFIRMED ||
            guestStatus === GuestStatus.DECLINED ||
            guestStatus === GuestStatus.DRAFT)
        ) {
          // Fetch guests based on the provided filters
          const data = await this.getFilteredGuestIds(payload, token);
          // Ensure data is valid and contains an array of users
          if (data && Array.isArray(data)) {
            // Prepare the payload for creating guests
            const payloadUpdateGuest = {
              eventId,
              hostId,
              guests: data, // List of user IDs
              ticketTypeId,
              maxAdditionalGuests,
              inviteMessage,
              privateGuestNote,
              guestStatus,
              sendInvite: sendNotification,
            };
            // Call the function to update guests
            const updateGuests = await this.updateGuests(payloadUpdateGuest);
            const smsPromises: Promise<{ success: boolean }>[] = [];

            const baseRedirectUrl = config.get('RUMOR_WEBSITE_HOST') + 'redirect';

            for (const guest of updateGuests) {
              const { phoneNumber, invitationSource, userId } = guest;

              if (!phoneNumber) continue;

              const shouldSendApproval =
                guestStatus === GuestStatus.CONFIRMED &&
                [GuestStatus.APPLIED, GuestStatus.DECLINED].includes(currentStatus as GuestStatus);

              const shouldSendDecline =
                guestStatus === GuestStatus.DECLINED &&
                [GuestStatus.APPLIED, GuestStatus.CONFIRMED].includes(currentStatus as GuestStatus);

              let textMessage: string | null = null;
              if (shouldSendDecline && invitationSource === UserSource.SIGN_UP_FORM) {
                textMessage = `Sorry, your request for ${event.name} has been declined. Download Rumor to apply to join our community and discover other experiences ${baseRedirectUrl}.`;
              } else if (shouldSendApproval) {
                if (invitationSource === UserSource.SIGN_UP_FORM) {
                  textMessage = `Good news! Your request for ${event.name} was approved. Log in or download the app to access your confirmation and important event details.\n${baseRedirectUrl}`;
                } else if (invitationSource === UserSource.REQUEST_IN_APP) {
                  textMessage = `You're in! Your request for ${event.name} was approved. Keep an eye on the event details page for more updates. ${baseRedirectUrl}`;
                }
              }

              if (textMessage) {
                smsPromises.push(sendSmsNotification({ phoneNumber, textMessage }));
              }
            }

            await Promise.allSettled(smsPromises);

            // Check if guests notifications were successfully sent
            if (updateGuests.length > 0) {
              const recipientIds = updateGuests.map(data => data.userId).filter(Boolean);

              if (
                guestStatus === GuestStatus.DECLINED &&
                (currentStatus === GuestStatus.APPLIED || currentStatus === GuestStatus.CONFIRMED)
              )
                serviceMesh
                  .notificationService()
                  .sendNotification(
                    NotificationType.EVENT_REQUEST_DENIED,
                    recipientIds,
                    eventId,
                    hostId,
                  );
              if (
                guestStatus === GuestStatus.CONFIRMED &&
                (currentStatus === GuestStatus.APPLIED || currentStatus === GuestStatus.DECLINED)
              )
                serviceMesh
                  .notificationService()
                  .sendNotification(
                    NotificationType.EVENT_REQUEST_APPROVED,
                    recipientIds,
                    eventId,
                    hostId,
                  );
              return { message: `Guest updated with status ${guestStatus}` };
            }
          } else {
            throw new BadRequestError('Invalid guest status for CREATE action.');
          }
        }
        break;

      case ManageGuestsAction.DELETE:
        if (
          guestStatus &&
          (guestStatus === GuestStatus.DRAFT || guestStatus === GuestStatus.INVITED)
        ) {
          // Fetch guests based on the provided filters
          const data = await this.getFilteredGuestIds(payload, token);
          if (data && Array.isArray(data)) {
            const payloadRemoveGuests = {
              eventId,
              guests: data,
            };
            // Call the function to update guests
            const deleteGuests = await this.manageGuestsRemoval(payloadRemoveGuests);
            // Check if guests were successfully created
            if (deleteGuests) return { message: `Guest deleted with status ${guestStatus}` };
          } else {
            throw new BadRequestError('Invalid guest status for CREATE action.');
          }
        }
        break;
      default:
        throw new BadRequestError('Invalid action.');
    }
  }

  /**
   * Fetches guest IDs based on provided filtering criteria.
   *
   * This function handles different scenarios:
   * - If `isSelectedAll` is true and no query is provided, fetch all guests for the event.
   * - If `isSelectedAll` is true with a query, fetch guests using `getGuests` and filter out `exclusiveIds`.
   * - If `isSelectedAll` is false and `inclusiveIds` are provided, return only those specific guests.
   * - Returns an error response for invalid payloads.
   *
   * @param payload - Request data containing filters and selection criteria.
   * @returns Array of guest IDs or an error response.
   */
  private static async getFilteredGuestIds(
    payload: ManageGuestsRequestDto,
    token: string,
  ): Promise<string[]> {
    const parsedQuery = payload.query ? parse(payload.query) : undefined;
    const eventId = parsedQuery?.eventId as string;
    const { isSelectedAll, inclusiveIds, exclusiveIds, filePath, bulkUploadStatus, currentStatus } =
      payload;

    // Case 1: Select all guests based on a query
    if (isSelectedAll) {
      if (payload.action === ManageGuestsAction.CREATE) {
        if (bulkUploadStatus && filePath) {
          const csvData = await this.dbConnection
            .getRepository(CsvUploadRecords)
            .findOne({ where: { originalCsvPath: filePath } });
          const usersData = await this.dbConnection
            .getRepository(User)
            .find({ where: { uploadedViaCsv: { id: csvData.id } } });
          let userIds: string[] = usersData.map(user => user.id);
          if (exclusiveIds.length > 0) {
            userIds = userIds.filter(id => !exclusiveIds.includes(id));
          }
          return userIds;
        }
        // Extract main guest IDs
        const queryString = new URLSearchParams(payload.query).toString();
        const usersData = (await serviceMesh.userService(token).getAllusers(queryString)).data;
        if (usersData.result.length === 0 || usersData.totalCount === 0) {
          throw new NotFoundError('Users data');
        }
        let userIds: string[] = usersData.result.map(user => user.id);
        if (exclusiveIds.length > 0) {
          userIds = userIds.filter(id => !exclusiveIds.includes(id));
        }
        return userIds;
      }
      const fetchData = {
        query: payload.query,
        hostId: payload.hostId,
        eventId: eventId,
      };
      const getGuests = await this.getGuests(fetchData);
      // Validate if guest data exists
      if (!getGuests.result || getGuests.totalCount === 0) {
        throw new NotFoundError('Guest data not found');
      }

      // Extract main guest IDs
      let guestIds: string[] = getGuests.result
        .filter(
          guest => {
            if (guest && guest.id) {
              const checkCondition =
                typeof guest.status === 'string'
                  ? guest.status === currentStatus
                  : guest.status === entityToGuestStatus[currentStatus];
              return checkCondition;
            }
          }, // Convert string to enum
        )
        .map(guest => guest.id);

      // Extract additional guest IDs (if any)
      const additionalGuestIds: string[] = getGuests.result
        .filter(guest => guestIds.includes(guest.id)) // Filter based on guestIds
        .flatMap(guest => guest.additionalGuests || []) // Get additional guests array
        .map(additionalGuest => additionalGuest.guestId); // Extract their IDs

      // Combine all guest IDs
      guestIds = [...guestIds, ...additionalGuestIds];

      // If exclusive IDs are provided, filter them out from guest list
      if (exclusiveIds.length > 0) {
        guestIds = guestIds.filter(id => !exclusiveIds.includes(id));
      }
      return guestIds;
    }

    // Case 2: Select specific guests using inclusive IDs
    else if (!isSelectedAll && inclusiveIds.length > 0) {
      if (payload.action === ManageGuestsAction.CREATE) {
        return inclusiveIds;
      }
      const guestData = await this.dbConnection.getRepository(Guest).find({
        where: { id: In(inclusiveIds) },
        select: { id: true }, // Fetch only the guest IDs
      });
      if (guestData.length > 0) {
        return guestData.map(guest => guest.id);
      } else {
        throw new NotFoundError('Guest data');
      }
    }

    // Case 3: Invalid payload data
    else {
      throw new BadRequestError('Incorrect payload data');
    }
  }

  /**
   * Adds guests to an event based on the provided payload.
   * - Validates event and host existence.
   * - Checks for a valid ticket type if provided.
   * - Validates guest status and ensures the event is approved before sending invites.
   * - Fetches user profiles and emails, creating a new guest entry if not already present.
   * - Sends invitation emails if the guest status is "INVITED" and `sendInvite` is true.
   * - Transforms and returns the list of successfully added guests.
   *
   * @param {AddGuestsRequestDto} payltoAdditionalGuestDataoad - The request payload containing event, host, and guest details.
   * @returns {Promise<GuestsResponse>} - A response containing the list of added guests or an error message.
   */
  public static async addGuests(payload: AddGuestsRequestDto, token: string): Promise<Guests> {
    // Fetch event details based on the provided event ID
    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: payload.eventId }, relations: { location: true, owner: true } });
    if (!event) throw new NotFoundError('Event not found');

    // Fetch host profile using the provided host ID
    const host = (await serviceMesh.userService(token).getBasicHostProfile(payload.hostId)).data;
    if (!host) throw new NotFoundError('Host not found');
    // Check if the host ID is in the users array and throw an error if present
    if (payload.users.includes(payload.hostId)) {
      throw new ValidationError('You cannot add yourself to an event');
    }
    // Fetch ticket type details if a ticketTypeId is provided
    let ticketType = await this.dbConnection
      .getRepository(TicketType)
      .findOne({ where: { id: payload.ticketTypeId } });

    if (!ticketType) throw new NotFoundError('Ticket type not found');

    // Validate and normalize guest status
    const guestStatus = payload?.guestStatus
      ? payload.guestStatus.toString().trim().toUpperCase()
      : undefined;

    // Ensure guest status is valid
    if (guestStatus && !Object.keys(GuestStatus).includes(guestStatus)) {
      throw new BadRequestError('Invalid guest status');
    }

    // Prevent sending invites if the event is not approved
    if (
      (GuestStatus[guestStatus] === GuestStatus.CONFIRMED ||
        GuestStatus[guestStatus] === GuestStatus.INVITED) &&
      event.status !== EventStatusEnum.APPROVED_STATUS
    ) {
      throw new BadRequestError(
        'You cannot send invites until the event has been approved by the Rumor admin',
      );
    }

    const emailsData = []; // Store guest emails for invitations
    let isExist: boolean = false; // Flag to check if guest already exists
    const guests = await Promise.all(
      payload.users.map(async userId => {
        try {
          // Fetch user details using the auth client
          const user = await this.dbConnection.getRepository(User).findOne({
            where: [{ id: userId }],
            relations: { roles: { role: true } },
          });

          const hasMemberOrNonMember = user?.roles?.some(userRole =>
            ['member', 'non_member'].includes(userRole.role.name),
          );

          if (!hasMemberOrNonMember) {
            this.assignRoleToUser(user);
          }
          // const user = (await serviceMesh.userService().getUser(userId)).data;
          if (!user) return null;
          const existingMapping = await this.dbConnection.getRepository(HostUserMapping).findOne({
            where: {
              host: { id: payload.hostId },
              user: { id: userId },
            },
          });

          if (!existingMapping) {
            const newMapping = new HostUserMapping();
            newMapping.user = user;
            newMapping.host = { id: payload.hostId } as User;
            await this.dbConnection.getRepository(HostUserMapping).save(newMapping);
          }

          // Extract user data and email
          let emailData: {
            eventId: string;
            email: string;
            firstName: string;
            role: string[];
            id?: string;
            phoneNumber?: string;
          } = {
            eventId: event.id,
            email: user.email,
            firstName: user.firstName,
            id: user.id,
            role: user.roles.flatMap(role => role.role.name),
            phoneNumber: user.phoneNumber,
          };
          if (emailData) emailsData.push(emailData);
          // Check if the guest already exists in the event
          let guest = await this.dbConnection.getRepository(Guest).findOne({
            where: {
              event: { id: event.id },
              user: { id: userId },
            },
            relations: ['user', 'addedBy', 'declinedBy'],
          });

          // If guest does not exist, create a new guest entry
          if (!guest) {
            const guest = new Guest();
            guest.status = guestStatus ? (guestStatus as GuestStatus) : GuestStatus.NO_STATUS;
            guest.event = event;
            guest.maxAdditionalGuests = payload.maxAdditionalGuests || 0;
            guest.user = { id: userId } as User;
            guest.addedBy = { id: host.id } as User;
            guest.privateGuestNote = payload.privateGuestNote;
            guest.invitationSource = UserSource.INVITED_BY_HOST;
            guest.inviteMessage = payload.inviteMessage;
            if (ticketType) {
              guest.ticketType = { id: ticketType.id } as TicketType;
            }
            const data = await this.dbConnection.getRepository(Guest).save(guest);
            return data;
          } else {
            isExist = true;
          }
          return guest;
        } catch (err) {
          return null;
        }
      }),
    );

    // Filter out any null values from guests (failed guest additions)
    const validGuests = guests.filter(guest => guest !== null);
    // If guest status is "INVITED" and sendInvite is true, send invitation emails
    if (guestStatus === GuestStatus.INVITED && payload.sendInvite && !isExist) {
      await Promise.all(
        emailsData.map(data => {
          if (data.role.includes('member')) {
            const createMailPayload = {
              eventDate: event.startDate,
              eventName: event.name,
              imageFlyer: event.imageFlyer,
              location: event.location.location,
              city: event.location.city,
              hostName: event.owner?.additionalHostInformation.companyName ?? 'Host',
              emailsData: {
                eventId: data.eventId,
                id: data.id,
                firstName: data.firstName,
                email: data.email,
              },
            };

            try {
              // Send Push for Member Invitation
              serviceMesh
                .notificationService()
                .sendNotification(
                  NotificationType.EVENT_INVITATION,
                  data.id,
                  payload.eventId,
                  payload.hostId,
                );
            } catch (error) {
              console.log('🚀 ~ GuestService ~ emailsData.map ~ error:', error);
            }

            sendEventInviteMember(createMailPayload, event.timeZone);
            if (data.phoneNumber) {
              const message = `You've received an invite to attend ${event.name}! Click the link to see more details and RSVP. ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
              // Send SMS notification
              try {
                const validateNumber = isValidPhoneNumber(data.phoneNumber);
                if (validateNumber) {
                  const cleanedNumber = data.phoneNumber.replace(/[\s\-()]/g, '');
                  serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
                }
              } catch (err) {
                console.log(`❌ Error while processing SMS for ${data.phoneNumber}:`, err);
              }
            }
          } else if (data.role.includes('non_member')) {
            const createMailPayload = {
              eventDate: event.startDate,
              eventName: event.name,
              imageFlyer: event.imageFlyer,
              location: event.location.location,
              city: event.location.city,
              hostName: host.firstName,
              emailsData: {
                eventId: data.eventId,
                id: data.id,
                firstName: data.firstName,
                email: data.email,
              },
            };

            // Send Push for Non Member Invitation
            serviceMesh
              .notificationService()
              .sendNotification(
                NotificationType.EVENT_INVITATION,
                data.id,
                payload.eventId,
                payload.hostId,
              );

            sendEventInviteNonMember(createMailPayload, event.timeZone);

            if (data.phoneNumber) {
              const message = `Hi ${data.firstName}, ${event.owner.additionalHostInformation.companyName} has invited you to ${event.name}! \n Download the Rumor app and log in with this phone number: ${data.phoneNumber} to RSVP and confirm your spot. \n Need help? Contact us at support@therumor.com. \n ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
              // Send SMS notification
              try {
                const validateNumber = isValidPhoneNumber(data.phoneNumber);
                if (validateNumber) {
                  const cleanedNumber = data.phoneNumber.replace(/[\s\-()]/g, '');
                  serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
                }
              } catch (err) {
                console.log(`❌ Error while processing SMS for ${data.phoneNumber}:`, err);
              }
            }
          }
        }),
      );
    }

    // If guest status is "INVITED" and sendInvite is true, send invitation emails
    if (guestStatus === GuestStatus.CONFIRMED && payload.sendInvite && !isExist) {
      await Promise.all(
        emailsData.map(data => {
          const createMailPayload = {
            eventDate: event.startDate,
            eventName: event.name,
            imageFlyer: event.imageFlyer,
            location: event.location.location,
            city: event.location.city,
            hostName: event.owner?.additionalHostInformation.companyName ?? 'Host',
            emailsData: {
              eventId: data.eventId,
              id: data.id,
              firstName: data.firstName,
              email: data.email,
            },
          };
          sendEventInviteToConfirmedGuest(createMailPayload, event.timeZone);
          if (data.phoneNumber) {
            let link = `${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;

            const message = ` Hi ${data?.firstName ? data.firstName : 'Guest'},\n\n${event.owner?.additionalHostInformation.companyName ?? 'Host'} has added you to the guest list for ${event.name}.\n\nDownload the Rumor app and log in with this phone number: ${data.phoneNumber} to view your confirmation.\n\nNeed help? Contact us at support@therumor.com.\n\n${link}`;
            try {
              const validateNumber = isValidPhoneNumber(data.phoneNumber);
              if (validateNumber) {
                const cleanedNumber = data.phoneNumber.replace(/[\s\-()]/g, '').trim();
                serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
              }
            } catch (err) {
              console.log(`❌ Error while processing SMS for ${data.phoneNumber}:`, err);
            }
          }
        }),
      );
    }

    // Transform guests into the expected response format, fetching user focus data
    const guestsTransform = await Promise.all(
      validGuests.map(async guest => {
        const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
        return toGuest(guest, focuses);
      }),
    );

    // Return the response containing guest details
    return { result: guestsTransform, totalCount: guestsTransform.length, isExist };
  }

  /**
   * Updates guests based on the provided payload.
   *
   * This function performs the following tasks:
   * - Validates the ticket type (if provided).
   * - Validates the guest status (if provided).
   * - Updates guest details such as max additional guests, private notes, status, and ticket type.
   * - Sends email notifications if required.
   * - Fetches and transforms the updated guest data before returning it.
   *
   * @param {UpdateGuestsRequestDto} payload - The request payload containing guest updates.
   * @returns {Promise<GuestDataSimple[]>} - A response containing updated guest data.
   */
  public static async updateGuests(payload: UpdateGuestsRequestDto): Promise<GuestDataSimple[]> {
    try {
      // Validate ticket type if provided in the request
      let ticketType = null;
      if (payload.ticketTypeId) {
        // Fetch ticket type from the database if ticketTypeId is provided
        ticketType = await this.dbConnection
          .getRepository(TicketType)
          .findOne({ where: { id: payload.ticketTypeId } });

        // If ticket type is not found, throw an error
        if (!ticketType) {
          throw new NotFoundError('Ticket type not found');
        }
      }

      // Validate guest status if provided
      const guestStatus = payload.guestStatus?.toString().trim().toUpperCase();
      if (guestStatus && !Object.keys(GuestStatus).includes(guestStatus)) {
        throw new BadRequestError('Invalid guest status');
      }

      // Arrays to store guest emails for notifications
      const invitedGuestsEmails = [];
      const confirmedGuestsEmails = [];
      const confirmedGuestsEmailsWithoutRequest = [];
      const declinedGuestsEmails = [];

      // Process each guest update asynchronously
      const guests = await Promise.all(
        payload.guests.map(async guestId => {
          try {
            // Fetch the guest details along with associated user information
            const guest = await this.dbConnection.getRepository(Guest).findOne({
              where: { id: guestId },
              relations: ['user', 'addedBy', 'declinedBy', 'event'],
            });
            // If guest does not exist, log a warning and return null
            if (!guest) {
              return null;
            }
            const user = await this.dbConnection.getRepository(User).findOne({
              where: [{ id: guest.user.id }],
              relations: { roles: { role: true } },
            });
            let emailData = {
              eventId: guest.event.id,
              id: guest.user.id,
              email: guest.user.email,
              firstName: guest.user.firstName,
              role: user.roles.flatMap(role => role.role.name),
              invitationSource: guest.invitationSource,
              phoneNumber: guest.user.phoneNumber ?? undefined,
            };
            // Update max additional guests and private notes if provided
            guest.maxAdditionalGuests = payload.maxAdditionalGuests ?? guest.maxAdditionalGuests;
            guest.privateGuestNote = payload.privateGuestNote ?? guest.privateGuestNote;
            guest.inviteMessage = payload.inviteMessage ?? guest.inviteMessage;
            if (!guest.addedBy && payload.hostId) guest.addedBy = { id: payload.hostId } as User;
            // Handle guest status updates if a new status is provided
            if (guestStatus) {
              switch (guestStatus) {
                case GuestStatus.INVITED:
                  // Only allow invitation if the current status is DRAFT or DECLINED
                  if (
                    [GuestStatus.DRAFT, GuestStatus.DECLINED, GuestStatus.INVITED].includes(
                      guest.status,
                    )
                  ) {
                    invitedGuestsEmails.push(emailData);
                  } else if (
                    [GuestStatus.CONFIRMED, GuestStatus.APPLIED, GuestStatus.REFUSED].includes(
                      guest.status,
                    )
                  ) {
                    throw new Error(`Cannot set status to INVITED from ${guest.status}`);
                  }
                  guest.status = GuestStatus.INVITED;
                  break;

                case GuestStatus.CONFIRMED:
                  // Only allow confirmation if the current status is INVITED, DRAFT, or APPLIED
                  if ([GuestStatus.APPLIED].includes(guest.status)) {
                    //if  old status is applied and new status confirmed
                    confirmedGuestsEmails.push(emailData);
                  } else if ([GuestStatus.REFUSED].includes(guest.status)) {
                    throw new Error(`Cannot set status to CONFIRMED from ${guest.status}`);
                  }
                  let oldStatuses = [GuestStatus.INVITED, GuestStatus.DRAFT];
                  if (oldStatuses.includes(guest.status)) {
                    confirmedGuestsEmailsWithoutRequest.push(emailData);
                  }
                  guest.status = GuestStatus.CONFIRMED;
                  break;

                case GuestStatus.DECLINED:
                  // Only allow declining if the current status is CONFIRMED or APPLIED
                  if (
                    [GuestStatus.CONFIRMED, GuestStatus.APPLIED, GuestStatus.DECLINED].includes(
                      guest.status,
                    )
                  ) {
                    declinedGuestsEmails.push(emailData);
                  } else if (
                    [GuestStatus.DRAFT, GuestStatus.INVITED, GuestStatus.REFUSED].includes(
                      guest.status,
                    )
                  ) {
                    throw new Error(`Cannot set status to DECLINED from ${guest.status}`);
                  }
                  guest.status = GuestStatus.DECLINED;
                  guest.declinedBy = { id: payload.hostId } as User;
                  guest.checkIn = false;
                  break;

                case GuestStatus.DRAFT:
                  // Only allow setting status to DRAFT if current status is INVITED, CONFIRMED or DECLINED
                  if (
                    ![
                      GuestStatus.DRAFT,
                      GuestStatus.INVITED,
                      GuestStatus.DECLINED,
                      GuestStatus.CONFIRMED,
                    ].includes(guest.status)
                  ) {
                    throw new Error(`Cannot set status to DRAFT from ${guest.status}`);
                  }
                  guest.status = GuestStatus.DRAFT;
                  break;
                default:
                  throw new Error(`Invalid guest status: ${guestStatus}`);
              }
            }

            // Assign the new ticket type if provided
            if (ticketType) {
              guest.ticketType = { id: ticketType.id } as TicketType;
            }

            // Save the updated guest data
            const data = await this.dbConnection.getRepository(Guest).save(guest);
            return data;
          } catch (err) {
            // Log error and return null in case of failure
            return null;
          }
        }),
      );

      // Filter out null values (failed updates)
      const updatedGuests = guests.filter(guest => guest !== null);

      // Send invitation emails if guests were updated and invitations are enabled
      if (updatedGuests.length > 0 && invitedGuestsEmails.length > 0 && payload.sendInvite) {
        const event = await this.dbConnection.getRepository(Event).findOne({
          where: { id: invitedGuestsEmails[0].eventId },
          relations: { location: true, owner: true },
        });
        await Promise.all(
          invitedGuestsEmails.map(data => {
            if (data.role.includes('member')) {
              const createMailPayload = {
                eventDate: event.startDate,
                eventName: event.name,
                imageFlyer: event.imageFlyer,
                location: event.location.location,
                city: event.location.city,
                hostName: event.owner.firstName,
                emailsData: {
                  eventId: data.eventId,
                  id: data.id,
                  firstName: data.firstName,
                  email: data.email,
                },
              };
              // Send Push for Member
              serviceMesh
                .notificationService()
                .sendNotification(
                  NotificationType.EVENT_INVITATION,
                  data.id,
                  data.eventId,
                  payload.hostId,
                );

              sendEventInviteMember(createMailPayload, event.timeZone);
              if (data.phoneNumber) {
                const message = `You've received an invite to attend ${event.name}! Click the link to see more details and RSVP. ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
                // Send SMS notification
                try {
                  const validateNumber = isValidPhoneNumber(data.phoneNumber);
                  if (validateNumber) {
                    const cleanedNumber = data.phoneNumber.replace(/[\s\-()]/g, '');
                    serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
                  }
                } catch (err) {
                  console.log(`❌ Error while processing SMS for ${data.phoneNumber}:`, err);
                }
              }
            } else if (data.role.includes('non_member')) {
              const createMailPayload = {
                eventDate: event.startDate,
                eventName: event.name,
                imageFlyer: event.imageFlyer,
                location: event.location.location,
                city: event.location.city,
                hostName: event.owner.firstName,
                emailsData: {
                  eventId: data.eventId,
                  id: data.id,
                  firstName: data.firstName,
                  email: data.email,
                },
              };
              sendEventInviteNonMember(createMailPayload, event.timeZone);
              // Send Push for Non Member
              serviceMesh
                .notificationService()
                .sendNotification(
                  NotificationType.EVENT_INVITATION_NON_MEMBER,
                  data.id,
                  data.eventId,
                  payload.hostId,
                );
              if (data.phoneNumber) {
                const message = `Hi ${data.firstName}, ${event.owner.additionalHostInformation.companyName} has invited you to ${event.name}! \n Download the Rumor app and log in with this phone number: ${data.phoneNumber} to RSVP and confirm your spot. \n Need help? Contact us at support@therumor.com. \n ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
                // Send SMS notification
                try {
                  const validateNumber = isValidPhoneNumber(data.phoneNumber);
                  if (validateNumber) {
                    const cleanedNumber = data.phoneNumber.replace(/[\s\-()]/g, '');
                    serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
                  }
                } catch (err) {
                  console.log(`❌ Error while processing SMS for ${data.phoneNumber}:`, err);
                }
              }
            }
          }),
        );
      }
      if (updatedGuests.length > 0 && confirmedGuestsEmails.length > 0 && payload.sendInvite) {
        const event = await this.dbConnection.getRepository(Event).findOne({
          where: { id: confirmedGuestsEmails[0].eventId },
          relations: { location: true, owner: true },
        });
        confirmedGuestsEmails.map(data => {
          if (
            data.role.includes('non_member') &&
            data.invitationSource === UserSource.SIGN_UP_FORM
          ) {
            const createMailPayload = {
              eventDate: event.startDate,
              eventName: event.name,
              imageFlyer: event.imageFlyer,
              location: event.location.location,
              city: event.location.city,
              emailsData: {
                eventId: data.eventId,
                id: data.id,
                firstName: data.firstName,
                email: data.email,
              },
            };
            sendGuestEventApproval(createMailPayload, event.timeZone);
          }
        });
      }

      if (
        updatedGuests.length > 0 &&
        confirmedGuestsEmailsWithoutRequest.length > 0 &&
        payload.sendInvite
      ) {
        const event = await this.dbConnection.getRepository(Event).findOne({
          where: { id: confirmedGuestsEmailsWithoutRequest[0].eventId },
          relations: { location: true, owner: true },
        });
        confirmedGuestsEmailsWithoutRequest.map(data => {
          const createMailPayload = {
            eventDate: event.startDate,
            eventName: event.name,
            imageFlyer: event.imageFlyer,
            location: event.location.location,
            city: event.location.city,
            hostName: event.owner?.additionalHostInformation.companyName ?? 'Host',
            emailsData: {
              eventId: data.eventId,
              id: data.id,
              firstName: data.firstName,
              email: data.email,
            },
          };
          sendEventInviteToConfirmedGuest(createMailPayload, event.timeZone);
          if (data.phoneNumber) {
            let link = `${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;

            const message = ` Hi ${data?.firstName ? data.firstName : 'Guest'},\n\n${event.owner?.additionalHostInformation.companyName ?? 'Host'} has added you to the guest list for ${event.name}.\n\nDownload the Rumor app and log in with this phone number: ${data.phoneNumber} to view your confirmation.\n\nNeed help? Contact us at support@therumor.com.\n\n${link}`;
            try {
              const validateNumber = isValidPhoneNumber(data.phoneNumber);
              if (validateNumber) {
                const cleanedNumber = data.phoneNumber.replace(/[\s\-()]/g, '').trim();
                serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
              }
            } catch (err) {
              console.log(`❌ Error while processing SMS for ${data.phoneNumber}:`, err);
            }
          }
        });
      }
      // Fetch and transform updated guest data for response
      const updatedGuestIds = updatedGuests.map(el => el.id);
      const rowsUpdated = await this.dbConnection.getRepository(Guest).find({
        where: { id: In(updatedGuestIds) },
        relations: { user: true },
      });

      // Fetch additional user-related data and map it into the response format
      const guestsTransform = await Promise.all(
        rowsUpdated.map(async guest => {
          const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
          return toGuestDataSimple(guest, focuses);
        }),
      );

      // Return transformed guest data
      return guestsTransform;
    } catch (err) {
      // Log and return error response in case of failure
      throw new BadRequestError('Error updating guests');
    }
  }

  /**
   * Removes guests from an event based on the provided guest IDs.
   *
   * This function performs the following steps:
   * - Validates the event existence.
   * - Checks if guests are provided.
   * - Deletes guests who match the provided IDs.
   * - Handles errors and logs failures appropriately.
   *
   * @param {GuestsRequestDto} payload - The request payload containing event ID and guest IDs.
   * @returns {Promise<GenericResponse>} - A response indicating the success or failure of the operation.
   */
  private static async manageGuestsRemoval(payload: GuestsRequestDto): Promise<string> {
    const { eventId, guests } = payload;

    // Validate event existence
    const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    // Ensure there are guests to delete
    if (!guests || guests.length === 0) throw new NotFoundError('No invites to withdraw');

    try {
      // Remove guests who match the provided guest IDs
      await this.dbConnection.getRepository(Guest).delete({ id: In(guests) });

      return 'Guests removed successfully';
    } catch (err) {
      // Log error and return failure response
      throw new BadRequestError('Error handling guests data');
    }
  }

  public static async withdrawInvites(payload: GuestsRequestDto): Promise<GenericResponse> {
    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: payload.eventId } });
    if (!event) throw new NotFoundError('Event not found');

    if (!payload.guests) throw new NotFoundError('No invites to withdraw');

    const guestsIds = payload.guests;

    await this.dbConnection
      .getRepository(Guest)
      .createQueryBuilder()
      .update(Guest)
      .set({ status: GuestStatus.NO_STATUS })
      .where('event_id = :eventId', { eventId: event.id })
      .andWhere('id IN (:...ids)', { ids: guestsIds })
      .execute();

    return responses.ok;
  }

  public static async getGuests(payload: GuestsQueryRequestDto): Promise<Guests> {
    const { hostId, eventId } = payload;
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const socialNetworkNames = parsedQuery?.socialNetworkNames
      ? parsedQuery.socialNetworkNames
      : undefined;
    const followerCountFrom = parsedQuery?.followerCountFrom
      ? parseInt(parsedQuery.followerCountFrom as string)
      : undefined;
    const followerCountTo = parsedQuery?.followerCountTo
      ? parseInt(parsedQuery.followerCountTo as string)
      : undefined;
    const searchValue = parsedQuery?.searchValue as string; // Cast to string
    const gender = parsedQuery?.gender;
    const focuses = parsedQuery?.category;
    const baseCity = parsedQuery?.basecity;
    const interest = parsedQuery?.interest;
    const ticketType = parsedQuery?.ticketType;
    const partySize = parsedQuery?.partySize;
    const vouch = parsedQuery?.vouch;
    const checkedInStatus = parsedQuery?.checkedIn;
    const userSource = parsedQuery?.userSource;
    const declinedBy = parsedQuery?.declinedBy;
    const isFromAdmin = parsedQuery?.isFromAdmin ? true : false;
    const spam = parsedQuery?.spammed;
    const customListName = parsedQuery.list;
    const systemDefaultLists = ['myFavourites-systemDefault', 'myFollowers-systemDefault'];
    let pastEventsIds: string[] =
      (parsedQuery.pastEvents as string)
        ?.split(',')
        .map(id => id.trim())
        .filter(node => node) || [];

    let favorite = false;
    let followed = false;
    let customListNames: string[] = [];
    if (customListName && customListName.length) {
      if (customListName && typeof customListName === 'string') {
        const allListNames = customListName.split(',').map(name => name.trim());
        // Separate system default lists and update customListName
        const separatedLists = allListNames.filter(item => systemDefaultLists.includes(item));
        customListNames = allListNames.filter(item => !systemDefaultLists.includes(item));
        favorite = separatedLists.includes('myFavourites-systemDefault');
        followed = separatedLists.includes('myFollowers-systemDefault');
      }
    }

    const { error: validationError, response: validation } = validateFilters(payload.query);
    if (validationError) throw new ValidationError(validation);
    const guestStatus = parsedQuery?.status
      ? parsedQuery.status.toString().toUpperCase()
      : undefined;

    let socialNetworkObject: {
      [key in keyof typeof SocialProviderType]?: string;
    } = {};
    if (typeof socialNetworkNames === 'string') {
      const socialNetworkArray = socialNetworkNames
        .split(',')
        .map(name => name.trim().toUpperCase());
      socialNetworkObject = socialNetworkArray.reduce(
        (acc, name) => {
          acc[name] = SocialProviderType[name as keyof typeof SocialProviderType];
          return acc;
        },
        {} as { [key in keyof typeof SocialProviderType]?: string },
      );
    }

    const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    const queryBuilder = this.dbConnection
      .getRepository(Guest)
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .leftJoinAndSelect('user.socialProviders', 'socialProvider')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.vouchRequests', 'vouchRequest')
      .leftJoinAndSelect('user.managedByHosts', 'hostUserSettings') // Join using the managedByHosts relation
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .leftJoinAndSelect('guest.declinedBy', 'declinedBy')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .where({ event: { id: event.id } });

    if (!isFromAdmin) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('guest.addedBy.id = :hostId', { hostId: hostId }).orWhere(
            'guest.status = :status AND guest.addedBy.id IS NULL',
            { status: 'APPLIED' },
          );
        }),
      );
    }

    queryBuilder.take(take).skip(skip);

    if (guestStatus) {
      if (guestStatus === 'DECLINED') {
        queryBuilder.andWhere('guest.status IN (:...statuses)', {
          statuses: [GuestStatus.DECLINED, GuestStatus.REFUSED],
        });
      } else {
        queryBuilder.andWhere({ status: GuestStatus[guestStatus] });
      }
    }

    if (parsedQuery.sortBy === 'name') {
      const sortDirection = parsedQuery.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder
        .addOrderBy('user.firstName', sortDirection)
        .addOrderBy('user.lastName', sortDirection);
    } else {
      queryBuilder.orderBy('guest.createdAt', 'DESC');
    }

    await this.applyUserFilters(
      queryBuilder,
      parsedQuery,
      payload,
      searchValue,
      focuses,
      interest,
      gender,
      baseCity,
      event,
      declinedBy,
      socialNetworkObject,
      followerCountFrom,
      followerCountTo,
      ticketType,
      partySize,
      vouch,
      spam,
      favorite,
      followed,
      customListNames,
      userSource,
      checkedInStatus,
      pastEventsIds,
    );
    const [guests, totalCount] = await queryBuilder.getManyAndCount();
    const buildGuests = await Promise.all(
      guests.map(async guest => {
        const additionalGuests = await this.dbConnection.getRepository(Guest).find({
          relations: ['user', 'ticketType', 'declinedBy', 'user.address'],
          where: { addedBy: { id: guest.user.id }, event: { id: event.id } },
        });

        const additionalGuestData = await Promise.all(
          additionalGuests.map(async additionalGuest => {
            const user = await this.dbConnection.getRepository(User).findOne({
              where: { id: additionalGuest.user.id },
            });
            const [plusOnesFocuses, plusOnesInterests] = await Promise.all([
              (await serviceMesh.userService().getUserFocuses(user.id)).data,
              (await serviceMesh.userService().getUserInterests(user.id)).data,
            ]);
            const hostUserSettings = await this.dbConnection
              .getRepository(HostUserSettings)
              .findOne({
                where: {
                  user: { id: user.id },
                  host: { id: payload.hostId },
                },
              });
            const isBanned = hostUserSettings ? hostUserSettings.isSpam : false;
            const guestData = toAdditionalGuestData(
              additionalGuest,
              plusOnesFocuses,
              plusOnesInterests,
            );
            return { ...guestData, isBanned };
          }),
        );
        const [focuses, interests, vouches] = await Promise.all([
          (await serviceMesh.userService().getUserFocuses(guest.user.id)).data,
          (await serviceMesh.userService().getUserInterests(guest.user.id)).data,
          await VouchRequestService.getUserVouchesByEvent({
            requesterId: guest.user.id,
            eventId: event.id,
          }),
        ]);
        const hostUserSettings = await this.dbConnection.getRepository(HostUserSettings).findOne({
          where: {
            user: { id: guest.user.id },
            host: { id: payload.hostId },
          },
        });
        const isBanned = hostUserSettings ? hostUserSettings.isSpam : false;
        const guestData = toGuest(
          guest,
          focuses,
          socialNetworkObject,
          vouches,
          undefined,
          interests,
        );
        return {
          ...guestData,
          isBanned,
          additionalGuests: additionalGuestData,
        };
      }),
    );
    // TO DO: Fix this functionality
    return { result: buildGuests, totalCount };
  }

  public static async applyUserFilters(
    queryBuilder,
    parsedQuery,
    payload,
    searchValue,
    focuses,
    interest,
    gender,
    baseCity,
    event,
    declinedBy,
    socialNetworkObject,
    followerCountFrom,
    followerCountTo,
    ticketType,
    partySize,
    vouch,
    spam,
    favorite,
    followed,
    customListNames,
    userSource,
    checkedInStatus,
    pastEventsIds,
  ) {
    // Apply search value filter
    if (searchValue) {
      const searchWords = searchValue.trim().split(/\s+/);
      queryBuilder.andWhere(
        new Brackets(qb => {
          searchWords.forEach((word, index) => {
            const param = `%${word}%`;

            // Match the main guest's name
            qb.orWhere(
              `(user.first_name ILIKE :word${index} OR user.last_name ILIKE :word${index})`,
              { [`word${index}`]: param },
            );
            // Match additional guest's name
            qb.orWhere(
              `EXISTS (
                SELECT 1 FROM guest ag
                INNER JOIN "user" au ON au.id = ag.user_id
                WHERE ag.added_by_id = "user".id
                  AND ag.event_id = :eventId
                  AND (au.first_name ILIKE :aword${index} OR au.last_name ILIKE :aword${index})
              )`,
              {
                [`aword${index}`]: param,
                eventId: event.id,
              },
            );
          });
        }),
      );
    }
    if (pastEventsIds.length) {
      const confirmedStatus = GuestStatus.CONFIRMED;
      queryBuilder.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('g.user_id')
          .from(Guest, 'g')
          .where('g.event_id IN (:...pastEventsIds)', { pastEventsIds })
          .andWhere('g.status = :confirmedStatus', { confirmedStatus })
          .andWhere('g.check_in = true')
          .getQuery();
        return 'user.id IN (' + subQuery + ')';
      });
    }

    if (checkedInStatus) {
      const checkedInFilters =
        typeof checkedInStatus === 'string' ? checkedInStatus.split(',') : checkedInStatus;
      if (checkedInFilters.includes('checkedIn') && !checkedInFilters.includes('notCheckedIn')) {
        queryBuilder.andWhere('guest.checkIn = :checkedIn', {
          checkedIn: true,
        });
      } else if (
        checkedInFilters.includes('notCheckedIn') &&
        !checkedInFilters.includes('checkedIn')
      ) {
        queryBuilder.andWhere('guest.checkIn = :notCheckedIn', {
          notCheckedIn: false,
        });
      }
    }

    if (Object.keys(socialNetworkObject).length > 0) {
      const socialConditions = Object.keys(socialNetworkObject).map(networkKey => {
        const columnName = `${networkKey.toLowerCase()}FollowersCount`;
        return `(socialStats.${columnName} BETWEEN :followerCountFrom AND :followerCountTo)`;
      });

      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where(socialConditions.join(' OR '), {
            followerCountFrom: followerCountFrom || 0,
            followerCountTo: followerCountTo || Number.MAX_SAFE_INTEGER,
          });
        }),
      );
    }

    if (favorite || followed || customListNames.length > 0) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          if (favorite) {
            qb.orWhere(subQb => {
              const subQuery = subQb
                .subQuery()
                .select('hostFavorite.member.id')
                .from(HostFavorite, 'hostFavorite')
                .where('hostFavorite.host.id = :hostId', {
                  hostId: payload.hostId,
                })
                .getQuery();
              return `user.id IN ${subQuery}`;
            });
          }
          if (followed) {
            qb.orWhere(subQb => {
              const subQuery = subQb
                .subQuery()
                .select('hostFollow.follower.id')
                .from(HostFollowing, 'hostFollow')
                .where('hostFollow.host.id = :hostId', {
                  hostId: payload.hostId,
                })
                .getQuery();
              return `user.id IN ${subQuery}`;
            });
          }
          if (customListNames.length > 0) {
            qb.orWhere(subQb => {
              const subQuery = subQb
                .subQuery()
                .select('listUsers.user.id')
                .from(HostCustomUsersLists, 'customList')
                .innerJoin('customList.usersLists', 'listUsers')
                .where('customList.listName IN (:...customListNames)', {
                  customListNames,
                })
                .andWhere('customList.host.id = :hostId', {
                  hostId: payload.hostId,
                })
                .getQuery();
              return `user.id IN ${subQuery}`;
            });
          }
        }),
      );
    }

    // Apply focuses filter
    if (focuses && typeof focuses === 'string') {
      const focusIds = focuses.split(',').map(id => id.trim());
      queryBuilder.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('focus_users_user.userId')
          .from('focus_users_user', 'focus_users_user')
          .where('focus_users_user.focusId IN (:...focusIds)', { focusIds })
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
    }

    // Apply interests filter
    if (interest && typeof interest === 'string') {
      const interestFilter = interest.split(',').map(interestName => interestName.trim());
      queryBuilder.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('interest_users_user.userId')
          .from('interest_users_user', 'interest_users_user')
          .where('interest_users_user.interestId IN (:...interestFilter)', {
            interestFilter,
          })
          .getQuery();
        return `user.id IN ${subQuery}`;
      });
    }

    // Apply gender filter
    if (gender && typeof gender === 'string') {
      const genderFilter = gender.split(',').map(g => g.trim().toUpperCase());
      const validGenders = Object.values(Gender) as string[];
      const filteredGenders = genderFilter.filter(g => validGenders.includes(g)) as Gender[];
      if (filteredGenders.length > 0) {
        queryBuilder.andWhere('user.gender IN (:...filteredGenders)', {
          filteredGenders,
        });
      }
    }

    // Apply baseCity filter
    if (baseCity && typeof baseCity === 'string') {
      const placeIds = baseCity.split(',').map(id => id.trim());
      if (placeIds.length > 0) {
        queryBuilder.andWhere(qb => {
          const subQuery = qb
            .subQuery()
            .select('address.id')
            .from('address', 'address')
            .where('address.google_place_id IN (:...placeIds)', { placeIds })
            .getQuery();
          return `user.address_id IN ${subQuery}`;
        });
      }
    }

    // Apply age filter
    if (parsedQuery.ageFrom || parsedQuery.ageTo) {
      const ageFrom =
        parsedQuery.ageFrom && typeof parsedQuery.ageFrom === 'string' && parsedQuery.ageFrom.trim()
          ? parseInt(parsedQuery.ageFrom, 10)
          : 0;
      const ageTo =
        parsedQuery.ageTo &&
        typeof parsedQuery.ageTo === 'string' &&
        parsedQuery.ageTo.trim() &&
        parsedQuery.ageTo !== 'No Max'
          ? parseInt(parsedQuery.ageTo, 10)
          : null;
      const ageQuery = `EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(user.date_of_birth, 'MM/DD/YYYY')))`;
      const conditions: string[] = [`${ageQuery} >= :ageFrom`];
      if (ageTo !== null) {
        conditions.push(`${ageQuery} <= :ageTo`);
      }
      queryBuilder.andWhere(conditions.join(' AND '), { ageFrom, ageTo });
    }

    // Apply ticket type filter

    if (ticketType) {
      const ticketTypes = typeof ticketType === 'string' ? ticketType.split(',') : ticketType;
      queryBuilder.andWhere('guest.ticketType.id IN (:...ticketTypes)', {
        ticketTypes,
      });
    }

    // Apply partySize filter

    if (partySize) {
      queryBuilder.andWhere('guest.maxAdditionalGuests + 1 = :partySize', {
        partySize: partySize,
      });
    }

    // Apply vouch filter
    if (vouch) {
      const vouchFilters = typeof vouch === 'string' ? vouch.split(',') : vouch;
      if (vouchFilters.includes('hasVouches')) {
        queryBuilder
          .andWhere('vouchRequest.event_id = :eventId', { eventId: event.id })
          .andWhere('vouchRequest.user_id = user.id');
      }
      if (vouchFilters.includes('hasNoVouches')) {
        queryBuilder.andWhere(
          'NOT EXISTS (SELECT 1 FROM vouch_request v WHERE v.event_id = :eventId AND v.user_id = user.id)',
          { eventId: event.id },
        );
      }
    }

    // Apply declinedBy filter
    if (declinedBy) {
      const declinedByFilters = typeof declinedBy === 'string' ? declinedBy.split(',') : declinedBy;
      if (declinedByFilters.includes('declinedByCollaborator')) {
        queryBuilder
          .leftJoin('Collaborator', 'collaborator1', 'collaborator1.user_id = guest.declinedBy.id')
          .andWhere('collaborator1.user_id IS NOT NULL');
      }
      if (declinedByFilters.includes('declinedByUser')) {
        queryBuilder.andWhere('guest.declinedBy.id = guest.user.id');
      }
    }

    // Apply spam filter

    if (spam) {
      const spamFilters = typeof spam === 'string' ? spam.split(',') : spam;
      const isSpammedSelected = spamFilters.includes('isSpammed');
      const isNotSpammedSelected = spamFilters.includes('isNotSpammed');

      if (isSpammedSelected || isNotSpammedSelected) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            if (isSpammedSelected) qb.orWhere('hostUserSettings.isSpam = true');
            if (isNotSpammedSelected)
              qb.orWhere('hostUserSettings.isSpam = false').orWhere(
                'hostUserSettings.user IS NULL',
              );
          }),
        );
      }
    }

    // Apply invitationSource filter
    if (userSource) {
      const userSourceFilters = typeof userSource === 'string' ? userSource.split(',') : [];
      if (userSourceFilters.length > 0) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            userSourceFilters.forEach((source, index) => {
              qb.orWhere('guest.invitationSource = :source' + index, {
                ['source' + index]: UserSource[source],
              });
            });
          }),
        );
      }
    }

    return queryBuilder;
  }

  public static async deleteGuests(payload: GuestsRequestDto): Promise<GenericResponse> {
    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: payload.eventId } });
    if (!event) throw new NotFoundError('Event not found');

    if (!payload.guests) throw new BadRequestError('No guests to delete');

    const guestsIds = payload.guests;

    await this.dbConnection
      .getRepository(Guest)
      .createQueryBuilder()
      .softDelete()
      .from(Guest)
      .where('event_id = :eventId', { eventId: event.id })
      .andWhere('id IN (:...ids)', { ids: guestsIds })
      .execute();

    return responses.ok;
  }

  public static async listGuestsOverview(
    payload: GuestsQueryRequestDto,
  ): Promise<GuestDataSimple[]> {
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;

    const andConditions = [];
    const addCondition = (condition: object) => {
      if (condition && Object.keys(condition).length > 0) {
        andConditions.push(condition);
      }
    };

    if (parsedQuery.guestStatus) {
      const guestStatusArray = (parsedQuery.guestStatus as string)
        .split(',')
        .map(status => status.trim());
      const invalidStatuses = guestStatusArray.filter(status => !isValidGuestStatus(status));
      if (invalidStatuses.length > 0) {
        throw new ValidationError(`Invalid status values: ${invalidStatuses.join(', ')}`);
      }
      addCondition({ status: In(guestStatusArray) });
    }
    addCondition({ event: { id: payload.eventId } });

    addCondition(
      parsedQuery.guestName && {
        user: [
          { firstName: ILike(`${parsedQuery.guestName}%`) },
          { lastName: ILike(`${parsedQuery.guestName}%`) },
          { username: ILike(`${parsedQuery.guestName}%`) },
        ],
      },
    );

    if (parsedQuery.gender) {
      const gender = String(parsedQuery.gender).trim().toUpperCase();
      const validateGender = isValidUserGender(gender);
      if (!validateGender) throw new ValidationError(`Invalid gender value ${parsedQuery.gender}`);
      addCondition({ user: { gender } });
    }

    if (parsedQuery.ticketTypeIds) {
      const ticketTypes = (parsedQuery.ticketTypeIds as string)
        .split(',')
        .map(ticketTypeId => ticketTypeId.trim());
      addCondition({ ticketType: { id: In(ticketTypes) } });
    }

    const whereClause =
      andConditions.length > 0
        ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {})
        : {};

    const column = parsedQuery.sortBy ? String(parsedQuery.sortBy) : 'firstName';
    const sortOrder = parsedQuery.order ? String(parsedQuery.order) : 'ASC';
    let order = undefined;

    if (['firstName', 'lastName', 'username'].includes(column)) {
      order = {
        user: {
          [column]: sortOrder,
        },
      };
    } else if (column == 'partySize') {
      order = {
        maxAdditionalGuests: 'DESC',
      };
    } else if (column == 'ticketType') {
      order = {
        ticketType: {
          name: sortOrder,
        },
      };
    }

    const relations = {
      user: true,
      ticketType: true,
    };

    const guests = await this.dbConnection.getRepository(Guest).find({
      where: whereClause,
      order: order,
      relations,
      take,
      skip,
    });
    const guestsTransform = await Promise.all(
      guests.map(async guest => {
        const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
        return toGuestDataSimple(guest, focuses);
      }),
    );

    let filteredGuests = guestsTransform;

    if (parsedQuery.fromAge || parsedQuery.toAge) {
      const fromAge = parsedQuery.fromAge ? parseInt(parsedQuery.fromAge as string) : 0;
      const toAge = parsedQuery.toAge ? parseInt(parsedQuery.toAge as string) : null;

      filteredGuests = filteredGuests.filter(
        guest => guest.age >= fromAge && (toAge === null || guest.age <= toAge),
      );
    }

    if (parsedQuery.categoryNames) {
      const categories = (parsedQuery.categoryNames as string)
        .split(',')
        .map(category => category.trim().toLowerCase());

      filteredGuests = filteredGuests.filter(guest =>
        guest.category?.some(cat => categories.includes(cat.toLowerCase())),
      );
    }

    return filteredGuests;
  }

  public static async listGuestProfiles(
    payload: GuestsQueryRequestDto,
  ): Promise<GuestDataSimple[]> {
    const parsedQuery = parse(payload.query);
    const pagination = hasPagination(parsedQuery)
      ? {
          take: parseInt(parsedQuery.take),
          skip: parseInt(parsedQuery.skip),
        }
      : {};

    const andConditions = [];
    const orConditions = [];
    const addCondition = (condition: object, operator: 'AND' | 'OR' = 'AND') => {
      if (condition && Object.keys(condition).length > 0) {
        if (operator === 'AND') {
          andConditions.push(condition);
        } else {
          orConditions.push(condition);
        }
      }
    };

    //conditions
    if (parsedQuery.nonMembers) {
      addCondition(
        {
          user: {
            roles: { role: { name: 'non_member' } },
          },
        },
        'AND',
      );
    } else {
      addCondition(
        {
          user: {
            roles: {
              role: {
                name: 'member',
              },
            },
          },
        },
        'AND',
      );
    }

    addCondition(
      parsedQuery.findByName && {
        user: {
          firstName: ILike(`%${parsedQuery.findByName}%`),
        },
      },
      'AND',
    );
    addCondition(
      parsedQuery.findByEmail && {
        user: {
          email: ILike(`%${parsedQuery.findByEmail}%`),
        },
      },
      'AND',
    );

    addCondition(
      parsedQuery.roleStatus && {
        user: {
          roles: {
            status: parsedQuery.roleStatus,
          },
        },
      },
      'AND',
    );

    addCondition(parsedQuery.guestStatus && { status: parsedQuery.guestStatus }, 'AND');
    addCondition(parsedQuery.partySize && { partySize: parsedQuery.partySize }, 'AND');
    addCondition(
      parsedQuery.maxAdditionalGuests && {
        maxAdditionalGuests: parsedQuery.maxAdditionalGuests,
      },
      'AND',
    );
    addCondition(
      parsedQuery.maxAdditionalGuests && {
        maxAdditionalGuests: parsedQuery.maxAdditionalGuests,
      },
      'AND',
    );
    addCondition(parsedQuery.addedById && { addedBy: { id: parsedQuery.addedById } }, 'AND');
    addCondition(
      parsedQuery.declinedById && {
        declinedBy: { id: parsedQuery.declinedById },
      },
      'AND',
    );
    addCondition({ event: { id: payload.eventId } }, 'AND');

    const whereClause =
      andConditions.length > 0
        ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {})
        : {};
    const orClause = orConditions.length > 0 ? orConditions : undefined;
    const order = parsedQuery.sortBy
      ? {
          [String(parsedQuery.sortBy)]: String(parsedQuery.order || 'ASC').toUpperCase(),
        }
      : undefined;
    const relations = {
      user: {
        address: true,
        hostedEvents: true,
        socialStats: true,
        interests: true,
        roles: {
          role: true,
        },
      },
    };
    const guests = await this.dbConnection.getRepository(Guest).find({
      where: orClause ? [whereClause, ...orClause] : whereClause,
      order: order,
      ...pagination,
      relations,
    });

    const guestsTransform = await Promise.all(
      guests.map(async guest => {
        const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
        return toGuestDataSimple(guest, focuses);
      }),
    );

    return guestsTransform;
  }

  public static async getGuestProfile(payload: UserAndIdRequestDto): Promise<GuestData> {
    const guest = (
      await this.dbConnection.getRepository(Guest).find({
        where: {
          id: payload.id,
          user: {
            deletedAt: IsNull(),
            roles: {
              role: {
                name: In(['member', 'non_member']),
              },
            },
          },
        },
        take: 1,
        relations: {
          user: {
            address: true,
            hostedEvents: true,
            socialStats: true,
            interests: true,
            roles: {
              role: true,
            },
            following: {
              follower: true,
              host: true,
            },
            favoritedByHosts: {
              host: true,
              member: true,
            },
          },
          addedBy: true,
          declinedBy: true,
          event: {
            owner: true,
          },
        },
      })
    )[0];
    if (!guest) {
      throw new NotFoundError('Guest not found');
    }
    const followsYou = guest.user.following?.some(f => f.host?.id === payload.userId) ?? false;
    const favorite = guest.user.favoritedByHosts?.some(f => f.host?.id === payload.userId) ?? false;
    const hostUserSettings = await this.dbConnection.getRepository(HostUserSettings).findOne({
      where: {
        user: { id: guest.user?.id },
        host: { id: payload.userId },
      },
    });
    const isSpammedByHost = hostUserSettings ? hostUserSettings.isSpam : false;

    const additionalGuests = await this.dbConnection.getRepository(Guest).find({
      relations: {
        user: true,
        addedBy: true,
        event: true,
      },
      where: {
        addedBy: { id: guest.user.id },
        event: { id: guest.event.id },
      },
    });

    const additionalGuestData = await Promise.all(
      additionalGuests.map(async additionalGuest => {
        const user = await this.dbConnection.getRepository(User).findOne({
          where: { id: additionalGuest.user.id },
        });
        return {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          gender: user?.gender,
          guestId: additionalGuest?.id,
          addedBy: additionalGuest?.addedBy.id,
          addedByPicture: additionalGuest.addedBy ? additionalGuest.addedBy?.profilePicture : '',
          privateGuestNote: additionalGuest?.privateGuestNote,
          checkIn: additionalGuest?.checkIn,
          status: additionalGuest?.status,
        };
      }),
    );

    const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
    const interests = (await serviceMesh.userService().getUserInterests(guest.user.id)).data;

    const hostUserMapping = await this.dbConnection.getRepository(HostUserMapping).findOne({
      where: { user: { id: guest.user.id }, host: { id: guest.event.owner.id } },
    });
    const val = toGuestData(
      guest.user,
      guest,
      focuses,
      interests,
      followsYou,
      favorite,
      additionalGuestData,
      isSpammedByHost,
    );

    return {
      ...val,
      hostUserMappingId: hostUserMapping?.id ?? '',
    };
  }

  public static async getUsersEventInvitees(
    payload: ListUsersInviteesDto,
    token: string,
  ): Promise<UserEventInviteesData[]> {
    const { userId, query: initialQuery } = payload;
    const parsedQuery = parse(initialQuery) as ParsedQs;
    const user = (await serviceMesh.userService(token).getBasicHostProfile(userId)).data;
    if (!user) throw new NotFoundError('User is not a host.');
    let usersQuery = initialQuery;
    if (parsedQuery.eventId) {
      const eventId = Array.isArray(parsedQuery.eventId)
        ? parsedQuery.eventId[0]
        : parsedQuery.eventId;

      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: eventId as string },
        relations: { guests: { user: true } },
      });

      if (event) {
        let guests = event.guests;
        if (parsedQuery.guestStatus) {
          guests = guests.filter(
            guest => guest.status === GuestStatus[parsedQuery.guestStatus as string],
          );
        }

        if (parsedQuery.myGuests && parsedQuery.myGuests === 'true') {
          guests = guests.filter(guest => guest.addedBy?.id === userId);
        }

        const userIds = guests.map(guest => guest.user.id);
        if (userIds.length > 0) {
          const userIdsParam = userIds.join(',');
          usersQuery += `&usersIds=${userIdsParam}`;
        }
      }
    } else if (parsedQuery.myGuests && parsedQuery.myGuests === 'true') {
      const guests = await this.dbConnection.getRepository(Guest).find({
        where: { addedBy: { id: userId } },
        relations: { user: true },
      });

      const userIds = guests.map(guest => guest.user.id);
      if (userIds.length > 0) {
        const userIdsParam = userIds.join(',');
        usersQuery += `&usersIds=${userIdsParam}`;
      }
    }

    const users = (await serviceMesh.userService().getMembersOrNonMembers(userId, usersQuery)).data;
    const inviteesDataList = await this.mapUsersToInvitees(
      users,
      userId,
      String(parsedQuery.guestStatus),
    );

    return inviteesDataList;
  }

  // Helper function to map users to invitees
  public static async mapUsersToInvitees(users: Member[], userId: string, guestStatus?: string) {
    return Promise.all(
      users.map(async user => {
        const guestRecords = await this.dbConnection.getRepository(Guest).find({
          where: {
            user: { id: user.id },
            event: { owner: { id: userId } },
            ...(guestStatus && { status: GuestStatus[guestStatus] }),
          },
          relations: { addedBy: { addedGuests: true }, event: true },
        });

        const addedByList = guestRecords.flatMap(
          guest =>
            guest.addedBy?.addedGuests.map(g => ({
              addedBy: `${guest.addedBy?.firstName || ''} ${guest.addedBy?.lastName || ''}`,
              status: Object.keys(GuestStatus).indexOf(g.status),
              eventId: guest.event.id,
            })) || [],
        );

        return {
          ...user,
          category: user.types,
          baseCity: user.city,
          addedBy: addedByList,
        };
      }),
    );
  }

  public static async listSimpleGuestEvents(userId: string): Promise<SimpleGuestEventsResponse> {
    const events = await this.dbConnection.getRepository(Event).find({
      where: {
        guests: {
          user: {
            id: userId,
          },
          status: In([GuestStatus.INVITED, GuestStatus.APPLIED, GuestStatus.CONFIRMED]),
        },
        status: EventStatusEnum.APPROVED_STATUS,
      },
      relations: ['guests'],
    });

    const response = {
      upcoming: [] as SimpleGuestEventData[],
      invited: [] as SimpleGuestEventData[],
      past: [] as SimpleGuestEventData[],
      requested: [] as SimpleGuestEventData[],
    };

    const dateNow = new Date();

    events.forEach(event => {
      const simpleEvent: SimpleGuestEventData = {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        imageCover: event.imageCover,
        imageFlyer: event.imageFlyer,
      };

      const guest = event.guests[0];

      if (guest.status === GuestStatus.CONFIRMED && dayjs(event.endDate).isAfter(dateNow)) {
        response.upcoming.push(simpleEvent);
      }
      if (guest.status === GuestStatus.APPLIED && dayjs(event.endDate).isAfter(dateNow)) {
        response.requested.push(simpleEvent);
      }
      if (guest.status === GuestStatus.INVITED && dayjs(event.endDate).isAfter(dateNow)) {
        response.invited.push(simpleEvent);
      }
      if (guest.status === GuestStatus.CONFIRMED && dayjs(event.endDate).isBefore(dateNow)) {
        response.past.push(simpleEvent);
      }
    });

    const totalEvents = Object.values(response).reduce((acc, curr) => acc + curr.length, 0);

    return { ...response, totalEvents };
  }

  public static async listEventGuests(
    payload: ListEventGuestsDto,
  ): Promise<PaginatedGuestEventsResponse> {
    const user = await this.dbConnection
      .getRepository(User)
      .findOne({ where: { id: payload.userId } });
    const eventResponse = { result: [], totalCount: 0 };
    if (!user) {
      throw new NotFoundError('user');
    }

    const parsedQuery = parse(payload.query);
    const pagination = hasPagination(parsedQuery)
      ? {
          take: parseInt(parsedQuery.take),
          skip: parseInt(parsedQuery.skip),
        }
      : {};

    const andConditions = [];
    const orConditions = [];
    const addCondition = (condition: object, operator: 'AND' | 'OR' = 'AND') => {
      if (condition && Object.keys(condition).length > 0) {
        if (operator === 'AND') {
          andConditions.push(condition);
        } else {
          orConditions.push(condition);
        }
      }
    };

    const addLocationCondition = async (longitude: number, latitude: number) => {
      if (longitude && latitude) {
        const eventsNear = await this.dbConnection.getRepository(Event).find({
          where: {
            deletedAt: null,
            enabled: true,
          },
          relations: ['location'],
        });

        const locationsToFind: EventLocationInterface[] = eventsNear.map(item => {
          return {
            lat: Number(item?.location?.latitude || 0),
            long: Number(item?.location?.longitude || 0),
            id_event: String(item.id || ''),
            id_location: String(item?.location?.id || ''),
          };
        });

        const locations = this.filterLocationsByDistance(latitude, longitude, locationsToFind);
        const locationsWhere = locations.map(item => item.id_event);

        // if (locationsWhere.length > 0) {
        return { id: In(locationsWhere) };
        // }
      }
      return null;
    };

    const locationCondition = await addLocationCondition(
      Number(parsedQuery.longitude),
      Number(parsedQuery.latitude),
    );
    addCondition(locationCondition, 'AND');

    let status: EventStatusEnum[];
    if (parsedQuery.statusName) {
      status = String(parsedQuery.statusName)
        .split(',')
        .map(item => {
          return item as EventStatusEnum;
        });
    }

    addCondition(parsedQuery.ownerId && { owner: { id: parsedQuery.ownerId } }, 'AND');
    addCondition(parsedQuery.eventTypeId && { eventType: { id: parsedQuery.eventTypeId } }, 'AND');
    addCondition(
      parsedQuery.eventTypeName && {
        eventType: { name: parsedQuery.eventTypeName },
      },
      'AND',
    );
    addCondition(
      parsedQuery.eventTypeIds && {
        eventType: {
          id: In(
            String(parsedQuery.eventTypeIds)
              .split(',')
              .map(id => id.trim()),
          ),
        },
      },
      'AND',
    );
    addCondition(
      parsedQuery.eventTypeNames && {
        eventType: {
          name: In(
            String(parsedQuery.eventTypeNames)
              .split(',')
              .map(name => name.trim()),
          ),
        },
      },
      'AND',
    );
    addCondition(
      parsedQuery.ticketTypeNames && {
        eventType: {
          name: In(
            String(parsedQuery.ticketTypeNames)
              .split(',')
              .map(id => id.trim()),
          ),
        },
      },
      'AND',
    );

    addCondition(
      parsedQuery.maxStartDate && {
        startDate: LessThanOrEqual(new Date(String(parsedQuery.maxStartDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.minStartDate && {
        startDate: MoreThanOrEqual(new Date(String(parsedQuery.minStartDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.minEndDate && {
        endDate: MoreThanOrEqual(new Date(String(parsedQuery.minEndDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.maxEndDate && {
        endDate: LessThanOrEqual(new Date(String(parsedQuery.maxEndDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.startDate && {
        startDate: LessThanOrEqual(new Date(String(parsedQuery.startDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.startDate && {
        startDate: MoreThanOrEqual(new Date(String(parsedQuery.startDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.endDate && {
        endDate: MoreThanOrEqual(new Date(String(parsedQuery.endDate))),
      },
      'AND',
    );
    addCondition(
      parsedQuery.endDate && {
        endDate: LessThanOrEqual(new Date(String(parsedQuery.endDate))),
      },
      'AND',
    );

    addCondition(
      parsedQuery.minAgeLimit && {
        ageLimit: { minAge: MoreThanOrEqual(parsedQuery.minAgeLimit) },
      },
      'AND',
    );
    addCondition(
      parsedQuery.maxAgeLimit && {
        ageLimit: { maxAge: LessThanOrEqual(parsedQuery.maxAgeLimit) },
      },
      'AND',
    );
    addCondition(
      parsedQuery.ageLimitName && {
        ageLimit: { name: ILike(parsedQuery.ageLimitName) },
      },
      'AND',
    );
    addCondition(
      parsedQuery.ageLimitDescription && {
        ageLimit: { description: ILike(parsedQuery.ageLimitDescription) },
      },
      'AND',
    );
    addCondition(parsedQuery.ageLimitId && { ageLimit: { id: parsedQuery.ageLimitId } }, 'AND');
    addCondition(
      parsedQuery.collaboratorIds && {
        collaborators: {
          id: In(
            String(parsedQuery.collaboratorIds)
              .split(',')
              .map(id => id.trim()),
          ),
        },
      },
      'AND',
    );
    addCondition(
      parsedQuery.findByOwnerEmail && {
        owner: { email: ILike(`%${parsedQuery.findByOwnerEmail}%`) },
      },
      'AND',
    );
    addCondition(
      parsedQuery.findByOwnerName && {
        owner: { firstName: ILike(`%${parsedQuery.findByOwnerName}%`) },
      },
      'AND',
    );
    addCondition(
      parsedQuery.ticketTypeIds && {
        ticketTypes: {
          id: In(
            String(parsedQuery.ticketTypeIds)
              .split(',')
              .map(id => id.trim()),
          ),
        },
      },
      'AND',
    );
    addCondition(
      parsedQuery.ticketTypeNames && {
        ticketTypes: {
          name: In(
            String(parsedQuery.ticketTypeNames)
              .split(',')
              .map(id => id.trim()),
          ),
        },
      },
      'AND',
    );
    addCondition(
      parsedQuery.talentIds && {
        talents: {
          id: In(
            String(parsedQuery.talentIds)
              .split(',')
              .map(id => id.trim()),
          ),
        },
      },
      'AND',
    );

    const userFilter = {
      guests: {
        user: { id: payload.userId },
        status: In(
          Object.values(GuestStatus).map(item => {
            return item;
          }),
        ),
      },
    };

    const dateNow = new Date();
    let guestStatusFilter = [];
    let multipleGuestStatusFilter = String(
      parsedQuery.guestEventStatus ? parsedQuery.guestEventStatus : '',
    )
      .split(',')
      .map(status => status.trim())
      .filter(node => node);
    if (parsedQuery.guestEventStatus && multipleGuestStatusFilter?.length === 1) {
      switch (multipleGuestStatusFilter[0]) {
        case 'UPCOMING':
          addCondition({ status: EventStatusEnum.APPROVED_STATUS, endDate: MoreThan(dateNow) }); //to get only upcoming events whos end date is in future
          guestStatusFilter = [GuestStatus.CONFIRMED];
          break;
        case 'PAST':
          addCondition({ status: EventStatusEnum.PAST_STATUS, endDate: LessThan(dateNow) });
          guestStatusFilter = [GuestStatus.CONFIRMED];
          break;
        case 'INVITED':
          addCondition({ status: EventStatusEnum.APPROVED_STATUS }); //to get only upcoming events whos end date is in future
          guestStatusFilter = [GuestStatus.INVITED];
          break;
        case 'APPLIED':
          addCondition({ status: EventStatusEnum.APPROVED_STATUS, endDate: MoreThan(dateNow) });
          guestStatusFilter = [GuestStatus.APPLIED];
          break;
        case 'DECLINED':
          guestStatusFilter = [GuestStatus.DECLINED];
          break;
      }
      userFilter.guests.status = In(guestStatusFilter);
    } else if (multipleGuestStatusFilter.length > 1) {
      for (const status of multipleGuestStatusFilter) {
        let orCondition: any = {}; // Initialize OR condition object
        switch (status) {
          case 'UPCOMING':
            orCondition = {
              endDate: MoreThan(dateNow),
              status: EventStatusEnum.APPROVED_STATUS,
              guests: {
                status: GuestStatus.CONFIRMED,
                user: { id: payload.userId },
              },
            };
            break;
          case 'PAST':
            orCondition = {
              endDate: LessThan(dateNow),
              status: EventStatusEnum.PAST_STATUS,
              guests: {
                status: GuestStatus.CONFIRMED,
                user: { id: payload.userId },
              },
            };
            break;
          case 'INVITED':
            orCondition = {
              status: EventStatusEnum.APPROVED_STATUS,
              guests: {
                status: GuestStatus.INVITED,
                user: { id: payload.userId },
              },
            };
            break;
          case 'APPLIED':
            orCondition = {
              status: EventStatusEnum.APPROVED_STATUS,
              endDate: MoreThan(dateNow),
              guests: {
                status: GuestStatus.APPLIED,
                user: { id: payload.userId },
              },
            };
            break;
          case 'DECLINED':
            orCondition = {
              guests: {
                status: GuestStatus.DECLINED,
                user: { id: payload.userId },
              },
            };
            break;
        }
        // If `ownerId` exists, include it in each `OR` condition
        if (parsedQuery.ownerId) {
          orCondition.owner = { id: parsedQuery.ownerId };
        }
        // Add the condition to the `orConditions` array
        orConditions.push(orCondition);
      }
    }

    if (parsedQuery.feed) {
      if (parsedQuery.maxEndDate) {
        addCondition(
          {
            endDate: Between(dateNow, new Date(String(parsedQuery.maxEndDate))), // Ensures both conditions are applied
          },
          'AND',
        );
      } else {
        addCondition({ endDate: MoreThan(dateNow) }, 'AND'); // Only applies if maxEndDate is not present
      }
      addCondition(
        {
          status: EventStatusEnum.APPROVED_STATUS,
          isPublished: true,
        },
        'AND',
      );
    } else {
      addCondition(
        parsedQuery.statusName && {
          status: In(status),
        },
        'AND',
      );
    }

    const whereClause =
      andConditions.length > 0
        ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {})
        : {};

    const [userEvents, publicEvents] = await Promise.all([
      !parsedQuery.feed //if it is not for feed then only filter by userstatuses
        ? await this.dbConnection.getRepository(Event).find({
            where: {
              ...whereClause,
              ...userFilter, //to get the events based on provided status of guest
            },
            relations: {
              guests: { user: true },
            },
          })
        : Promise.resolve([]), //if it is for feed then filter by isprivate (get only public events)
      await this.dbConnection.getRepository(Event).find({
        where: {
          ...whereClause,
          isPrivate: false,
        },
        relations: {
          guests: { user: true },
        },
      }),
    ]);

    const filteredPublicEvents = parsedQuery.guestEventStatus
      ? publicEvents.filter(event =>
          event.guests.some(
            guest => guest.user.id === payload.userId && guest.status === guestStatusFilter[0],
          ),
        )
      : publicEvents;

    const eventsPrefiltered = [...userEvents];
    filteredPublicEvents.forEach(publicEvent => {
      if (!eventsPrefiltered.find(event => event.id === publicEvent.id)) {
        eventsPrefiltered.push(publicEvent);
      }
    });

    const eventsPrefilteredIds = eventsPrefiltered.map(item => item.id);
    const filter = { id: In(eventsPrefilteredIds) };

    if (parsedQuery.findByCollaboratorLikeNameOrEmail) {
      orConditions.push(
        {
          ...filter,
          collaborators: {
            name: ILike(`%${parsedQuery.findByCollaboratorLikeNameOrEmail}%`),
          },
        },
        {
          ...filter,
          collaborators: {
            email: ILike(`%${parsedQuery.findByCollaboratorLikeNameOrEmail}%`),
          },
        },
      );
    }

    if (parsedQuery.findByTalentsLikeNameOrEmail) {
      orConditions.push(
        {
          ...filter,
          talents: {
            name: ILike(`%${parsedQuery.findByTalentsLikeNameOrEmail}%`),
          },
        },
        {
          ...filter,
          talents: {
            email: ILike(`%${parsedQuery.findByTalentsLikeNameOrEmail}%`),
          },
        },
      );
    }

    if (parsedQuery.findInNameAndDescription) {
      orConditions.push(
        { ...filter, name: ILike(`%${parsedQuery.findInNameAndDescription}%`) },
        {
          ...filter,
          description: ILike(`%${parsedQuery.findInNameAndDescription}%`),
        },
      );
    }

    const order = parsedQuery.sortBy
      ? {
          [String(parsedQuery.sortBy)]: String(parsedQuery.order || 'ASC').toUpperCase(),
        }
      : undefined;

    const finalWhereClause = orConditions.length > 0 ? orConditions : filter;

    const [events, totalCount]: [Event[], number] = await this.dbConnection
      .getRepository(Event)
      .findAndCount({
        where: finalWhereClause,
        relations: {
          owner: true,
          location: true,
          eventType: true,
          ageLimit: true,
          admissionType: true,
          quizQuestions: true,
          collaborators: true,
          ticketTypes: true,
          talents: true,
          tickets: true,
          featuredEventSection: true,
        },
        order: order,
        ...pagination,
      });
    // Step 2: Get all event IDs from fetched events
    const eventIds = events.map(event => event.id);
    const userId = payload.userId;
    // Step 3: Fetch guests separately for only the needed events
    const guests = await this.dbConnection.getRepository(Guest).find({
      where: {
        event: In(eventIds),
        ...(userId ? { user: { id: userId } } : {}),
      },
      relations: ['user', 'event'],
    });
    // Step 4: Map guests to their respective events
    const eventGuestMap = new Map<string, Guest[]>();
    guests.forEach((guest: Guest) => {
      if (!eventGuestMap.has(guest.event.id)) {
        eventGuestMap.set(guest.event.id, []);
      }
      eventGuestMap.get(guest.event.id)?.push(guest);
    });
    // Step 5: Attach guests back to their events
    events.forEach(event => {
      event.guests = eventGuestMap.get(event.id) || [];
    });
    eventResponse.result = events.map(item => toEventGuest(item, item.guests[0], userId));
    eventResponse.totalCount = totalCount;
    return eventResponse;
  }

  public static async requestBecomeGuest(payload: RequestBecomeGuestRequestDto): Promise<string> {
    const event = await this.dbConnection.getRepository(Event).findOne({
      where: {
        id: payload.eventId,
        deletedAt: null,
        status: EventStatusEnum.APPROVED_STATUS,
      },
      relations: {
        owner: true,
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const user = (await serviceMesh.userService().getUser(payload.id)).data;

    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (event.owner.id === payload.id) {
      throw new ValidationError('The host cannot be invited in event');
    }
    const hostUserSettings = await this.dbConnection.getRepository(HostUserSettings).findOne({
      where: {
        user: { id: user?.id },
        host: { id: event.owner.id },
      },
    });

    const alreadyGuest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        user: { id: user?.id },
        event: { id: payload.eventId },
      },
    });

    if (alreadyGuest && ![GuestStatus.DRAFT, GuestStatus.DECLINED].includes(alreadyGuest.status)) {
      throw new BadRequestError('User is already a guest of this event');
    }
    const quiz = await this.dbConnection.getRepository(QuizQuestion).find({
      where: {
        event: { id: payload.eventId },
        required: true,
        enabled: true,
      },
    });

    await Promise.all(
      payload.answers.map(async item => {
        let actualAnswer = await this.dbConnection.getRepository(UserQuizAnswer).findOne({
          where: {
            user: { id: user?.id },
            event: { id: payload.eventId },
            question: { id: item.questionId },
            deletedAt: null,
          },
        });

        if (!actualAnswer) {
          actualAnswer = this.dbConnection.getRepository(UserQuizAnswer).create({
            user: { id: user?.id },
            event: { id: payload.eventId },
            question: { id: item.questionId },
            answer: item?.answer || '',
          });
        } else actualAnswer.answer = item?.answer || '';

        await this.dbConnection.getRepository(UserQuizAnswer).save(actualAnswer);
      }),
    );

    const usersQuizAnswer = await this.dbConnection.getRepository(UserQuizAnswer).find({
      where: {
        user: { id: user?.id },
        event: { id: payload.eventId },
      },
      relations: { question: true },
    });

    const countMandatoryAlready = usersQuizAnswer.filter(item => {
      if (item?.question?.required) return item;
    }).length;

    if (quiz) {
      if (countMandatoryAlready < quiz.length)
        throw new BadRequestError('The user has not answered all the required questions');
    }

    if (hostUserSettings && hostUserSettings.isSpam) {
      if (alreadyGuest) {
        alreadyGuest.status = GuestStatus.DECLINED;
        alreadyGuest.declinedBy = { id: event?.owner.id } as User;
        alreadyGuest.rejectedReason = 'User is marked as spam';
        alreadyGuest.checkIn = false;
        await this.dbConnection.getRepository(Guest).save(alreadyGuest);
      } else {
        const declinedGuest = new Guest();
        declinedGuest.event = event;
        declinedGuest.user = { id: user?.id };
        declinedGuest.declinedBy = { id: event?.owner.id } as User;
        declinedGuest.addedBy = { id: event?.owner.id } as User;
        declinedGuest.status = GuestStatus.DECLINED;
        declinedGuest.invitationSource = UserSource.REQUEST_IN_APP;
        declinedGuest.rejectedReason = 'User is marked as spam';
        declinedGuest.checkIn = false;
        await this.dbConnection.getRepository(Guest).save(declinedGuest);
      }
    } else {
      if (alreadyGuest) {
        alreadyGuest.status = GuestStatus.APPLIED;
        alreadyGuest.declinedBy = null;
        alreadyGuest.rejectedReason = null;
        alreadyGuest.additionalRequestedGuests = payload.additionalGuests;
        alreadyGuest.maxAdditionalGuests = payload.additionalGuests;
        await this.dbConnection.getRepository(Guest).save(alreadyGuest);
      } else {
        const guest = new Guest();
        guest.event = event;
        guest.user = { id: user?.id };
        guest.status = GuestStatus.APPLIED;
        guest.additionalRequestedGuests = payload.additionalGuests;
        guest.maxAdditionalGuests = payload.additionalGuests;
        guest.invitationSource = UserSource.REQUEST_IN_APP;
        await this.dbConnection.getRepository(Guest).save(guest);
      }
    }

    // Send Notification to Host
    try {
      serviceMesh
        .notificationService()
        .sendNotification(NotificationType.NEW_GUEST_REQUEST, event.owner.id, event.id, user.id);
    } catch (error) {
      console.log(':rocket: ~ guestService ~ requestBecomeGuest ~ error:', error);
    }
    return '';
  }

  public static async updateRequestBecomeGuest(
    payload: UpdateRequestBecomeGuestRequestDto,
  ): Promise<string> {
    const event = await this.dbConnection.getRepository(Event).findOne({
      where: {
        id: payload.eventId,
        deletedAt: null,
        status: EventStatusEnum.APPROVED_STATUS,
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const user = (await serviceMesh.userService().getUser(payload.id)).data;

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const alreadyGuest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        user: { id: user?.id },
        event: { id: payload.eventId },
      },
    });

    if (!alreadyGuest) throw new NotFoundError('Guest not found');

    if (alreadyGuest.status != GuestStatus.APPLIED)
      throw new BadRequestError('Guest has  incorrect status :' + alreadyGuest.status);

    alreadyGuest.additionalRequestedGuests = payload.additionalGuests;
    await this.dbConnection.getRepository(Guest).save(alreadyGuest);

    const quiz = await this.dbConnection.getRepository(QuizQuestion).find({
      where: {
        event: { id: payload.eventId },
        required: true,
        enabled: true,
      },
    });

    await Promise.all(
      payload.answers.map(async item => {
        let actualAnswer = await this.dbConnection.getRepository(UserQuizAnswer).findOne({
          where: {
            user: { id: user?.id },
            event: { id: payload.eventId },
            question: { id: item.questionId },
            deletedAt: null,
          },
        });

        if (!actualAnswer) {
          actualAnswer = this.dbConnection.getRepository(UserQuizAnswer).create({
            user: { id: user?.id },
            event: { id: payload.eventId },
            question: { id: item.questionId },
            answer: item?.answer || '',
          });
        } else actualAnswer.answer = item?.answer || '';

        await this.dbConnection.getRepository(UserQuizAnswer).save(actualAnswer);
      }),
    );

    const usersQuizAnswer = await this.dbConnection.getRepository(UserQuizAnswer).find({
      where: {
        user: { id: user?.id },
        event: { id: payload.eventId },
      },
      relations: { question: true },
    });

    const countMandatoryAlready = usersQuizAnswer.filter(item => {
      if (item?.question?.required) return item;
    }).length;

    if (quiz) {
      if (countMandatoryAlready < quiz.length)
        throw new BadRequestError('The user has not answered all the required questions');
    }

    return '';
  }

  public static async syncUserTopAttendee(): Promise<GenericResponse> {
    const LIMIT_FOR_USER_ATTENDEE = parseInt(process.env.LIMIT_FOR_USER_ATTENDEE || '50', 10);
    const users = await this.dbConnection
      .getRepository(Guest)
      .createQueryBuilder('guest')
      .innerJoinAndSelect('guest.user', 'user')
      .innerJoin('guest.event', 'event')
      .where('guest.status = :guestStatus', {
        guestStatus: GuestStatus.CONFIRMED,
      })
      .andWhere('event.status = :eventStatus', {
        eventStatus: EventStatusEnum.APPROVED_STATUS,
      })
      .groupBy('user.id')
      .orderBy('COUNT(event.id)', 'DESC')
      .select([
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.phone_number',
        'user.profile_picture',
        'COUNT(event.id) AS eventCount',
      ])
      .limit(LIMIT_FOR_USER_ATTENDEE)
      .getRawMany();

    const topAttendees = await Promise.all(
      users.map(async user => {
        const socialStats = await serviceMesh
          .userService()
          .syncSocialStats(config.get('API_BASE_URL'), user.user_id);
        return {
          id: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.user_email,
          phoneNumber: user.phone_number,
          profilePicture: user.profile_picture || '',
          socialStats,
          eventCount: user.eventcount,
        };
      }),
    );
    await this.dbConnection.getRepository(UserAttendeeStats).delete({});
    await this.dbConnection.getRepository(UserAttendeeStats).save(
      topAttendees.map(attendee => {
        const userAttendeeStats = new UserAttendeeStats();
        userAttendeeStats.user = User.create({ id: attendee.id });
        userAttendeeStats.totalEventsAttended = attendee.eventCount;
        userAttendeeStats.facebookFollowersCount = 0;
        userAttendeeStats.instagramFollowersCount = 0;
        userAttendeeStats.youtubeFollowersCount = 0;
        userAttendeeStats.tiktokFollowersCount = 0;
        userAttendeeStats.linkedinFollowersCount = 0;
        userAttendeeStats.xFollowersCount = 0;
        userAttendeeStats.snapchatFollowersCount = 0;
        attendee.socialStats.data.forEach(stat => {
          switch (stat.socialProviderType) {
            case ProviderType.FACEBOOK:
              userAttendeeStats.facebookFollowersCount = stat.followersCount;
              break;
            case ProviderType.INSTAGRAM:
              userAttendeeStats.instagramFollowersCount = stat.followersCount;
              break;
            case ProviderType.GOOGLE:
              userAttendeeStats.youtubeFollowersCount = stat.followersCount;
              break;
            case ProviderType.TIKTOK:
              userAttendeeStats.tiktokFollowersCount = stat.followersCount;
              break;
            case ProviderType.LINKEDIN:
              userAttendeeStats.linkedinFollowersCount = stat.followersCount;
              break;
            case ProviderType.X:
              userAttendeeStats.xFollowersCount = stat.followersCount;
              break;
            case ProviderType.SNAPCHAT:
              userAttendeeStats.snapchatFollowersCount = stat.followersCount;
              break;
            default:
              break;
          }
        });
        return userAttendeeStats;
      }),
    );
    return responses.ok;
  }

  public static async getTopUsersAttendees(): Promise<UserAttendee[]> {
    const users = await this.dbConnection
      .getRepository(UserAttendeeStats)
      .find({ relations: ['user'] });

    return users.map(user => {
      return {
        userId: user.user.id,
        name: `${user.user.firstName || ''} ${user.user.lastName || ''}`,
        profilePicture: user.user.profilePicture,
        totalEventsAttended: user.totalEventsAttended,
        facebookFollowerCount: user.facebookFollowersCount,
        instagramFollowerCount: user.instagramFollowersCount,
        youtubeFollowerCount: user.youtubeFollowersCount,
        tikTokFollowerCount: user.tiktokFollowersCount,
        linkedInFollowerCount: user.linkedinFollowersCount,
        xFollowerCount: user.xFollowersCount,
        snapchatFollowerCount: user.snapchatFollowersCount,
      };
    });
  }

  public static async cancelEventInvitation(
    payload: CancelEventInvitationRequestDto,
  ): Promise<string> {
    const guest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        event: { id: payload.eventId },
        user: { id: payload.userId },
      },
    });
    if (!guest) throw new NotFoundError('Guest not found');
    if (guest.status !== GuestStatus.APPLIED) throw new BadRequestError('Guest is not cancelled');
    await this.dbConnection.getRepository(Guest).delete(guest.id);
    return '';
  }

  public static async declineEventInvitation(
    payload: DeclineEventInvitationRequestDto,
  ): Promise<string> {
    const guest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        event: { id: payload.eventId },
        user: { id: payload.userId },
      },
    });
    if (!guest) throw new NotFoundError('Guest not found');
    if (guest.status === GuestStatus.DECLINED)
      throw new BadRequestError('Guest is already declined');
    guest.status = GuestStatus.DECLINED;
    guest.rejectedReason = payload.reason;
    guest.declinedBy = { id: payload.userId } as User;
    guest.checkIn = false;
    await this.dbConnection.getRepository(Guest).save(guest);
    return '';
  }

  /**
   * Accepts an event invitation for a guest by updating their status to CONFIRMED.
   *
   * @param {AcceptEventInvitationRequestDto} payload - The request data containing the event ID and user ID.
   * @returns {Promise<GenericResponse>} - A response indicating the success or failure of the operation.
   *
   * @throws {Error} Logs an error and returns a bad request response if an exception occurs.
   */
  public static async acceptEventInvitation(
    payload: AcceptEventInvitationRequestDto,
  ): Promise<string> {
    const guest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        event: { id: payload.eventId },
        user: { id: payload.userId },
      },
    });
    if (!guest) throw new NotFoundError('Guest not found');
    if (guest.status === GuestStatus.CONFIRMED)
      throw new BadRequestError('Guest is already confirmed');
    guest.status = GuestStatus.CONFIRMED;
    await this.dbConnection.getRepository(Guest).save(guest);
    return '';
  }

  /**
   * Added functionality to invite guest
   *
   * Logic:
   *    1. Verify if the event exists and is active.
   *    2. Confirm the presence of the lead guest (who must be CONFIRMED).
   *    3. Check if the lead guest has exceeded their allowed additional guest limit.
   *    4. Determine if the guest already exists (by email or phone number).
   *    5. If the guest exists, check if they were already in any guestStatus apart from DRAFT or NO_STATUS.
   *       - If already in guestStatus, check if they are restricted from being re-invited.
   *       - If restricted, update the guest's status to DECLINED and add them to restricted invites.
   *       - If guestStatus is DRAFT or NO_STATUS, update the guest's status to CONFIRMED.
   *    6. If the guest does not exist, create a non-member user.
   *    7. Add the guest to the event with an "CONFIRMED" status.
   *    8. Send an email or SMS invitation to the guest.
   *
   * @param payload - Contains guest details such as email, phone number, and event ID.
   * @returns GuestsDataResponse - Response containing the invited guest data or error message.
   */
  public static async inviteGuest(payload: InvitedGuestRequestDto): Promise<GuestDataSimple[]> {
    // Step 1: Check if the event exists
    const event = await this.dbConnection.getRepository(Event).findOne({
      where: { id: payload.eventId, deletedAt: IsNull() },
      relations: { location: true, owner: true },
    });
    if (!event) throw new NotFoundError('Event not found');

    if (
      payload.email?.trim().toLowerCase() === event.owner.email.trim().toLowerCase() ||
      payload.phoneNumber?.trim() === event.owner.phoneNumber?.trim()
    ) {
      throw new ValidationError('The host cannot be invited in event');
    }

    // Step 2: Verify the lead guest's presence and CONFIRMED status
    const leadGuest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        event: { id: event.id },
        user: { id: payload.userId },
        status: GuestStatus.CONFIRMED,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });
    if (!leadGuest) throw new NotFoundError('Lead Guest not found');

    // Step 3: Fetch all guests associated with the event
    const guestList: Guest[] = await this.dbConnection.getRepository(Guest).find({
      where: { event: { id: event.id }, deletedAt: IsNull() },
      relations: { user: true, addedBy: true },
    });

    // Step 4: Check if lead guest has reached the additional guest limit
    const invitedGuestList: Guest[] = guestList.filter(
      (g: Guest) => g.addedBy?.id === payload.userId,
    );
    if (leadGuest.maxAdditionalGuests === invitedGuestList.length) {
      throw new BadRequestError('Guest limit reached. Unable to invite additional guests');
    }

    // Step 5: Check if the guest exists by email or phone number
    let checkUser;
    if (payload.email) {
      try {
        checkUser = (await serviceMesh.userService().getUserWithRolesByEmail(payload.email)).data;
      } catch (e) {}
    } else if (payload.phoneNumber) {
      try {
        checkUser = (await serviceMesh.userService().getUserWithRolesByPhone(payload.phoneNumber))
          .data;
        checkUser = checkUser ? { ...checkUser, phoneNumber: payload.phoneNumber } : null;
      } catch (e) {}
    } else {
      throw new ValidationError('Phone number or email is required');
    }

    let status = GuestStatus.CONFIRMED;
    let guest = new Guest();

    if (checkUser) {
      // Step 6: Check if the user is already invited or confirmed for the event
      const isInvitedGuest = guestList.find(
        (guest: Guest) =>
          guest.user.id === checkUser.id && Object.values(GuestStatus).includes(guest.status),
      );
      if (isInvitedGuest) {
        if (
          isInvitedGuest.status !== GuestStatus.NO_STATUS &&
          isInvitedGuest.status !== GuestStatus.DRAFT
        ) {
          // Step 7: Check if the guest is restricted from being re-invited
          // const isGuestAlreadyRestricted = await this.RestrictedInvitesRepository.findOne({
          //   where: { event: { id: payload.eventId }, guest: { id: isInvitedGuest.id } },
          // });

          // if (isGuestAlreadyRestricted) {
          //   // Update restricted status to DECLINED and restrict from being invited again
          //   status = GuestStatus.DECLINED;
          // } else {
          // Restrict guest from being invited again
          status = GuestStatus.DECLINED;
          const restrictedGuest = new RestrictedInvites();
          restrictedGuest.event = { id: payload.eventId } as Event;
          restrictedGuest.guest = { id: isInvitedGuest.id } as Guest;
          restrictedGuest.restrictedBy = { id: payload.userId } as User;
          await this.dbConnection.getRepository(RestrictedInvites).create(restrictedGuest);
          await this.dbConnection.getRepository(RestrictedInvites).save(restrictedGuest);
          // }

          isInvitedGuest.status = status;
          return [isInvitedGuest].map(guest => toGuestDataSimple(guest, []));
        } else {
          if (
            isInvitedGuest.status === GuestStatus.NO_STATUS ||
            isInvitedGuest.status === GuestStatus.DRAFT
          ) {
            isInvitedGuest.status = GuestStatus.CONFIRMED;
            await this.dbConnection.getRepository(Guest).save(isInvitedGuest);
            return [isInvitedGuest].map(guest => toGuestDataSimple(guest, []));
          }
        }
      }
      const user: SimpleUser = {
        id: checkUser.id,
        firstName: checkUser.firstName,
        lastName: checkUser.lastName,
        email: checkUser.email,
        phoneNumber: checkUser.phoneNumber,
      };
      guest.event = { id: payload.eventId } as Event;
      guest.user = user;
      guest.status = status;
      guest.addedBy = { id: payload.userId } as User;
      await this.dbConnection.getRepository(Guest).create(guest);
      guest = await this.dbConnection.getRepository(Guest).save(guest);
    } else {
      // Step 8: Register non-member guest if they do not exist
      const transformedPayload = {
        eventId: event.id,
        userId: event.owner.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        source: UserSource.PLUS_1,
      };
      const member: SimpleUser = (
        await serviceMesh.userService().registerInvitesAsNonMember(transformedPayload)
      ).data;
      const user: User = {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phoneNumber: member.phoneNumber,
      } as User;

      // Step 9: Create a new guest entry with status INVITED
      guest.event = { id: payload.eventId } as Event;
      guest.user = user;
      guest.status = status;
      guest.addedBy = { id: payload.userId } as User;
      await this.dbConnection.getRepository(Guest).create(guest);
      guest = await this.dbConnection.getRepository(Guest).save(guest);
    }

    // Step 10: Send invitation via email or SMS
    // TO DO: Change email and sms template
    if (payload.email) {
      const createMailPayload = {
        eventDate: event.startDate,
        eventName: event.name,
        imageFlyer: event.imageFlyer,
        location: event.location.location,
        city: event.location.city,
        hostName: event.owner.firstName,
      };
      const addOnMailPayload = {
        email: payload.email,
        userId: guest.user.id,
        firstName: guest.user.firstName,
        eventId: event.id,
        leadGuestName: `${leadGuest.user.firstName} ${leadGuest.user.lastName}`,
      };
      sendEventInvitePlusOnes(createMailPayload, addOnMailPayload, event.timeZone);
    } else if (payload.phoneNumber) {
      const message = `Hi ${guest.user.firstName}, ${event.owner.additionalHostInformation.companyName} has invited you to ${event.name}! \n Download the Rumor app and log in with this phone number: ${guest.user.phoneNumber} to RSVP and confirm your spot. \n Need help? Contact us at support@therumor.com. \n ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
      try {
        const validateNumber = isValidPhoneNumber(payload.phoneNumber);
        if (validateNumber) {
          const cleanedNumber = payload.phoneNumber.replace(/[\s\-()]/g, '');
          await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
        }
      } catch (err) {
        console.log(`❌ Error while processing SMS for ${payload.phoneNumber}:`, err);
      }
    }

    return [guest].map(guest => toGuestDataSimple(guest, []));
  }

  /**
   * /**
   * Invites guests to an event by validating the lead guest, checking guest limits,
   * verifying user existence, and sending invitations via email or SMS.
   *
   * @param {InvitedGuestsRequestDto} payload - The request payload containing a list of guests to be invited.
   * @returns {Promise<GuestsDataResponse>} A response containing the invited guest details or an error message.
   *
   * ### Process:
   * 1. Fetch Event and Validate:** Ensure the event exists and is not deleted.
   * 2. Check Lead Guest Presence and Confirmation:** Confirm the inviter is a lead guest.
   * 3. Fetch Existing Guests:** Retrieve all guests for the event.
   * 4. Check Additional Guest Limit:** Ensure the lead guest has not exceeded their invite limit.
   * 5. Check if User Exists:** Find user by email or phone number.
   * 6. Handle Existing Guest Cases:**
   *    If already invited, update status accordingly.
   *    If not, create a new guest entry.
   * 7. Register Non-Member Guest:** If user does not exist, register them as a non-member.
   * 8. Send Invitation:**
   *    Send an email if an email is provided.
   *    Send an SMS if a phone number is provided.
   * 9. Execute Invitations Concurrently:** Process all invitations asynchronously.
   *
   * @param payload
   * @returns
   */
  public static async inviteGuests(payload: InvitedGuestsRequestDto): Promise<GuestDataSimple[]> {
    const guests = payload.guests;
    const invites = guests.map(async guestPayload => {
      // Step 1: Fetch event and validate
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: guestPayload.eventId, deletedAt: IsNull() },
        relations: { location: true, owner: true },
      });
      if (!event) throw new NotFoundError('Event');

      if (
        guestPayload.email?.trim().toLowerCase() === event.owner.email?.trim().toLowerCase() ||
        guestPayload.phoneNumber?.trim() === event.owner.phoneNumber?.trim()
      ) {
        throw new ValidationError('The host cannot be invited in event');
      }

      // Step 2: Check lead guest presence and confirmation
      const leadGuest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          event: { id: guestPayload.eventId },
          user: { id: guestPayload.userId },
          status: GuestStatus.CONFIRMED,
          deletedAt: IsNull(),
        },
        relations: {
          user: true,
          ticketType: true,
        },
      });
      if (!leadGuest) throw new NotFoundError('Lead Guest not found');

      // Step 3: Fetch all existing guests for the event
      const guestList = await this.dbConnection.getRepository(Guest).find({
        where: { event: { id: event.id }, deletedAt: IsNull() },
        relations: { user: true, addedBy: true },
      });

      // Step 4: Check additional guest limit
      const invitedGuestList = guestList.filter(g => g.addedBy?.id === guestPayload.userId);
      if (leadGuest.maxAdditionalGuests === invitedGuestList.length) {
        throw new BadRequestError('Guest limit reached. Unable to invite additional guests');
      }

      // Step 5: Check if user exists by email or phone
      let checkUser = null;
      if (guestPayload.email) {
        try {
          checkUser = (await serviceMesh.userService().getUserWithRolesByEmail(guestPayload.email))
            .data;
        } catch (e) {}
      } else if (guestPayload.phoneNumber) {
        try {
          checkUser = (
            await serviceMesh.userService().getUserWithRolesByPhone(guestPayload.phoneNumber)
          ).data;
          if (checkUser) checkUser = { ...checkUser, phoneNumber: guestPayload.phoneNumber };
        } catch (e) {}
      } else {
        throw new ValidationError('Phone number or email is required');
      }

      let guest: Guest;
      let status = GuestStatus.CONFIRMED;

      if (checkUser) {
        // Step 6: Check if user is already invited
        const existingGuest = guestList.find(g => g.user.id === checkUser.id);
        if (existingGuest) {
          if (
            existingGuest.status !== GuestStatus.NO_STATUS &&
            existingGuest.status !== GuestStatus.DRAFT
          ) {
            status = GuestStatus.DECLINED;
            const restrictedGuest = new RestrictedInvites();
            restrictedGuest.event = { id: guestPayload.eventId } as Event;
            restrictedGuest.guest = { id: existingGuest.id } as Guest;
            restrictedGuest.restrictedBy = { id: guestPayload.userId } as User;

            await this.dbConnection.getRepository(RestrictedInvites).save(restrictedGuest);
            existingGuest.status = status;
            return toGuestDataSimple(existingGuest, []);
          } else {
            existingGuest.status = GuestStatus.CONFIRMED;
            await this.dbConnection.getRepository(Guest).save(existingGuest);
            return toGuestDataSimple(existingGuest, []);
          }
        }

        guest = await this.dbConnection.getRepository(Guest).create({
          event: { id: guestPayload.eventId } as Event,
          user: checkUser,
          status,
          ticketType: { id: leadGuest?.ticketType?.id } as TicketType,
          addedBy: { id: guestPayload.userId } as User,
        });
      } else {
        // Step 7: Register non-member guest
        const transformedPayload = {
          eventId: event.id,
          userId: event.owner.id,
          firstName: guestPayload.firstName,
          lastName: guestPayload.lastName,
          email: guestPayload.email,
          phoneNumber: guestPayload.phoneNumber,
          source: UserSource.PLUS_1,
        };
        const newUser = (
          await serviceMesh.userService().registerInvitesAsNonMember(transformedPayload)
        ).data;
        guest = this.dbConnection.getRepository(Guest).create({
          event: { id: guestPayload.eventId } as Event,
          user: newUser,
          status,
          ticketType: { id: leadGuest?.ticketType?.id } as TicketType,
          addedBy: { id: guestPayload.userId } as User,
        });
      }

      guest = await this.dbConnection.getRepository(Guest).save(guest);

      if (guest) {
        if (guest.user.email) {
          const createMailPayload = {
            eventDate: event.startDate,
            eventName: event.name,
            imageFlyer: event.imageFlyer,
            location: event.location.location,
            city: event.location.city,
            hostName: event.owner.firstName,
          };
          const addOnMailPayload = {
            email: guest.user.email,
            userId: guest.user.id,
            firstName: guest.user.firstName,
            eventId: event.id,
            leadGuestName: `${leadGuest.user.firstName} ${leadGuest.user.lastName}`,
          };
          sendEventInvitePlusOnes(createMailPayload, addOnMailPayload, event.timeZone);
        } else if (guest.user.phoneNumber) {
          const message = `Hi ${guest.user.firstName}, ${event.owner.additionalHostInformation.companyName} has invited you to ${event.name}! \n Download the Rumor app and log in with this phone number: ${guest.user.phoneNumber} to RSVP and confirm your spot. \n Need help? Contact us at support@therumor.com. \n ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
          try {
            const validateNumber = isValidPhoneNumber(guest.user.phoneNumber);
            if (validateNumber) {
              const cleanedNumber = guest.user.phoneNumber.replace(/[\s\-()]/g, '');
              await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
            }
          } catch (err) {
            console.log(`❌ Error while processing SMS for ${guest.user.phoneNumber}:`, err);
          }
        }
        return toGuestDataSimple(guest, []);
      }
    });

    // Execute all guest invites concurrently
    const invitedGuestsResults = await Promise.all(invites);
    const eventId = guests[0].eventId;
    const userId = guests[0].userId;

    const leadGuest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
        status: GuestStatus.CONFIRMED,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        ticketType: true,
      },
    });
    const additionalGuests = await this.dbConnection.getRepository(Guest).find({
      relations: ['user', 'ticketType', 'declinedBy', 'user.address'],
      where: { addedBy: { id: leadGuest.user.id }, event: { id: eventId } },
    });

    leadGuest.maxAdditionalGuests = additionalGuests.length;
    await this.dbConnection.getRepository(Guest).save(leadGuest);
    const invitedGuests: GuestDataSimple[] = invitedGuestsResults.filter(
      Boolean,
    ) as GuestDataSimple[];
    return invitedGuests;
  }

  /**
   * Bulk upload guests for an event.
   *
   * Logic:
   *    1. Verify event existence and ensure the host is the event owner.
   *    2. Retrieve and parse the CSV file containing guest details.
   *    3. Extract valid guest data and filter out garbage/invalid entries.
   *    4. Check if the guests already exist as users in the system.
   *    5. Identify and remove guests already associated with the event.
   *    6. Register new non-member users for valid guests.
   *    7. Generate and upload an error CSV for invalid or duplicate entries.
   *    8. Record the CSV upload details in the database.
   *    9. Return success and failure counts along with error CSV details.
   *
   * @param payload - Contains event details, file path, and host ID.
   * @returns BulkUploadGuestsResponse - Response containing processed guest details.
   */
  public static async bulkUploadGuests(payload: BulkUploadGuestsRequestDto): Promise<BulkUserData> {
    // Step 1: Verify event existence and ownership

    const event = await this.dbConnection.getRepository(Event).findOne({
      where: { id: payload.eventId, deletedAt: IsNull() },
      relations: { owner: true },
    });

    // If the event does not exist, return a bad request response
    if (!event && !payload.isUploadUser) throw new NotFoundError('Event not found');

    // Ensure that the provided hostId is the owner of the event
    if (!payload.isUploadUser && (!event.owner || event.owner.id !== payload.hostId))
      throw new BadRequestError('Host is not the owner of the event');

    // Step 2: Fetch the CSV file from S3 storage
    const fileUrl = await S3Service.getFileUrl(payload.filePath);

    // Step 3: Parse the CSV file to extract guest data
    const { validData, garbageData } = await processCsvFile(fileUrl, payload.isUploadUser ?? false);

    // Extract email addresses from valid data
    const emails = validData.map(row => row.email).filter(email => email);
    let phoneNumbers = [];
    if (payload.isUploadUser)
      phoneNumbers = validData.map(row => row.phoneNumber).filter(phone => phone);

    // Step 4: Fetch existing users based on extracted emails and phone numbers
    let existingUsers: User[] = [];
    if (emails.length > 0 || phoneNumbers.length > 0) {
      existingUsers = await this.dbConnection.getRepository(User).find({
        where: [
          ...(emails.length ? [{ email: In(emails), deletedAt: IsNull() }] : []),
          ...(phoneNumbers.length ? [{ phoneNumber: In(phoneNumbers), deletedAt: IsNull() }] : []),
        ],
      });
    }
    // Create a map of email to user ID for quick lookup
    const userMap = new Map<string, string>();
    const removedEmails = new Set<string>();
    const newMappings = [];
    let updatedValidData: CsvRecord[] = [];
    if (existingUsers.length > 0) {
      existingUsers.forEach(user => {
        if (user.email) userMap.set(user.email, user.id);
        if (user.phoneNumber) userMap.set(user.phoneNumber, user.id);
      });

      // Step 5: Retrieve guests already associated with the event
      if (!payload.isUploadUser) {
        const existingGuestList: Guest[] = await this.dbConnection.getRepository(Guest).find({
          where: {
            event: { id: event.id },
            deletedAt: IsNull(),
            user: In(existingUsers.filter(user => user !== null).map(user => user.id)),
          },
          relations: { user: true, addedBy: true },
        });

        if (existingGuestList.length > 0) {
          existingGuestList.map(guest => {
            if (userMap.has(guest.user.email)) {
              const user: CsvRecord = {
                firstName: guest.user.firstName,
                lastName: guest.user.lastName,
                email: guest.user.email,
                phoneNumber: guest.user.phoneNumber,
                reason: `User already exists in the event with status ${guest.status}`,
              };
              garbageData.push(user);
              userMap.delete(guest.user.email);
              removedEmails.add(guest.user.email);
            }
          });
        }
      }

      const existingMappings = await this.dbConnection.getRepository(HostUserMapping).find({
        where: {
          host: { id: payload.hostId },
          user: In(existingUsers.map(user => user.id)),
        },
        relations: ['user'],
      });
      const mappingSet = new Set(existingMappings.map(mapping => mapping.user.id));
      // Step 6: Remove users from validData who were moved to garbageData
      updatedValidData = validData.filter(async row => {
        if (removedEmails.has(row.email)) {
          return false; // Remove from validData
        }
        let existingUserData;
        if (payload.isUploadUser) {
          existingUserData = existingUsers.find(
            user => user.email === row.email || user.phoneNumber === row.phoneNumber,
          );
        } else {
          existingUserData = existingUsers.find(user => user.email === row.email);
        }
        if (existingUserData && (userMap.has(row.email) || userMap.has(row.phoneNumber))) {
          if (mappingSet.has(existingUserData.id)) {
            const user = {
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email ? row.email : '',
              phoneNumber: row.phoneNumber ? row.phoneNumber : '',
              reason: 'User already exists in users list',
            };
            garbageData.push(user);
            if (row.email) userMap.delete(row.email);
            if (row.phoneNumber) userMap.delete(row.phoneNumber);
            return false; // Remove from validData
          }

          const userWithRoles = await this.dbConnection.getRepository(User).findOne({
            where: { id: existingUserData.id },
            relations: ['roles', 'roles.role'],
          });

          const hasMemberOrNonMember = userWithRoles?.roles?.some(userRole =>
            ['member', 'non_member'].includes(userRole.role.name),
          );

          if (!hasMemberOrNonMember) {
            this.assignRoleToUser(existingUserData);
          }

          newMappings.push({
            user: existingUserData,
            host: { id: payload.hostId },
          });
          if (row.email) userMap.delete(row.email);
          if (row.phoneNumber) userMap.delete(row.phoneNumber);
          return false;
        }
        return true; // Keep row in validData
      });
    }
    const users: SimpleUser[] = [];
    const dataToProcess =
      updatedValidData.length > 0 && existingUsers.length > 0
        ? updatedValidData
        : existingUsers.length === 0 && validData.length > 0
          ? validData
          : [];

    if (dataToProcess.length > 0) {
      const userPromises = dataToProcess.map(async (row: User) => {
        if (row.firstName && row.lastName && (row.phoneNumber || row.email)) {
          const response = await serviceMesh.userService().registerInvitesAsNonMember({
            ...row,
            eventId: payload.eventId,
            userId: payload.hostId,
            source: UserSource.INVITED_BY_HOST,
          });
          return response.data; // Ensure it returns a valid user
        }
        return null; // Return null for skipped rows
      });

      const resolvedUsers = await Promise.all(userPromises);
      users.push(...resolvedUsers.filter(user => user !== null)); // Remove null values
    }

    // Step 7: Generate an error CSV file for invalid or duplicate data
    const errorCsvContent = garbageData.length > 0 ? await generateErrorCsv(garbageData) : null;
    let errFileUrl: string | null = null;
    let errFilePath: string | null = null;
    const fileName = `${uuidv4()}.csv`;

    if (errorCsvContent) {
      errFilePath = `error_csv/${fileName}`;
      await S3Service.uploadFile({
        file: errorCsvContent,
        filename: fileName,
        size: errorCsvContent.length,
        type: 'text/csv',
        contentType: 'text/csv',
        fileKeyId: errFilePath,
      });
      errFileUrl = await S3Service.getFileUrl(errFilePath);
    }

    // Step 8: Record CSV upload details in the database
    let csvUploadRecord = await this.dbConnection.getRepository(CsvUploadRecords).create({
      event: payload.eventId ? { id: payload.eventId } : null, // Ensure null if not an event upload
      host: { id: payload.hostId }, // Reference the User entity correctly
      uploadType: payload.isUploadUser ? UploadType.USER_UPLOAD : UploadType.EVENT_UPLOAD,
      originalCsvPath: payload.filePath,
      errorCsvPath: errFilePath || null, // Ensure it's null if no error file
    });
    // Save the entity
    csvUploadRecord = await this.dbConnection.getRepository(CsvUploadRecords).save(csvUploadRecord);
    users.map(async user => {
      await this.dbConnection
        .getRepository(User)
        .update({ id: user.id }, { uploadedViaCsv: { id: csvUploadRecord.id } });
    });

    if (newMappings.length !== 0) {
      await this.dbConnection.getRepository(HostUserMapping).save(newMappings);
      newMappings.map(async mapping => {
        await this.dbConnection
          .getRepository(User)
          .update({ id: mapping.user.id }, { uploadedViaCsv: { id: csvUploadRecord.id } });
      });
    }

    // Step 9: Return the response with success and failure counts
    return {
      message: 'Bulk user creation completed.',
      SuccessUserCount: users.length + newMappings.length,
      failedUserCount: garbageData.length,
      hostId: payload.hostId,
      users,
      eventId: payload.eventId ? payload.eventId : '',
      errFileUrl: errFileUrl,
      errFilepath: errFilePath,
    };
  }

  private static async assignRoleToUser(payload: User) {
    const nonMemberRole: Role[] = await this.dbConnection
      .getRepository(Role)
      .find({ where: { name: 'non_member' } });

    const userRole = this.dbConnection.getRepository(UserRole).create({
      role: { id: nonMemberRole[0].id },
      source: UserSourceEnum.SIGN_UP_FORM,
      user: { id: payload.id },
    });

    await this.dbConnection.getRepository(UserRole).save(userRole);
  }

  /**
   * Fetches a paginated list of guests based on the provided filters.
   *
   * Functionality:
   * 1. Retrieves the most recently created users (up to `maxUsers`).
   * 2. Applies a name-based search filter (if provided) on these users.
   * 3. Paginates the filtered results based on the provided `take` and `skip` values.
   * 4. Returns the paginated list of users along with the total count.
   *
   * @param payload - The request payload containing pagination and filter options.
   * @returns A paginated response containing filtered users.
   */
  public static async fetchBulkGuests(
    payload: FetchBulkGuestsRequestDto,
  ): Promise<FetchBulkGuestsData> {
    const parsedQuery = parse(payload.query) as ParsedQs;
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : 10; // Number of users per page
    const page = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : 0; // Page number (starting from 0)
    const filePath = parsedQuery.filePath as string;
    const eventId = parsedQuery.eventId as string;

    if (!filePath && !eventId)
      throw new BadRequestError('filePath and eventId should be present to fetch bulk users');

    const csvData = await this.dbConnection.getRepository(CsvUploadRecords).findOne({
      where: { originalCsvPath: filePath, event: { id: eventId } },
    });
    // Step 1: Fetch the latest `maxUsers` users (ordered by creation date, excluding deleted users)
    const usersQuery = this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.csv_upload_id = :csvUploadId', { csvUploadId: csvData.id }) // Filter by csv_upload_id
      .andWhere('user.deletedAt IS NULL') // Exclude soft-deleted users
      .orderBy('user.createdAt', 'DESC') // Fetch the most recent users first
      .skip(page)
      .take(take); // Limit the number of users fetched

    if (parsedQuery.findByName) {
      const searchValue =
        typeof parsedQuery.findByName === 'string' ? parsedQuery.findByName.toLowerCase() : '';
      usersQuery.andWhere(
        new Brackets(qb => {
          qb.where('user.firstName ILIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          }).orWhere('user.lastName ILIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          });
        }),
      );
    }
    const [allUsers, totalCount] = await usersQuery.getManyAndCount();

    return {
      result: allUsers.map(user => toSimpleUser(user)),
      totalCount,
    };
  }

  /**
   * Invite a new guest user to an event by a host.
   *
   * Logic:
   *    1. Verify event existence.
   *    2. Verify host existence.
   *    3. Check if the provided ticket type is valid (if applicable).
   *    4. Validate the guest status.
   *    5. Ensure that invitations can only be sent for approved events.
   *    6. Check if the guest already exists in the system.
   *    7. Register a new non-member user if the guest does not exist.
   *    8. Add the guest to the event with the "invited" status.
   *    9. Send an invite email if required.
   *    10. Retrieve and return guest details.
   * @param payload - Data required to invite a new guest.
   * @returns GetUserRequestsResponse - The transformed guest data response.
   */
  public static async inviteNewUser(
    payload: InviteNewUserRequestDto,
    token: string,
  ): Promise<GuestDataSimple> {
    // Step 1: Check if the event exists and is not deleted
    const event = await this.dbConnection.getRepository(Event).findOne({
      where: { id: payload.eventId, deletedAt: IsNull() },
      relations: { location: true, owner: true },
    });
    if (!event) throw new NotFoundError('Event');

    // Step 2: Verify the existence of the host
    const host = (await serviceMesh.userService(token).getBasicHostProfile(payload.userId)).data;
    if (!host) throw new NotFoundError('Host not found');

    if (!payload.email && !payload.phoneNumber) {
      let guest = new Guest();
      try {
        // Extract relevant fields for non-member registration
        const memberPayload = (({ firstName, lastName, phoneNumber }) => ({
          firstName,
          lastName,
          email: '',
          phoneNumber: phoneNumber || '',
          eventId: event.id,
        }))(payload);

        if (event.status !== EventStatusEnum.APPROVED_STATUS) {
          throw new BadRequestError(
            'You cannot send invites until the event has been approved by the Rumor admin',
          );
        }

        const user = await serviceMesh.userService().createNonMemberUser(memberPayload);

        guest = this.dbConnection.getRepository(Guest).create({
          id: uuidv4(),
          status: GuestStatus.CONFIRMED,
          event,
          maxAdditionalGuests: payload.maxAdditionalGuests || 0,
          user: { id: user.data.userId } as User,
          addedBy: { id: host.id } as User,
          inviteMessage: payload.inviteMessage,
          privateGuestNote: payload.privateGuestNote,
          invitationSource: UserSource.INVITED_BY_HOST,
          ticketType: payload.ticketTypeId
            ? ({ id: payload.ticketTypeId } as TicketType)
            : undefined,
        });

        guest = await this.dbConnection.getRepository(Guest).save(guest);

        // Fetch and return guest data without sending notifications
        const queryBuilder = this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

        queryBuilder
          .leftJoinAndSelect('guest.user', 'user')
          .leftJoinAndSelect('user.roles', 'roles')
          .leftJoinAndSelect('user.address', 'address')
          .leftJoinAndSelect('roles.role', 'role')
          .leftJoinAndSelect('guest.addedBy', 'addedBy')
          .leftJoinAndSelect('guest.declinedBy', 'declinedBy')
          .leftJoinAndSelect('guest.ticketType', 'ticketType')
          .where({ event: { id: event.id } })
          .andWhere({
            status: In([
              GuestStatus.DRAFT,
              GuestStatus.INVITED,
              GuestStatus.CONFIRMED,
              GuestStatus.NO_STATUS,
            ]),
          })
          .andWhere({ user: { id: guest.user.id } })
          .limit(1);

        const checkGuest = await queryBuilder.getOne();
        const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
        const guestData = toGuestDataSimple(checkGuest, focuses);

        return guestData;
      } catch (err) {
        return null;
      }
    }

    if (payload.email && payload.email.trim().toLowerCase() === host.email.trim().toLowerCase()) {
      throw new ValidationError('You cannot add yourself to an event');
    }

    if (
      payload.phoneNumber &&
      payload.phoneNumber.replace(/[\s\-()]/g, '') === host.phoneNumber.replace(/[\s\-()]/g, '')
    ) {
      throw new ValidationError('You cannot add yourself to an event');
    }

    if (!payload.email && !payload.phoneNumber) {
      throw new ValidationError('Atleast phoneNumber or email should be there');
    }

    // Step 3: Validate the ticket type if provided
    let ticketType = undefined;
    if (payload.ticketTypeId) {
      ticketType = await this.dbConnection
        .getRepository(TicketType)
        .findOne({ where: { id: payload.ticketTypeId } });
      if (!ticketType) throw new NotFoundError('Ticket type');
    }

    // Step 4: Normalize and validate guest status
    const guestStatus = payload?.guestStatus
      ? payload.guestStatus.toString().trim().toUpperCase()
      : undefined;
    if (guestStatus && !Object.keys(GuestStatus).includes(guestStatus)) {
      throw new BadRequestError('Invalid guest status');
    }

    // Step 5: Ensure invites can only be sent for approved events
    if (
      (GuestStatus[guestStatus] === GuestStatus.CONFIRMED ||
        GuestStatus[guestStatus] === GuestStatus.INVITED) &&
      event.status !== EventStatusEnum.APPROVED_STATUS
    ) {
      throw new BadRequestError(
        'You cannot send invites until the event has been approved by the Rumor admin',
      );
    }

    let checkExistingUser;
    // Step 6: Check if the user already exists in the system
    try {
      if (payload.email && !payload.phoneNumber) {
        checkExistingUser = (await serviceMesh.userService().getUserWithRolesByEmail(payload.email))
          ?.data;
      } else if (payload.phoneNumber && !payload.email) {
        checkExistingUser = (
          await serviceMesh.userService().getUserWithRolesByPhone(payload.phoneNumber)
        )?.data;
      } else if (payload.email && payload.phoneNumber) {
        throw new BadRequestError('Please provide either email or phone number, not both');
      }
    } catch (e) {
      checkExistingUser = null;
    }
    if (checkExistingUser) {
      const checkGuest = await this.dbConnection.getRepository(Guest).findOne({
        where: { user: { id: checkExistingUser.id }, event: { id: event.id } },
      });
      if (checkGuest) {
        throw new BadRequestError('Guest already exists');
      }
    }
    // Step 7: Register a new guest user
    let guest = new Guest();
    let emailData;
    try {
      // Extract relevant fields for non-member registration
      const memberPayload = (({ eventId, userId, firstName, lastName, email, phoneNumber }) => ({
        eventId,
        userId,
        firstName,
        lastName,
        email: email || '',
        phoneNumber: phoneNumber || '',
        source: UserSource.INVITED_BY_HOST,
      }))(payload);
      const member: SimpleUser = (
        await serviceMesh.userService().registerInvitesAsNonMember(memberPayload)
      ).data;
      // Extract user data and email
      emailData = {
        eventId: event.id,
        email: member.email,
        firstName: member.firstName,
        id: member.id,
      };
      // Step 8: Create and save the guest record
      guest = this.dbConnection.getRepository(Guest).create({
        id: uuidv4(),
        status: guestStatus ? (guestStatus as GuestStatus) : GuestStatus.NO_STATUS,
        event,
        maxAdditionalGuests: payload.maxAdditionalGuests || 0,
        user: { id: member.id } as User,
        addedBy: { id: host.id } as User,
        inviteMessage: payload.inviteMessage,
        privateGuestNote: payload.privateGuestNote,
        invitationSource: UserSource.INVITED_BY_HOST,
        ticketType: ticketType ? ({ id: ticketType.id } as TicketType) : undefined,
      });
      guest = await this.dbConnection.getRepository(Guest).save(guest);
    } catch (err) {
      return null;
    }

    // Step 9: Send invite email or sms if required
    // TO DO: Change email and sms template
    if (GuestStatus[guestStatus] === GuestStatus.INVITED) {
      if (payload.email) {
        const createPayload = {
          eventDate: event.startDate,
          eventName: event.name,
          imageFlyer: event.imageFlyer,
          location: event.location.location,
          city: event.location.city,
          hostName: event.owner?.additionalHostInformation.companyName ?? 'Host',
          emailsData: emailData,
        };
        sendEventInviteNonMember(createPayload, event.timeZone);
      }
      if (payload.phoneNumber) {
        const message = `Hi ${emailData.firstName}, ${event.owner?.additionalHostInformation.companyName ?? 'Host'} has invited you to ${event.name ?? 'an Event'}! \n Download the Rumor app and log in with this phone number: ${payload.phoneNumber} to RSVP and confirm your spot. \n Need help? Contact us at support@therumor.com. \n ${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
        try {
          const validateNumber = isValidPhoneNumber(payload.phoneNumber);
          if (validateNumber) {
            const cleanedNumber = payload.phoneNumber.replace(/[\s\-()]/g, '').trim();
            await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
          }
        } catch (err) {
          console.log(`❌ Error while processing SMS for ${payload.phoneNumber}:`, err);
        }
      }
    }
    if (GuestStatus[guestStatus] === GuestStatus.CONFIRMED) {
      if (payload.email) {
        const createPayload = {
          eventDate: event.startDate,
          eventName: event.name,
          imageFlyer: event.imageFlyer,
          location: event.location.location,
          city: event.location.city,
          hostName: event.owner?.additionalHostInformation.companyName ?? 'Host',
          emailsData: emailData,
        };
        sendEventInviteToConfirmedGuest(createPayload, event.timeZone);
      }
      if (payload.phoneNumber) {
        let link = `${config.get('RUMOR_WEBSITE_HOST') + 'redirect'}`;
        const message = ` Hi ${emailData?.firstName ? emailData.firstName : 'Guest'},\n\n${event.owner?.additionalHostInformation.companyName ?? 'Host'} has added you to the guest list for ${event.name}.\n\nDownload the Rumor app and log in with this phone number: ${payload.phoneNumber} to view your confirmation.\n\nNeed help? Contact us at support@therumor.com.\n\n${link}`;
        try {
          const validateNumber = isValidPhoneNumber(payload.phoneNumber);
          if (validateNumber) {
            const cleanedNumber = payload.phoneNumber.replace(/[\s\-()]/g, '').trim();
            await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
          }
        } catch (err) {
          console.log(`❌ Error while processing SMS for ${payload.phoneNumber}:`, err);
        }
      }
    }
    // Step 10: Fetch user and transform guest data
    const queryBuilder = this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

    queryBuilder
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .leftJoinAndSelect('guest.declinedBy', 'declinedBy')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .where({ event: { id: event.id } })
      .andWhere({
        status: In([GuestStatus.DRAFT, GuestStatus.INVITED, GuestStatus.CONFIRMED]),
      })
      .andWhere({ user: { id: guest.user.id } })
      .limit(1);

    const checkGuest = await queryBuilder.getOne();
    const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
    const guestData = toGuestDataSimple(checkGuest, focuses);

    try {
      //Send Notification
      serviceMesh
        .notificationService()
        .sendNotification(
          NotificationType.EVENT_INVITATION_NON_MEMBER,
          guest.user.id,
          payload.userId,
          payload.eventId,
        );
    } catch (error) {
      console.log('🚀 ~ GuestService ~ error:', error);
    }

    return guestData;
  }

  public static async listUserRequests(payload: GuestsQueryRequestDto): Promise<Guests> {
    const parsedQuery = parse(payload.query);
    const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
    const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
    const socialNetworkNames = parsedQuery?.socialNetworkNames
      ? parsedQuery.socialNetworkNames
      : undefined;
    const followerCountFrom = parsedQuery?.followerCountFrom
      ? parseInt(parsedQuery.followerCountFrom as string)
      : undefined;
    const followerCountTo = parsedQuery?.followerCountTo
      ? parseInt(parsedQuery.followerCountTo as string)
      : undefined;
    const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
    const { error: validationError, response: validation } = validateFilters(payload.query);
    if (validationError) throw new ValidationError(validation);

    let socialNetworkObject: {
      [key in keyof typeof SocialProviderType]?: string;
    } = {};
    if (typeof socialNetworkNames === 'string') {
      const socialNetworkArray = socialNetworkNames
        .split(',')
        .map(name => name.trim().toUpperCase());
      socialNetworkObject = socialNetworkArray.reduce(
        (acc, name) => {
          acc[name] = SocialProviderType[name as keyof typeof SocialProviderType];
          return acc;
        },
        {} as { [key in keyof typeof SocialProviderType]?: string },
      );
    }

    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: payload.eventId } });
    if (!event) throw new BadRequestError('Event not found');

    const queryBuilder = await this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

    queryBuilder
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .leftJoinAndSelect('user.socialProviders', 'socialProvider')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .leftJoinAndSelect('guest.declinedBy', 'declinedBy')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .where({ event: { id: event.id } })
      .andWhere({ status: GuestStatus.APPLIED })
      .offset(skip)
      .limit(take);

    if (searchValue) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('user.firstName ILIKE :searchValue', {
            searchValue: `%${searchValue}%`,
          })
            .orWhere('user.lastName ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('user.email ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('user.username ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('user.phoneNumber ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('address.city ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('address.address ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            })
            .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', {
              searchValue: `%${searchValue}%`,
            });
        }),
      );
    }

    if (Object.keys(socialNetworkObject).length > 0) {
      const socialConditions = Object.keys(socialNetworkObject).map(networkKey => {
        const columnName = `${networkKey.toLowerCase()}FollowersCount`;
        return `(socialStats.${columnName} BETWEEN :followerCountFrom AND :followerCountTo)`;
      });

      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where(socialConditions.join(' OR '), {
            followerCountFrom: followerCountFrom || 0,
            followerCountTo: followerCountTo || Number.MAX_SAFE_INTEGER,
          });
        }),
      );
    }

    const [guests, totalCount] = await queryBuilder.getManyAndCount();
    const buildGuests = await Promise.all(
      guests.map(async guest => {
        const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
        const vouches = await VouchRequestService.getUserVouches({
          id: guest.user.id,
        });
        const answers = await this.dbConnection.getRepository(UserQuizAnswer).find({
          where: {
            user: { id: guest.user.id },
            event: { id: payload.eventId },
          },
          relations: {
            question: true,
          },
        });
        const guestData = toGuest(guest, focuses, socialNetworkObject, vouches, answers, undefined);
        return { ...guestData, category: focuses.map(focus => focus.name) };
      }),
    );
    return { result: buildGuests, totalCount };
  }

  public static async getUserRequests(
    payload: RequestByUserAndEventDto,
  ): Promise<GetUserRequestsResponse> {
    // Find guest by userId and eventId
    const guestExists = await this.dbConnection.getRepository(Guest).findOne({
      where: { user: { id: payload.userId }, event: { id: payload.eventId } },
      relations: { event: true, user: true },
    });
    const guestUserId = payload.userId;
    if (!guestExists) throw new NotFoundError('Guest not found');

    // Ensure event exists and is not deleted
    const event = await await this.dbConnection.getRepository(Event).findOne({
      where: { id: payload.eventId, deletedAt: null },
    });
    if (!event) throw new BadRequestError('Event not found');

    const queryBuilder = await this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

    queryBuilder
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.socialStats', 'socialStats')
      .leftJoinAndSelect('user.socialProviders', 'socialProvider')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('roles.role', 'role')
      .leftJoinAndSelect('guest.addedBy', 'addedBy')
      .leftJoinAndSelect('guest.declinedBy', 'declinedBy')
      .leftJoinAndSelect('guest.ticketType', 'ticketType')
      .where({ event: { id: event.id } })
      .andWhere({ status: GuestStatus.APPLIED })
      .andWhere({ user: { id: guestUserId } })
      .limit(1);

    const guest = await queryBuilder.getOne();

    const focuses = (await serviceMesh.userService().getUserFocuses(guest.user.id)).data;
    const vouches = await VouchRequestService.getUserVouchesByEvent({
      requesterId: guest.user.id,
      eventId: event.id,
    });
    const answers = await this.dbConnection.getRepository(UserQuizAnswer).find({
      where: {
        user: { id: guest.user.id },
        event: { id: event.id },
      },
      relations: {
        question: true,
      },
    });
    const guestData = toGuest(guest, focuses, undefined, vouches, answers, undefined);
    const data = { ...guestData, category: focuses.map(focus => focus.name) };

    return responses.data(data);
  }

  public static async manageBulkGuests(
    payload: ManageBulkGuestsRequestDto,
  ): Promise<GenericResponse> {
    const validateManageBulkGuests = this.validateManageBulkGuests(payload);
    if (!validateManageBulkGuests.validate)
      throw new ValidationError(validateManageBulkGuests.message);
    let ticketType;
    if (guestStatusToEntity[payload.status] === GuestStatus.CONFIRMED) {
      ticketType = await this.dbConnection.getRepository(TicketType).findOne({
        where: { id: payload.ticketTypeId },
      });
      delete payload.reason;
      if (!ticketType) {
        throw new BadRequestError('Invalid ticket type id');
      }
    }
    const guestIds = payload.guestIds.map(guest => guest.guestId);

    const guests = await this.dbConnection.getRepository(Guest).find({
      where: {
        id: In(guestIds),
        deletedAt: IsNull(),
      },
    });

    const results = await Promise.all(
      payload.guestIds.map(async guestInfo => {
        const guest = guests.find(g => g.id === guestInfo.guestId);
        if (!guest) {
          return false;
        }

        guest.privateGuestNote = guestInfo.privateNotes || guest.privateGuestNote;
        guest.ticketType = ticketType || guest.ticketType;
        guest.status = guestStatusToEntity[payload.status];
        guest.maxAdditionalGuests = payload.maxAdditionalGuests ?? guest.maxAdditionalGuests;
        guest.rejectedReason = payload.reason;
        guest.inviteMessage = payload.inviteMessage;

        await this.dbConnection.getRepository(Guest).save(guest);

        if (payload.isSpam && guest.user) {
          await serviceMesh.userService().markUserAsSpam(guest.user.id);
        }

        return true;
      }),
    );

    const successCount = results.filter(result => result).length;
    if (successCount === 0) {
      throw new BadRequestError('No guests were successfully updated');
    }
    return responses.ok;
  }

  public static async getGuestDetails(payload: UserAndIdRequestDto): Promise<GuestDetails> {
    if (!payload.id) throw new BadRequestError('Invalid guest ID provided');
    const guestProfileResponse = await this.getGuestProfile(payload);
    const guestDetail = await this.dbConnection.getRepository(Guest).findOne({
      where: { id: payload.id },
      relations: {
        ticketType: true,
        user: true,
        event: true,
        signupFormSubmissions: { signupForm: true },
      },
    });
    const event = await this.dbConnection.getRepository(Event).findOne({
      where: { id: guestDetail.event.id },
      relations: { owner: true },
    });

    if (!guestDetail) {
      throw new NotFoundError('Guest not found');
    }

    const {
      id: guestId,
      user,
      ticketType,
      maxAdditionalGuests = 0,
      privateGuestNote = '',
      status,
    } = guestDetail;

    const guestStatus = status ? guestStatusToEntity[status] : GuestStatus.NO_STATUS;

    const vouches = await VouchRequestService.getUserVouchesByEvent({
      requesterId: guestDetail.user.id,
      eventId: guestDetail.event.id,
    });

    let questions: QuizData[] = [];
    if (guestDetail.invitationSource === UserSource.SIGN_UP_FORM) {
      guestDetail.signupFormSubmissions.answers.forEach(a => {
        const ans: QuizData = { question: a.name, answer: a.answers };
        questions.push(ans);
      });
    } else {
      let quizAnswer = await this.dbConnection.getRepository(UserQuizAnswer).find({
        where: {
          user: { id: guestDetail.user.id },
          event: { id: guestDetail.event.id },
        },
        relations: {
          question: true,
        },
      });
      questions = quizAnswer && quizAnswer.length ? quizAnswer.map(toQuizData) : [];
    }

    const additionalGuests = await this.dbConnection.getRepository(Guest).find({
      relations: ['user', 'ticketType', 'declinedBy', 'user.address'],
      where: { addedBy: { id: guestDetail.user.id }, event: { id: guestDetail.event.id } },
    });

    const additionalGuestData = await Promise.all(
      additionalGuests.map(async additionalGuest => {
        const user = await this.dbConnection.getRepository(User).findOne({
          where: { id: additionalGuest.user.id },
        });
        const [plusOnesFocuses, plusOnesInterests] = await Promise.all([
          (await serviceMesh.userService().getUserFocuses(user.id)).data,
          (await serviceMesh.userService().getUserInterests(user.id)).data,
        ]);
        const hostUserSettings = await this.dbConnection.getRepository(HostUserSettings).findOne({
          where: {
            user: { id: user.id },
            host: { id: event.owner.id },
          },
        });
        const isBanned = hostUserSettings ? hostUserSettings.isSpam : false;
        const guestData = toAdditionalGuestData(
          additionalGuest,
          plusOnesFocuses,
          plusOnesInterests,
        );
        return { ...guestData, isBanned };
      }),
    );

    return {
      guestDetail: {
        guestId,
        userId: user?.id || null,
        ticketType: ticketType?.name || null,
        ticketTypeId: ticketType?.id || null,
        eventId: guestDetail?.event.id || null,
        inviteMessage: guestDetail.inviteMessage,
        maxAdditionalGuests,
        privateGuestNote,
        guestStatus,
        signupFormName: guestDetail.signupFormSubmissions?.signupForm?.name,
      },

      additionalGuests: additionalGuestData,

      guestProfile: guestProfileResponse,

      quizDataList: { questions },
      vouches: vouches && vouches.length ? vouches.map(toVouchesData) : [],
    };
  }

  public static async listInvitedGuests(
    payload: ListUsersEventInviteesRequestDto,
  ): Promise<GuestDataSimple[]> {
    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: payload.eventId, deletedAt: IsNull() } });
    if (!event) throw new NotFoundError('Event not found');
    const leadGuest = await this.dbConnection.getRepository(Guest).findOne({
      where: {
        event: { id: event.id },
        user: { id: payload.userId },
        deletedAt: IsNull(),
      },
    });
    if (!leadGuest) throw new NotFoundError('Lead Guest not found');
    leadGuest.user = { id: payload.userId } as User;

    const invitedGuestList: Guest[] = await this.dbConnection.getRepository(Guest).find({
      where: {
        event: { id: event.id },
        addedBy: { id: payload.userId },
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    const restrictedGuests: RestrictedInvites[] = await this.dbConnection
      .getRepository(RestrictedInvites)
      .find({
        where: {
          event: { id: event.id },
          restrictedBy: { id: payload.userId },
        },
        relations: ['guest', 'guest.user'],
      });

    // Merge both lists
    const allGuests: GuestDataSimple[] = [
      ...invitedGuestList.map(guest => toGuestDataSimple(guest, [], false)),
      ...restrictedGuests.map(restricted =>
        toGuestDataSimple(restricted.guest, [], true, restricted.id),
      ),
    ];

    return [leadGuest].map(guest => toGuestDataSimple(guest, [], false, undefined, allGuests));
  }

  public static validateManageBulkGuests(payload: ManageBulkGuestsRequestDto): {
    validate: boolean;
    message: string | null;
  } {
    const errorMessage = this.validatePayload(payload);
    return {
      validate: !errorMessage,
      message: errorMessage,
    };
  }

  public static validatePayload(payload: ManageBulkGuestsRequestDto): string | null {
    if (!payload.status) return 'GuestStatus is required';
    if (!Array.isArray(payload.guestIds) || payload.guestIds.length === 0) {
      return 'No guest IDs provided';
    }
    const status = guestStatusToEntity[payload.status];
    const defaultValidation = () => null;
    const validations: Record<GuestStatus, () => string | null> = {
      [GuestStatus.REFUSED]: () => {
        if (!payload.reason || payload.reason.trim() === '') {
          return 'Reason is required when status is REFUSED.';
        }
        return null;
      },
      [GuestStatus.CONFIRMED]: () => {
        if (!payload.ticketTypeId) {
          return 'TicketTypeId is required when status is CONFIRMED.';
        }
        if (
          !payload.maxAdditionalGuests ||
          payload.maxAdditionalGuests < 0 ||
          typeof payload.maxAdditionalGuests !== 'number'
        ) {
          return 'MaxAdditionalGuests must be a non-negative number when status is CONFIRMED.';
        }
        return null;
      },
      [GuestStatus.NO_STATUS]: defaultValidation,
      [GuestStatus.DRAFT]: defaultValidation,
      [GuestStatus.INVITED]: defaultValidation,
      [GuestStatus.DECLINED]: defaultValidation,
      [GuestStatus.APPLIED]: defaultValidation,
      [GuestStatus.REVIEW]: defaultValidation,
    };
    return validations[status]?.() ?? null;
  }

  /**
   * Fetch guests for a given event and filter by status.
   * @param eventId - The event ID.
   * @param statuses - List of guest statuses to filter.
   * @returns List of guests with required event details.
   */
  public static async fetchGuestsByStatuses(
    eventId: string,
    statuses: GuestStatus[],
  ): Promise<Guest[]> {
    return await this.dbConnection
      .getRepository(Guest)
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('guest.event', 'event')
      .select([
        'guest.id',
        'user.email',
        'user.id',
        'user.phoneNumber',
        'user.firstName',
        'event.name',
        'event.startDate',
        'event.endDate',
        'event.location',
      ])
      .where({ event: { id: eventId } })
      .andWhere('guest.status IN (:...statuses)', { statuses })
      .getMany();
  }

  /* Deletes a guest or a restricted invite based on the provided ID.
   *
   * This function first checks if the ID exists in the `RestrictedInvites` table.
   * If found, it deletes the entry from that table.
   * If not found, it then checks the `Guest` table and deletes the entry if present.
   * If the ID is not found in either table, it returns an error response.
   *
   * @param {string} id - The ID of the guest or restricted invite to be deleted.
   * @returns {Promise<BaseResponse>} - Response indicating success or failure of the deletion process.
   */
  public static async deleteInvitedGuest(payload: IdRequestDto): Promise<GenericResponse> {
    const restrictedInvite = await this.dbConnection
      .getRepository(RestrictedInvites)
      .findOne({ where: { id: payload.id } });
    if (restrictedInvite) {
      await this.dbConnection.getRepository(RestrictedInvites).delete(payload.id);
      return responses.ok;
    }

    const guest = await this.dbConnection
      .getRepository(Guest)
      .findOne({ where: { id: payload.id } });
    if (guest) {
      await this.dbConnection
        .getRepository(RestrictedInvites)
        .delete({ guest: { id: payload.id } });
      await this.dbConnection.getRepository(Guest).delete(payload.id);
      return responses.ok;
    }

    throw new BadRequestError('Guest or restricted entry not found');
  }

  public static async getEventAttendeeCountByTicketType(
    payload: GetAttendeeCountRequest,
  ): Promise<Attendees> {
    const eventId = payload.eventId;
    const event = await this.dbConnection
      .getRepository(Event)
      .findOne({ where: { id: payload.eventId, deletedAt: IsNull() } });
    if (!event) throw new NotFoundError('Event not found');
    const ticketType = await this.dbConnection.getRepository(TicketType).findOne({
      where: {
        id: payload.ticketTypeId,
        event: { id: eventId },
        deletedAt: IsNull(),
      },
    });
    if (!ticketType) throw new NotFoundError('Ticket Type not found');
    const ticketTypeId = payload.ticketTypeId;
    const count = await this.dbConnection.getRepository(Guest).count({
      where: {
        event: { id: eventId },
        ticketType: { id: ticketTypeId },
        deletedAt: IsNull(),
      },
    });
    return { attendeeCount: count };
  }

  public static async hasGuestsAssignedToTicketTypes(
    ticketTypeIds: string[],
    eventId: string,
    queryRunner: QueryRunner,
  ): Promise<boolean> {
    const count = await queryRunner.manager.getRepository(Guest).count({
      where: {
        event: { id: eventId },
        ticketType: { id: In(ticketTypeIds) },
        deletedAt: IsNull(),
      },
    });
    return count > 0;
  }

  public static async exportCsv(payload: GuestsQueryRequestDto): Promise<string> {
    // Get the guest data
    const data = await this.getGuests(payload);

    // Define the titles and keys for the CSV
    const titleMapping = [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phoneNumber', title: 'Phone Number' },
      { id: 'ticketType', title: 'Ticket Type' },
      { id: 'partySize', title: 'Party Size' },
      { id: 'category', title: 'Category' },
      { id: 'numFollowers', title: 'Followers' },
      { id: 'baseCity', title: 'Base City' },
      { id: 'addedBy', title: 'Added By' },
      { id: 'status', title: 'Guest Status' },
      { id: 'gender', title: 'Gender' },
      { id: 'age', title: 'Age' },
      { id: 'interest', title: 'Interests' },
      { id: 'source', title: 'Request Source' },
      { id: 'vouched', title: 'Vouched' },
      { id: 'checkIn', title: 'Check-In' },
      { id: 'declinedBy', title: 'Declined By' },
      { id: 'isBanned', title: 'Spam' },
    ];

    // Map the data to the line items that match the title structure
    const lineItems = data.result.map(column => {
      const mappedColumn = {};
      titleMapping.forEach(field => {
        if (field.id === 'isBanned') {
          mappedColumn[field.title] = column[field.id] ? 'Yes' : 'No';
        } else if (field.id === 'checkIn') {
          mappedColumn[field.title] = column[field.id] ? 'Checked In' : 'Not Checked In';
        } else {
          if (column[field.id] == 0 || column[field.id] === 'NOT_APPLICABLE' || !column[field.id]) {
            mappedColumn[field.title] = '—';
          } else {
            mappedColumn[field.title] = column[field.id];
          }
        }
      });
      return mappedColumn;
    });

    // Return the CSV as a string
    return new Promise<string>((resolve, reject) => {
      stringify(
        lineItems,
        { header: true, columns: titleMapping.map(item => item.title) },
        (err, output) => {
          if (err) {
            reject(err);
          }
          resolve(output);
        },
      );
    });
  }
}
