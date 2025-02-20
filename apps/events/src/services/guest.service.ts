import {
  GenericResponse,
  GetGuestProfileResponse,
  GetUserRequestsResponse,
  GuestDetailsResponse,
  GuestsDataResponse,
  GuestsResponse,
  ListEventGuestsResponse,
  ListUsersEventInviteesResponse,
  UsersAttendeesResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';

import { responses } from '../common/responses';
import { Brackets, ILike, In, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';
import { Event, Guest, QuizQuestion, TicketType, User, UserAttendeeStats } from 'rumor-utils/shared/events/entities';
import { EventLocationInterface, EventStatusEnum, GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';

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
} from 'rumor-utils/shared/events/dtos/guest.dto';
import { guestStatusToEntity, toGuest, toGuestData, toGuestDataSimple, toQuizData, toVouchesData } from 'rumor-utils/shared/events/mappers/guest.mapper';
import { parse, ParsedQs } from 'qs';
import { hasPagination } from 'rumor-utils/shared/users/dtos/shared.dto';
import { RequestByIdDto } from 'rumor-utils/shared/events/dtos';
import { Member, SimpleUser } from 'rumor-utils/shared/users/grpc/auth/auth.pb';
import { toEventGuest } from 'rumor-utils/shared/events/mappers/events.mapper';
import { haversineDistance } from 'rumor-utils/utils/utils';
import { isValidGuestStatus, isValidUserGender, validateFilters } from '../utils/event.utils';
import { ProviderType } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { UserQuizAnswer } from 'rumor-utils/shared/events/entities/user-quiz-question-answer.entity';
import { SocialProviderType } from 'rumor-utils/shared/users/interfaces/shared.interface';
import { GuestDataSimple, UserSource } from 'rumor-utils/shared/events/grpc/events/general.pb';
import database from '../database';
import config from '../config';
import * as serviceMesh from 'rumor-utils/service-mesh';

export class GuestService {
  public static dbConnection = database;
  public static filterLocationsByDistance(currentLat: number, currentLng: number, locations: EventLocationInterface[]): EventLocationInterface[] {
    const maxDistance = 50; //50 miles

    return locations.filter((location) => {
      const distance = haversineDistance(currentLat, currentLng, location.lat, location.long);
      return distance <= maxDistance;
    });
  }

  public static async addGuests(payload: AddGuestsRequestDto): Promise<GuestsResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
      if (!event) return responses.badRequest('Event not found');

      const host = await serviceMesh.getBasicHostProfile(config.get('API_BASE_URL'),payload.hostId);
      if (!host) return responses.badRequest('Host not found');

      let ticketType = undefined;
      if (payload.ticketTypeId) {
        ticketType = await this.dbConnection.getRepository(TicketType).findOne({ where: { id: payload.ticketTypeId } });

        if (!ticketType) return responses.badRequest('Ticket type not found');
      }

      const guestStatus = payload?.guestStatus ? payload.guestStatus.toString().trim().toUpperCase() : undefined;

      if (guestStatus && !Object.keys(GuestStatus).includes(guestStatus)) {
        return responses.badRequest('Invalid guest status');
      }

      if (GuestStatus[guestStatus] === GuestStatus.CONFIRMED && event.status !== EventStatusEnum.APPROVED_STATUS) {
        return responses.badRequest('Confirmed users can only be added to Approved events.');
      }

      let guests = await Promise.all(
        payload.users.map(async (userId) => {
          try {
            const user = await serviceMesh.getCurrentUser(config.get('API_BASE_URL'),userId);
            if (!user) return null;

            const alreadyUser = await this.dbConnection.getRepository(Guest).findOne({
              where: {
                event: { id: event.id },
                user: { id: userId },
              },
              relations: ['user', 'addedBy', 'declinedBy'],
            });

            if (!alreadyUser) {
              const guest = new Guest();
              guest.status = guestStatus ? (guestStatus as GuestStatus) : GuestStatus.NO_STATUS;
              guest.event = event;
              guest.maxAdditionalGuests = payload.maxAdditionalGuests || 1;
              guest.user = { id: userId } as User;
              guest.addedBy = { id: host.id } as User;
              guest.privateGuestNote = payload.privateGuestNote;
              guest.invitationSource = UserSource.INVITED_BY_HOST;

              if (ticketType) {
                guest.ticketType = { id: ticketType.id } as TicketType;
              }
              return await this.dbConnection.getRepository(Guest).save(guest);
            } else {
              return alreadyUser;
            }
          } catch (err) {
            return null;
          }
        }),
      );

      guests = guests.filter((guest) => guest !== null);

      if (guestStatus === 'INVITED' && payload.sendInvite) {
        //sendInvites(guests, payload.inviteMessage)
      }

      const guestsTransform = await Promise.all(
        guests.map(async (guest) => {
          const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'),guest.user.id);
          return toGuest(guest, focuses);
        }),
      );
      return responses.data(guestsTransform);
    } catch (err) {
      return responses.badRequest('Error adding guests');
    }
  }

  public static async withdrawInvites(payload: GuestsRequestDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
      if (!event) return responses.badRequest('Event not found');

      if (!payload.guests) return responses.badRequest('No invites to withdraw');

      const guestsIds = payload.guests;

      await this.dbConnection.getRepository(Guest)
        .createQueryBuilder()
        .update(Guest)
        .set({ status: GuestStatus.NO_STATUS })
        .where('event_id = :eventId', { eventId: event.id })
        .andWhere('id IN (:...ids)', { ids: guestsIds })
        .execute();

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error removing guests');
    }
  }

  public static async updateGuests(payload: UpdateGuestsRequestDto): Promise<GuestsDataResponse> {
    try {
      let ticketType;
      if (payload.ticketTypeId) {
        ticketType = await this.dbConnection.getRepository(TicketType).findOne({ where: { id: payload.ticketTypeId } });
        if (!ticketType) return responses.badRequest('Ticket type not found');
      }

      const guestStatus = payload.guestStatus?.toString().trim().toUpperCase();
      if (guestStatus && !Object.keys(GuestStatus).includes(guestStatus)) {
        return responses.badRequest('Invalid guest status');
      }

      const guests = await Promise.all(
        payload.guests.map(async (guestId) => {
          try {
            const guest = await this.dbConnection.getRepository(Guest).findOne({ where: { id: guestId } });
            if (!guest) {
              return null;
            }
            guest.maxAdditionalGuests = payload.maxAdditionalGuests !== undefined ? payload.maxAdditionalGuests : guest.maxAdditionalGuests;
            guest.privateGuestNote = payload.privateGuestNote !== undefined ? payload.privateGuestNote : guest.privateGuestNote;

            if (guestStatus) {
              guest.status = guestStatus as GuestStatus;
            }

            if (ticketType) {
              guest.ticketType = { id: ticketType.id } as TicketType;
            }

            return await this.dbConnection.getRepository(Guest).save(guest);
          } catch (err) {
            return null;
          }
        }),
      );

      const updatedGuests = guests.filter((guest) => guest !== null);

      if (updatedGuests.length > 0 && guestStatus === 'INVITED' && payload.sendInvite) {
        //sendInvites(guests, payload.inviteMessage)
      }
      const updatedGuestIds = updatedGuests.map((el) => el.id);
      const rowsUpdated = await this.dbConnection.getRepository(Guest).find({
        where: { id: In(updatedGuestIds) },
        relations: { user: true },
      });

      const guestsTransform = await Promise.all(
        rowsUpdated.map(async (guest) => {
          const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), guest.user.id);
          return toGuestDataSimple(guest, focuses);
        }),
      );

      return responses.data(guestsTransform);
    } catch (err) {
      return responses.badRequest('Error updated guests');
    }
  }

  public static async getGuests(payload: GuestsQueryRequestDto): Promise<GuestsResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
      const socialNetworkNames = parsedQuery?.socialNetworkNames ? parsedQuery.socialNetworkNames : undefined;
      const followerCountFrom = parsedQuery?.followerCountFrom ? parseInt(parsedQuery.followerCountFrom as string) : undefined;
      const followerCountTo = parsedQuery?.followerCountTo ? parseInt(parsedQuery.followerCountTo as string) : undefined;
      const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
      const { error: validationError, response: validation } = validateFilters(payload.query);
      if (validationError) return responses.badRequest(validation);
      const guestStatus = parsedQuery?.status ? parsedQuery.status.toString().toUpperCase() : undefined;

      let socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {};
      if (typeof socialNetworkNames === 'string') {
        const socialNetworkArray = socialNetworkNames.split(',').map((name) => name.trim().toUpperCase());
        socialNetworkObject = socialNetworkArray.reduce(
          (acc, name) => {
            acc[name] = SocialProviderType[name as keyof typeof SocialProviderType];
            return acc;
          },
          {} as { [key in keyof typeof SocialProviderType]?: string },
        );
      }

      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
      if (!event) return responses.badRequest('Event not found');

      const queryBuilder = this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

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
        .offset(skip)
        .limit(take);

      if (guestStatus) {
        queryBuilder.andWhere({ status: GuestStatus[guestStatus] });
      }

      if (searchValue) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('user.firstName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.lastName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.email ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.username ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.phoneNumber ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('address.city ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('address.address ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', { searchValue: `%${searchValue}%` });
          }),
        );
      }

      if (Object.keys(socialNetworkObject).length > 0) {
        const socialConditions = Object.keys(socialNetworkObject).map((networkKey) => {
          const columnName = `${networkKey.toLowerCase()}FollowersCount`;
          return `(socialStats.${columnName} BETWEEN :followerCountFrom AND :followerCountTo)`;
        });

        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(socialConditions.join(' OR '), {
              followerCountFrom: followerCountFrom || 0,
              followerCountTo: followerCountTo || Number.MAX_SAFE_INTEGER,
            });
          }),
        );
      }

      const guests = await queryBuilder.getMany();
      const buildGuests = await Promise.all(
        guests.map(async (guest) => {
          const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), guest.user.id);
          const guestData = toGuest(guest, focuses, socialNetworkObject);
          return { ...guestData, category: focuses.map((focus) => focus.name) };
        }),
      );
      return responses.data(buildGuests);
    } catch (err) {
      return responses.badRequest('Error getting guests');
    }
  }

  public static async deleteGuests(payload: GuestsRequestDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
      if (!event) return responses.badRequest('Event not found');

      if (!payload.guests) return responses.badRequest('No guests to delete');

      const guestsIds = payload.guests;

      await this.dbConnection.getRepository(Guest)
        .createQueryBuilder()
        .softDelete()
        .from(Guest)
        .where('event_id = :eventId', { eventId: event.id })
        .andWhere('id IN (:...ids)', { ids: guestsIds })
        .execute();

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error removing guests');
    }
  }

  public static async listGuestsOverview(payload: GuestsQueryRequestDto): Promise<GuestsDataResponse> {
    try {
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
        const guestStatusArray = (parsedQuery.guestStatus as string).split(',').map((status) => status.trim());
        const invalidStatuses = guestStatusArray.filter((status) => !isValidGuestStatus(status));
        if (invalidStatuses.length > 0) {
          return responses.badRequest(`Invalid status values: ${invalidStatuses.join(', ')}`);
        }
        addCondition({ status: In(guestStatusArray) });
      }
      addCondition({ event: { id: payload.eventId } });

      addCondition(
        parsedQuery.guestName && {
          user: [{ firstName: ILike(`${parsedQuery.guestName}%`) }, { lastName: ILike(`${parsedQuery.guestName}%`) }, { username: ILike(`${parsedQuery.guestName}%`) }],
        },
      );

      if (parsedQuery.gender) {
        const gender = String(parsedQuery.gender).trim().toUpperCase();
        const validateGender = isValidUserGender(gender);
        if (!validateGender) return responses.badRequest(`Invalid gender value ${parsedQuery.gender}`);
        addCondition({ user: { gender } });
      }

      if (parsedQuery.ticketTypeIds) {
        const ticketTypes = (parsedQuery.ticketTypeIds as string).split(',').map((ticketTypeId) => ticketTypeId.trim());
        addCondition({ ticketType: { id: In(ticketTypes) } });
      }

      const whereClause = andConditions.length > 0 ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {}) : {};

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
        guests.map(async (guest) => {
          const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL') ,guest.user.id);
          return toGuestDataSimple(guest, focuses);
        }),
      );

      let filteredGuests = guestsTransform;

      if (parsedQuery.fromAge || parsedQuery.toAge) {
        const fromAge = parsedQuery.fromAge ? parseInt(parsedQuery.fromAge as string) : 0;
        const toAge = parsedQuery.toAge ? parseInt(parsedQuery.toAge as string) : null;

        filteredGuests = filteredGuests.filter((guest) => guest.age >= fromAge && (toAge === null || guest.age <= toAge));
      }

      if (parsedQuery.categoryNames) {
        const categories = (parsedQuery.categoryNames as string).split(',').map((category) => category.trim().toLowerCase());

        filteredGuests = filteredGuests.filter((guest) => guest.category?.some((cat) => categories.includes(cat.toLowerCase())));
      }

      return responses.data(filteredGuests);
    } catch (err) {
      return responses.badRequest('Error retrieving guest list.');
    }
  }

  public static async listGuestProfiles(payload: GuestsQueryRequestDto): Promise<GuestsDataResponse> {
    try {
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
      addCondition(parsedQuery.maxAdditionalGuests && { maxAdditionalGuests: parsedQuery.maxAdditionalGuests }, 'AND');
      addCondition(parsedQuery.maxAdditionalGuests && { maxAdditionalGuests: parsedQuery.maxAdditionalGuests }, 'AND');
      addCondition(parsedQuery.addedById && { addedBy: { id: parsedQuery.addedById } }, 'AND');
      addCondition(parsedQuery.declinedById && { declinedBy: { id: parsedQuery.declinedById } }, 'AND');
      addCondition({ event: { id: payload.eventId } }, 'AND');

      const whereClause = andConditions.length > 0 ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {}) : {};
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
        guests.map(async (guest) => {
          const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), guest.user.id);
          return toGuestDataSimple(guest, focuses);
        }),
      );

      return responses.data(guestsTransform);
    } catch (err) {
      return responses.badRequest('Error retrieving guest list.');
    }
  }

  public static async getGuestProfile(payload: RequestByIdDto): Promise<GetGuestProfileResponse> {
    try {
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
            },
            addedBy: true,
            declinedBy: true,
          },
        })
      )[0];

      if (!guest) {
        return responses.notFound('Guest not found');
      }

      const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), guest.user.id);
      return responses.data(toGuestData(guest.user, guest, focuses));
    } catch (err) {
      return responses.badRequest('Error at get user list.');
    }
  }

  public static async getUsersEventInvitees(payload: ListUsersInviteesDto): Promise<ListUsersEventInviteesResponse> {
    try {
      const { userId, query: initialQuery } = payload;
      const parsedQuery = parse(initialQuery) as ParsedQs;
      const user = await serviceMesh.getBasicHostProfile(config.get('API_BASE_URL'), userId);
      if (!user) return responses.notFound('User is not a host.');
      let usersQuery = initialQuery;
      if (parsedQuery.eventId) {
        const eventId = Array.isArray(parsedQuery.eventId) ? parsedQuery.eventId[0] : parsedQuery.eventId;

        const event = await this.dbConnection.getRepository(Event).findOne({
          where: { id: eventId as string },
          relations: { guests: { user: true } },
        });

        if (event) {
          let guests = event.guests;
          if (parsedQuery.guestStatus) {
            guests = guests.filter((guest) => guest.status === GuestStatus[parsedQuery.guestStatus as string]);
          }

          if (parsedQuery.myGuests && parsedQuery.myGuests === 'true') {
            guests = guests.filter((guest) => guest.addedBy?.id === userId);
          }

          const userIds = guests.map((guest) => guest.user.id);
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

        const userIds = guests.map((guest) => guest.user.id);
        if (userIds.length > 0) {
          const userIdsParam = userIds.join(',');
          usersQuery += `&usersIds=${userIdsParam}`;
        }
      }

      const users = await serviceMesh.getMembersOrNonMembers(config.get('API_BASE_URL'), userId, usersQuery);
      const inviteesDataList = {
        data: await this.mapUsersToInvitees(users, userId, String(parsedQuery.guestStatus)),
      };

      return responses.data(inviteesDataList);
    } catch (err) {
      return responses.badRequest('Error getting user invitees');
    }
  }

  // Helper function to map users to invitees
  public static async mapUsersToInvitees(users: Member[], userId: string, guestStatus?: string) {
    return Promise.all(
      users.map(async (user) => {
        const guestRecords = await this.dbConnection.getRepository(Guest).find({
          where: {
            user: { id: user.id },
            event: { owner: { id: userId } },
            ...(guestStatus && { status: GuestStatus[guestStatus] }),
          },
          relations: { addedBy: { addedGuests: true }, event: true },
        });

        const addedByList = guestRecords.flatMap(
          (guest) =>
            guest.addedBy?.addedGuests.map((g) => ({
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

  public static async listEventGuests(payload: ListEventGuestsDto): Promise<ListEventGuestsResponse> {
    try {
      const currentGuest = await this.dbConnection.getRepository(Guest).findOne({ where: { user: { id: payload.userId } } });
      if (!currentGuest) return { ...responses.notFound('User guest not found'), data: [] };
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

          const locationsToFind: EventLocationInterface[] = eventsNear.map((item) => {
            return {
              lat: Number(item?.location?.latitude || 0),
              long: Number(item?.location?.longitude || 0),
              id_event: String(item.id || ''),
              id_location: String(item?.location?.id || ''),
            };
          });

          const locations = this.filterLocationsByDistance(latitude, longitude, locationsToFind);
          const locationsWhere = locations.map((item) => item.id_event);

          if (locationsWhere.length > 0) {
            return { id: In(locationsWhere) };
          }
        }
        return null;
      };
      const locationCondition = await addLocationCondition(Number(parsedQuery.longitude), Number(parsedQuery.latitude));
      addCondition(locationCondition, 'AND');

      // AND conditions
      let status: EventStatusEnum[];
      if (parsedQuery.statusName) {
        status = String(parsedQuery.statusName)
          .split(',')
          .map((item) => {
            return item as EventStatusEnum;
          });
      }

      addCondition(parsedQuery.ownerId && { owner: { id: parsedQuery.ownerId } }, 'AND');
      addCondition(parsedQuery.eventTypeId && { eventType: { id: parsedQuery.eventTypeId } }, 'AND');
      addCondition(parsedQuery.eventTypeName && { eventType: { name: parsedQuery.eventTypeName } }, 'AND');
      addCondition(
        parsedQuery.eventTypeId && {
          eventType: {
            id: In(
              String(parsedQuery.eventTypeId)
                .split(',')
                .map((id) => id.trim()),
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
                .map((id) => id.trim()),
            ),
          },
        },
        'AND',
      );

      addCondition(parsedQuery.startDate && { startDate: LessThanOrEqual(new Date(String(parsedQuery.startDate))) }, 'AND');
      addCondition(parsedQuery.startDate && { startDate: MoreThanOrEqual(new Date(String(parsedQuery.startDate))) }, 'AND');
      addCondition(parsedQuery.endDate && { endDate: MoreThanOrEqual(new Date(String(parsedQuery.endDate))) }, 'AND');
      addCondition(parsedQuery.endDate && { endDate: LessThanOrEqual(new Date(String(parsedQuery.endDate))) }, 'AND');
      addCondition(parsedQuery.minAgeLimit && { ageLimit: { minAge: MoreThanOrEqual(parsedQuery.minAgeLimit) } }, 'AND');
      addCondition(parsedQuery.maxAgeLimit && { ageLimit: { maxAge: LessThanOrEqual(parsedQuery.maxAgeLimit) } }, 'AND');
      addCondition(parsedQuery.ageLimitName && { ageLimit: { name: ILike(parsedQuery.ageLimitName) } }, 'AND');
      addCondition(parsedQuery.ageLimitDescription && { ageLimit: { description: ILike(parsedQuery.ageLimitDescription) } }, 'AND');
      addCondition(parsedQuery.ageLimitId && { ageLimit: { id: parsedQuery.ageLimitId } }, 'AND');
      addCondition(
        parsedQuery.collaboratorIds && {
          collaborators: {
            id: In(
              String(parsedQuery.collaboratorIds)
                .split(',')
                .map((id) => id.trim()),
            ),
          },
        },
        'AND',
      );
      addCondition(parsedQuery.findByOwnerEmail && { owner: { email: ILike(`%${parsedQuery.findByOwnerEmail}%`) } }, 'AND');
      addCondition(parsedQuery.findByOwnerName && { owner: { firstName: ILike(`%${parsedQuery.findByOwnerName}%`) } }, 'AND');
      addCondition(
        parsedQuery.ticketTypeIds && {
          ticketTypes: {
            id: In(
              String(parsedQuery.ticketTypeIds)
                .split(',')
                .map((id) => id.trim()),
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
                .map((id) => id.trim()),
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
                .map((id) => id.trim()),
            ),
          },
        },
        'AND',
      );

      const userFilter = {
        guests: {
          user: { id: payload.userId },
          status: In(
            Object.values(GuestStatus).map((item) => {
              return item;
            }),
          ),
        },
      };

      const dateNow = new Date();
      if (parsedQuery.guestEventStatus) {
        if (parsedQuery.guestEventStatus == 'UPCOMING') {
          addCondition({ startDate: LessThan(dateNow) });
          userFilter.guests.status = In([GuestStatus.CONFIRMED]);
        } else if (parsedQuery.guestEventStatus == 'PAST') {
          addCondition({ endDate: MoreThan(dateNow) });
          userFilter.guests.status = In([GuestStatus.CONFIRMED]);
        } else if (parsedQuery.guestEventStatus == 'INVITED') {
          userFilter.guests.status = In([GuestStatus.INVITED]);
        } else if (parsedQuery.guestEventStatus == 'APPLIED') {
          userFilter.guests.status = In([GuestStatus.APPLIED]);
        }
      }
      if (parsedQuery.feed) {
        addCondition({ status: EventStatusEnum.APPROVED_STATUS });
      } else {
        addCondition(
          parsedQuery.statusName && {
            status: In(status),
          },
          'AND',
        );
      }

      const whereClause = andConditions.length > 0 ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {}) : {};
      const eventsPrefiltered = await this.dbConnection.getRepository(Event).find({
        where: { ...whereClause, ...userFilter },
      });
      const eventsPrefilteredIds = eventsPrefiltered.map((item) => item.id);
      const filter = { id: In(eventsPrefilteredIds) };

      // OR conditions
      if (parsedQuery.findByCollaboratorLikeNameOrEmail) {
        orConditions.push(
          {
            ...filter,
            collaborators: { name: ILike(`%${parsedQuery.findByCollaboratorLikeNameOrEmail}%`) },
          },
          {
            ...filter,
            collaborators: { email: ILike(`%${parsedQuery.findByCollaboratorLikeNameOrEmail}%`) },
          },
        );
      }

      if (parsedQuery.findByTalentsLikeNameOrEmail) {
        orConditions.push(
          { ...filter, talents: { name: ILike(`%${parsedQuery.findByTalentsLikeNameOrEmail}%`) } },
          { ...filter, talents: { email: ILike(`%${parsedQuery.findByTalentsLikeNameOrEmail}%`) } },
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

      const events = await this.dbConnection.getRepository(Event).find({
        where: finalWhereClause,
        order: order,
        ...pagination,
        relations: {
          owner: true,
          location: true,
          eventType: true,
          ageLimit: true,
          guests: { user: true },
        },
      });

      return responses.data(events.map((item) => toEventGuest(item, currentGuest)));
    } catch (err) {
      return responses.badRequest('Error removing guests');
    }
  }

  public static async requestBecomeGuest(payload: RequestBecomeGuestRequestDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: {
          id: payload.eventId,
          deletedAt: null,
          status: EventStatusEnum.APPROVED_STATUS,
        },
      });

      if (!event) {
        return responses.notFound('Event not found');
      }

      const user = await serviceMesh.getUser(config.get('API_BASE_URL'), payload.id);

      if (!user) {
        return responses.notFound('User not found');
      }

      const alreadyGuest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          user: { id: user.id },
          event: { id: payload.eventId },
        },
      });
      if (alreadyGuest) return responses.badRequest('User is already a guest of this event');

      const quiz = await this.dbConnection.getRepository(QuizQuestion).find({
        where: {
          event: { id: payload.eventId },
          required: true,
          enabled: true,
        },
      });

      await Promise.all(
        payload.answers.map(async (item) => {
          let actualAnswer = await this.dbConnection.getRepository(UserQuizAnswer).findOne({
            where: {
              user: { id: user.id },
              event: { id: payload.eventId },
              question: { id: item.questionId },
              deletedAt: null,
            },
          });

          if (!actualAnswer) {
            actualAnswer = this.dbConnection.getRepository(UserQuizAnswer).create({
              user: { id: user.id },
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
          user: { id: user.id },
          event: { id: payload.eventId },
        },
        relations: { question: true },
      });

      const countMandatoryAlready = usersQuizAnswer.filter((item) => {
        if (item?.question?.required) return item;
      }).length;

      if (quiz) {
        if (countMandatoryAlready < quiz.length) return responses.badRequest('The user has not answered all the required questions');
      }

      const guest = new Guest();
      guest.event = event;
      guest.user = { id: user.id };
      guest.status = GuestStatus.APPLIED;
      guest.additionalRequestedGuests = payload.additionalGuests;
      guest.invitationSource = UserSource.REQUEST_IN_APP;
      await this.dbConnection.getRepository(Guest).save(guest);

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error when request become guest.');
    }
  }

  public static async updateRequestBecomeGuest(payload: UpdateRequestBecomeGuestRequestDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: {
          id: payload.eventId,
          deletedAt: null,
          status: EventStatusEnum.APPROVED_STATUS,
        },
      });

      if (!event) {
        return responses.notFound('Event not found');
      }

      const user = await serviceMesh.getUser(config.get('API_BASE_URL'), payload.id);

      if (!user) {
        return responses.notFound('User not found');
      }

      const alreadyGuest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          user: { id: user.id },
          event: { id: payload.eventId },
        },
      });

      if (!alreadyGuest) return responses.notFound('Guest not found');

      if (alreadyGuest.status != GuestStatus.APPLIED) return responses.badRequest('Guest has  incorrect status :' + alreadyGuest.status);

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
        payload.answers.map(async (item) => {
          let actualAnswer = await this.dbConnection.getRepository(UserQuizAnswer).findOne({
            where: {
              user: { id: user.id },
              event: { id: payload.eventId },
              question: { id: item.questionId },
              deletedAt: null,
            },
          });

          if (!actualAnswer) {
            actualAnswer = this.dbConnection.getRepository(UserQuizAnswer).create({
              user: { id: user.id },
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
          user: { id: user.id },
          event: { id: payload.eventId },
        },
        relations: { question: true },
      });

      const countMandatoryAlready = usersQuizAnswer.filter((item) => {
        if (item?.question?.required) return item;
      }).length;

      if (quiz) {
        if (countMandatoryAlready < quiz.length) return responses.badRequest('The user has not answered all the required questions');
      }

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error when request become guest.');
    }
  }

  public static async syncUserTopAttendee(): Promise<GenericResponse> {
    try {
      const LIMIT_FOR_USER_ATTENDEE = parseInt(process.env.LIMIT_FOR_USER_ATTENDEE || '50', 10);
      const users = await this.dbConnection.getRepository(Guest)
        .createQueryBuilder('guest')
        .innerJoinAndSelect('guest.user', 'user')
        .innerJoin('guest.event', 'event')
        .where('guest.status = :guestStatus', { guestStatus: GuestStatus.CONFIRMED })
        .andWhere('event.status = :eventStatus', { eventStatus: EventStatusEnum.APPROVED_STATUS })
        .groupBy('user.id')
        .orderBy('COUNT(event.id)', 'DESC')
        .select(['user.id', 'user.first_name', 'user.last_name', 'user.email', 'user.phone_number', 'user.profile_picture', 'COUNT(event.id) AS eventCount'])
        .limit(LIMIT_FOR_USER_ATTENDEE)
        .getRawMany();

      const topAttendees = await Promise.all(
        users.map(async (user) => {
          const socialStats = await serviceMesh.syncSocialStats(config.get('API_BASE_URL'), user.user_id);
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
        topAttendees.map((attendee) => {
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
          attendee.socialStats.forEach((stat) => {
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
    } catch (err) {
      return responses.badRequest('Error syncing top attendees');
    }
  }

  public static async getTopUsersAttendees(): Promise<UsersAttendeesResponse> {
    try {
      const users = await this.dbConnection.getRepository(UserAttendeeStats).find({ relations: ['user'] });

      return responses.data(
        users.map((user) => {
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
        }),
      );
    } catch (err) {
      return responses.badRequest('Error at get top users attendees');
    }
  }

  public static async cancelEventInvitation(payload: CancelEventInvitationRequestDto): Promise<GenericResponse> {
    try {
      const guest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          event: { id: payload.eventId },
          user: { id: payload.userId },
        },
      });
      if (!guest) return responses.badRequest('Guest not found');
      if (guest.status !== GuestStatus.APPLIED) return responses.badRequest('Guest is not cancelled');
      await this.dbConnection.getRepository(Guest).delete(guest.id);
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Cancel event invitation error');
    }
  }

  public static async declineEventInvitation(payload: DeclineEventInvitationRequestDto): Promise<GenericResponse> {
    try {
      const guest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          event: { id: payload.eventId },
          user: { id: payload.userId },
        },
      });
      if (!guest) return responses.badRequest('Guest not found');
      if (guest.status === GuestStatus.DECLINED) return responses.badRequest('Guest is already declined');
      guest.status = GuestStatus.DECLINED;
      guest.rejectedReason = payload.reason;
      guest.declinedBy = { id: payload.userId } as User;
      await this.dbConnection.getRepository(Guest).save(guest);
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Decline event invitation error');
    }
  }

  /**
   * Added functionality to invite guest
   *
   * Logic:
   *    1. Verify event existence.
   *    2. Confirm lead guest presence.
   *    3. Check if the max allowed additional guests exceed current invites.
   *    4. Create non-member user if guest doesn't exist.
   *    5. Ensure guest isn't already invited for same event.
   *    6. Add guest to table with "invited" status.
   * @param payload
   * @returns GuestsDataResponse
   */
  public static async inviteGuest(payload: InvitedGuestRequestDto): Promise<GuestsDataResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId, deletedAt: IsNull() } });
      if (!event) return responses.badRequest('Event not found');

      const leadGuest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          event: { id: event.id },
          user: { id: payload.userId },
          deletedAt: IsNull(),
        },
      });
      if (!leadGuest) return responses.badRequest('Lead Guest not found');

      const guestList: Guest[] = await this.dbConnection.getRepository(Guest).find({
        where: { event: { id: event.id }, deletedAt: IsNull() },
        relations: {
          user: true,
          addedBy: true,
        },
      });
      const invitedGuestList: Guest[] = guestList.filter((g: Guest) => g.addedBy?.id === payload.userId);
      if (leadGuest.maxAdditionalGuests === invitedGuestList.length) {
        return responses.badRequest('Guest limit reached. Unable to invite additional guests');
      }

      const member: SimpleUser = await serviceMesh.registerInvitesAsNonMember(config.get('API_BASE_URL'), payload);
      let guest = new Guest();
      const user: User = {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phoneNumber: member.phoneNumber,
      } as User;

      const isInvitedGuest = guestList.find((guest: Guest) => guest.user.id === user.id);
      if (isInvitedGuest) {
        return responses.badRequest('This guest is already invited.');
      }

      guest.event = { id: payload.eventId } as Event;
      guest.user = user;
      guest.status = GuestStatus.INVITED;
      guest.addedBy = { id: payload.userId } as User;
      this.dbConnection.getRepository(Guest).create(guest);
      guest = await this.dbConnection.getRepository(Guest).save(guest);

      return responses.data([guest].map((guest) => toGuestDataSimple(guest, [])));
    } catch (err) {
      return responses.badRequest('Error sending invite to guests.');
    }
  }

  public static async listUserRequests(payload: GuestsQueryRequestDto): Promise<GuestsResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const take = parsedQuery?.take ? parseInt(parsedQuery.take as string) : undefined;
      const skip = parsedQuery?.skip ? parseInt(parsedQuery.skip as string) : undefined;
      const socialNetworkNames = parsedQuery?.socialNetworkNames ? parsedQuery.socialNetworkNames : undefined;
      const followerCountFrom = parsedQuery?.followerCountFrom ? parseInt(parsedQuery.followerCountFrom as string) : undefined;
      const followerCountTo = parsedQuery?.followerCountTo ? parseInt(parsedQuery.followerCountTo as string) : undefined;
      const searchValue = parsedQuery?.searchValue ? parsedQuery.searchValue : undefined;
      const { error: validationError, response: validation } = validateFilters(payload.query);
      if (validationError) return responses.badRequest(validation);

      let socialNetworkObject: { [key in keyof typeof SocialProviderType]?: string } = {};
      if (typeof socialNetworkNames === 'string') {
        const socialNetworkArray = socialNetworkNames.split(',').map((name) => name.trim().toUpperCase());
        socialNetworkObject = socialNetworkArray.reduce(
          (acc, name) => {
            acc[name] = SocialProviderType[name as keyof typeof SocialProviderType];
            return acc;
          },
          {} as { [key in keyof typeof SocialProviderType]?: string },
        );
      }

      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
      if (!event) return responses.badRequest('Event not found');

      const queryBuilder = this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

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
          new Brackets((qb) => {
            qb.where('user.firstName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.lastName ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.email ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.username ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('user.phoneNumber ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('address.city ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('address.address ILIKE :searchValue', { searchValue: `%${searchValue}%` })
              .orWhere('CAST(user.gender AS TEXT) ILIKE :searchValue', { searchValue: `%${searchValue}%` });
          }),
        );
      }

      if (Object.keys(socialNetworkObject).length > 0) {
        const socialConditions = Object.keys(socialNetworkObject).map((networkKey) => {
          const columnName = `${networkKey.toLowerCase()}FollowersCount`;
          return `(socialStats.${columnName} BETWEEN :followerCountFrom AND :followerCountTo)`;
        });

        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(socialConditions.join(' OR '), {
              followerCountFrom: followerCountFrom || 0,
              followerCountTo: followerCountTo || Number.MAX_SAFE_INTEGER,
            });
          }),
        );
      }

      const guests = await queryBuilder.getMany();
      const buildGuests = await Promise.all(
        guests.map(async (guest) => {
          const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'), guest.user.id);
          const vouches = await serviceMesh.getUserVouches(config.get('API_BASE_URL'), guest.user.id);
          const answers = await this.dbConnection.getRepository(UserQuizAnswer).find({
            where: {
              user: { id: guest.user.id },
              event: { id: payload.eventId },
            },
            relations: {
              question: true,
            },
          });
          const guestData = toGuest(guest, focuses, socialNetworkObject, vouches, answers);
          return { ...guestData, category: focuses.map((focus) => focus.name) };
        }),
      );
      return responses.data(buildGuests);
    } catch (err) {
      return responses.badRequest('Error getting guests requested');
    }
  }

  public static async getUserRequests(payload: RequestByIdDto): Promise<GetUserRequestsResponse> {
    try {
      const guestExists = await this.dbConnection.getRepository(Guest).findOne({ where: { id: payload.id }, relations: { event: true } });
      if (!guestExists) return responses.notFound('Guest not found');

      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: guestExists?.event?.id, deletedAt: null } });
      if (!event) return responses.badRequest('Event not found');

      const queryBuilder = this.dbConnection.getRepository(Guest).createQueryBuilder('guest');

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
        .limit(1);

      const guest = await queryBuilder.getOne();

      const focuses = await serviceMesh.getUserFocuses(config.get('API_BASE_URL'),guest.user.id);
      const vouches = await serviceMesh.getUserVouches(config.get('API_BASE_URL'),guest.user.id);
      const answers = await this.dbConnection.getRepository(UserQuizAnswer).find({
        where: {
          user: { id: guest.user.id },
          event: { id: event.id },
        },
        relations: {
          question: true,
        },
      });
      const guestData = toGuest(guest, focuses, undefined, vouches, answers);
      const data = { ...guestData, category: focuses.map((focus) => focus.name) };

      return responses.data(data);
    } catch (err) {
      return responses.badRequest('Error getting guests requested');
    }
  }

  public static async manageBulkGuests(payload: ManageBulkGuestsRequestDto): Promise<GenericResponse> {
    try {
      const validateManageBulkGuests = this.validateManageBulkGuests(payload);
      if (!validateManageBulkGuests.validate) return responses.badRequest(validateManageBulkGuests.message);
      let ticketType;
      if (guestStatusToEntity[payload.status] === GuestStatus.CONFIRMED) {
        ticketType = await this.dbConnection.getRepository(TicketType).findOne({
          where: { id: payload.ticketTypeId },
        });
        delete payload.reason;
        if (!ticketType) {
          return responses.badRequest('Invalid ticket type id');
        }
      }
      const guestIds = payload.guestIds.map((guest) => guest.guestId);

      const guests = await this.dbConnection.getRepository(Guest).find({
        where: {
          id: In(guestIds),
          deletedAt: IsNull(),
        },
      });

      const results = await Promise.all(
        payload.guestIds.map(async (guestInfo) => {
          const guest = guests.find((g) => g.id === guestInfo.guestId);
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
            await serviceMesh.markUserAsSpam(config.get('API_BASE_URL'), guest.user.id);
          }

          return true;
        }),
      );

      const successCount = results.filter((result) => result).length;
      if (successCount === 0) {
        return responses.badRequest('No guests were successfully updated');
      }
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error manage Bulk guest');
    }
  }

  public static async getGuestDetails(payload: RequestByIdDto): Promise<GuestDetailsResponse> {
    try {
      if (!payload.id) return responses.badRequest('Invalid guest ID provided');
      const guestProfileResponse = await this.getGuestProfile(payload);
      const { error, data: guestProfile } = guestProfileResponse;
      if (error) {
        return responses.badRequest(error.message);
      }
      const guestDetail = await this.dbConnection.getRepository(Guest).findOne({
        where: { id: payload.id },
        relations: { ticketType: true, user: true, event: true },
      });
      if (!guestDetail) {
        return responses.badRequest('Guest not found');
      }

      const { id: guestId, user, ticketType, maxAdditionalGuests = 0, privateGuestNote = '', status } = guestDetail;

      const guestStatus = status ? guestStatusToEntity[status] : GuestStatus.NO_STATUS;
      const vouches = await serviceMesh.getUserVouches(config.get('API_BASE_URL'), guestDetail.user.id);

      const quizAnswer = await this.dbConnection.getRepository(UserQuizAnswer).find({
        where: {
          user: { id: guestDetail.user.id },
          event: { id: guestDetail.event.id },
        },
      });

      return responses.data({
        guestDetail: {
          guestId,
          userId: user?.id || null,
          ticketType: ticketType?.name || null,
          maxAdditionalGuests,
          privateGuestNote,
          guestStatus,
        },
        guestProfile,
        quizDataList: { questions: quizAnswer && quizAnswer.length ? quizAnswer.map(toQuizData) : [] },
        vouches: vouches && vouches.length ? vouches.map(toVouchesData) : [],
      });
    } catch (err) {
      return responses.badRequest('Error at get guest details');
    }
  }

  public static async listInvitedGuests(payload: ListUsersEventInviteesRequestDto): Promise<GuestsDataResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId, deletedAt: IsNull() } });
      if (!event) return responses.badRequest('Event not found');
      const leadGuest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          event: { id: event.id },
          user: { id: payload.userId },
          deletedAt: IsNull(),
        },
      });
      if (!leadGuest) return responses.badRequest('Lead Guest not found');
      leadGuest.user = { id: payload.userId } as User;
      const invitedGuestList: Guest[] = await this.dbConnection.getRepository(Guest).find({
        where: { event: { id: event.id }, addedBy: { id: payload.userId }, deletedAt: IsNull() },
        relations: {
          user: true,
        },
      });

      const invitedGuest: GuestDataSimple[] = invitedGuestList.map((guest) => toGuestDataSimple(guest, []));
      return responses.data([leadGuest].map((guest) => toGuestDataSimple(guest, [], invitedGuest)));
    } catch (err) {
      return responses.badRequest('Error at get invited guest details');
    }
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
        if (!payload.maxAdditionalGuests || payload.maxAdditionalGuests < 0 || typeof payload.maxAdditionalGuests !== 'number') {
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
}
