import { StatusCodes } from 'http-status-codes';
import config from 'src/config';
import { AddressValidationClient } from '@googlemaps/addressvalidation';
import { JWT as GoogleAuthJWT } from 'google-auth-library';
import * as QRCode from 'qrcode';
import {
  AddEventToFeaturedSectionDto,
  CreateEventRequestDto,
  CreateEventTypeRequestDto,
  EventAgeLimitDto,
  EventLocationDto,
  ManualEventStatusUpdateRequestDto,
  QueryRequestDto,
  UpdateEventAgeLimitRequestDto,
  UpdateEventLocationRequestDto,
  UpdateEventRequestDto,
  UpdateEventTypeRequestDto,
  UpdateTicketRequestDto,
  ValidateTicketForGuestRequestDto,
} from 'rumor-utils/shared/events/dtos/events.dto'
import {
  AddressValidationRequest,
  AddressValidationResponse,
  EventAgeLimitResponse,
  EventAgeLimitsResponse,
  EventLocationResponse,
  EventLocationsResponse,
  EventResponse,
  EventsResponse,
  EventTypeResponse,
  EventTypesResponse,
  GenerateTicketForGuestResponse,
  GenericResponse,
  GetFeaturedEventsResponse,
  ListEventsFeedResponse,
  ListEventStatusResponse,
  ListEventUsedTicketsResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';
// import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { parse } from 'qs';
import { hasPagination } from 'rumor-utils/shared/events/dtos/shared.dto';
import { RequestByIdDto, UserAndIdRequestDto } from 'rumor-utils/shared/events/dtos/shared.dto';
import { normalizeCatalogName } from '../common/helpers';
import { EventLocation, AdmissionType, EventAgeLimit, Guest, User, EventTypes, Event, Ticket, FeaturedEventSection } from 'rumor-utils/shared/entities';
import GoogleAddressClient  from 'src/utils/clients/googleAddress.client';
import { formatEventStatus, toEvent } from 'rumor-utils/shared/events/mappers/events.mapper';
import { getCityNameFromAddressComponents, isValidEventStatus } from '../utils/event.utils';
import { EventLocationInterface, EventStatusEnum, GuestStatus, TicketStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import { haversineDistance } from 'rumor-utils/utils/utils';

// import { AuthClient } from 'rumor-utils/clients/auth.client';
// import { CommunicationClient } from 'rumor-utils/clients/communication.client';
// import { PlatformClient } from 'rumor-utils/clients/platform.client';
// import { JwtService } from '@nestjs/jwt';

import { EventStatus, FeaturedEvent } from 'rumor-utils/shared/events/grpc/events/general.pb';
import { entityToTicketStatus, ticketStatusToEntity, toTicketData } from 'rumor-utils/shared/events/mappers/guest.mapper';
import database from '../database'

const responses = {
  conflict: (message: string) => ({
    status: StatusCodes.CONFLICT,
    error: {
      type: 'CONFLICT',
      message: message,
    },
  }),
  notFound: (message: string | null) => ({
    status: StatusCodes.NOT_FOUND,
    error: {
      type: 'NOT_FOUND',
      message: message ?? 'Specified entity was not found',
    },
  }),
  badRequest: (message?: string) => ({
    status: StatusCodes.BAD_REQUEST,
    error: {
      type: 'bad_request',
      message: message ?? 'Bad Request',
    },
    data: null,
  }),
  ok: {
    status: StatusCodes.OK,
    error: null,
  },
  data: <T>(data: T) => ({
    status: StatusCodes.OK,
    error: null,
    data: data,
  }),
};

export class EventsService {
  public static dbConnection = database;
  // public static authClient = new AuthClient()
  public static googleAddressClient = new GoogleAddressClient() 

  public static googleAuthClient = new GoogleAuthJWT();

  constructor() {
    const GOOGLE_MAPS_API_KEY = config.get('GOOGLE_MAPS_API_KEY');
    EventsService.googleAuthClient.fromAPIKey(GOOGLE_MAPS_API_KEY);
  }
  //private readonly jwtService: JwtService;

  private readonly eventRepository: Repository<Event>;

  public static filterLocationsByDistance(currentLat: number, currentLng: number, locations: EventLocationInterface[]): EventLocationInterface[] {
    const maxDistance = 50; //50 miles

    return locations.filter((location) => {
      const distance = haversineDistance(currentLat, currentLng, location.lat, location.long);
      return distance <= maxDistance;
    });
  }

  public static async listEventStatus(): Promise<ListEventStatusResponse> {
    try {
      const eventsStatus: string[] = Object.keys(EventStatus).filter((key) => isNaN(Number(key)));
      return responses.data(eventsStatus);
    } catch (err) {
      return responses.badRequest('Error at get list of status for event');
    }
  }

  public static async createEventType(payload: CreateEventTypeRequestDto): Promise<EventTypeResponse> {
    try {
      const item = new EventTypes();
      item.name = normalizeCatalogName(payload.name);
      const existingItem = await this.dbConnection.getRepository(EventTypes).findOne({
        where: {
          name: item.name,
          createdAt: IsNull(),
        },
      });
      if (existingItem) return responses.conflict('Event type with the same name already exists');
      item.description = payload.description;
      item.enabled = payload.enabled;
      const created = await this.dbConnection.getRepository(EventTypes).save(item);
      return responses.data(created);
    } catch (err) {
      return responses.badRequest('Error at create item for EventTypes');
    }
  }

  public static async listEventTypes(payload: QueryRequestDto): Promise<EventTypesResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const pagination = hasPagination(parsedQuery)
        ? {
            take: parseInt(parsedQuery.take),
            skip: parseInt(parsedQuery.skip),
          }
        : {};

      const eventTypes = await this.dbConnection.getRepository(EventTypes).find({ ...pagination });
      return responses.data(eventTypes);
    } catch (err) {
      return responses.badRequest('Error at get list of items of EventTypes');
    }
  }

  public static async getEventType(payload: RequestByIdDto): Promise<EventTypeResponse> {
    try {
      const eventTypes = await this.dbConnection.getRepository(EventTypes).findOne({ where: { id: payload.id } });
      if (!eventTypes) {
        return responses.notFound('Item EventTypes  not found');
      }
      return responses.data(eventTypes);
    } catch (err) {
      return responses.badRequest('Error at get an item  of EventTypes');
    }
  }

  public static async deleteEventType(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      const result = await this.dbConnection.getRepository(EventTypes).delete(payload.id);
      if (result.affected === 0) {
        return responses.notFound('Item of EventTypes not found');
      }
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at delete an item for EventTypes');
    }
  }

  public static async updateEventType(payload: UpdateEventTypeRequestDto): Promise<EventTypeResponse> {
    try {
      if (payload.name) payload.name = normalizeCatalogName(payload.name);
      const existingItem = await this.dbConnection.getRepository(EventTypes).findOne({
        where: {
          name: payload.name,
          createdAt: IsNull(),
        },
      });
      if (existingItem) return responses.conflict('Event type with the same name already exists');
      const updateItem = { ...payload };
      delete updateItem.id;
      await this.dbConnection.getRepository(EventTypes).update(
        {
          id: payload.id,
        },
        updateItem,
      );
      const eventType = await this.dbConnection.getRepository(EventTypes).findOne({
        where: {
          id: payload.id,
        },
      });
      if (!eventType) {
        return responses.notFound('Event type not found');
      }
      return responses.data(eventType);
    } catch (err) {
      return responses.badRequest('Error at update an item for EventTypes');
    }
  }

  public static async createEvent(payload: CreateEventRequestDto): Promise<EventResponse> {
    try {
      if (!payload.ownerId) return responses.badRequest('OwnerId is required');
      if (payload.publishDate && new Date(payload.publishDate) > new Date(payload.startDate))
        return responses.conflict('Publish date cannot be later than the start date.');
      if ((payload.status && payload.status === EventStatusEnum.APPROVED_STATUS) || payload.status === EventStatusEnum.DECLINED_STATUS)
        return responses.conflict(`The event cannot be ${payload.status} at this time.`);

      const event = new Event();
      event.name = payload.name;
      event.description = payload.description;
      event.enabled = payload.enabled;
      if (payload.startDate) {
        event.startDate = new Date(payload.startDate);
      }
      if (payload.endDate) {
        event.endDate = new Date(payload.endDate);
      }
      if (payload.rsvpDeadline) {
        event.rsvpDeadline = new Date(payload.rsvpDeadline);
      }
      if (!payload.status) {
        payload.status = EventStatusEnum.DRAFT_STATUS;
      }
      event.limitOnePlus = payload.limitOnePlus;
      event.useQr = payload.useQr;
      event.isPrivate = payload.isPrivate;
      event.capacity = payload.capacity;
      event.imageFlyer = payload.imageFlyer;
      event.imageCover = payload.imageCover;
      event.furtherInstructions = payload.furtherInstructions;
      event.showLocation = payload.showLocation;
      event.publishDate = payload.publishDate && new Date(payload.publishDate);
      event.status = EventStatusEnum[payload.status as keyof typeof EventStatusEnum];
      if (payload.ownerId) {
        const owner = false//await this.authClient.getUser(payload.ownerId, this.logger);
        if (!owner) return responses.badRequest(`The ID ${payload.ownerId} is not a valid user or the user does not exist!`);
        event.owner = { id: payload.ownerId } as User;
      }

      if (payload.eventTypeId) {
        const eventType = await this.dbConnection.getRepository(EventTypes).findOne({
          where: { id: payload.eventTypeId },
        });
        if (eventType) event.eventType = eventType;
      }
      if (payload.locationId) {
        const eventLocation = await this.dbConnection.getRepository(EventLocation).findOne({
          where: { id: payload.locationId },
        });
        if (eventLocation) event.location = eventLocation;
      }

      if (payload.ageLimitId) {
        const eventAgeLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({
          where: { id: payload.ageLimitId },
        });
        if (eventAgeLimit) event.ageLimit = eventAgeLimit;
      }
      if (payload.admissionTypeId) {
        const addmissionType = await this.dbConnection.getRepository(AdmissionType).findOne({
          where: { id: payload.admissionTypeId },
        });
        if (addmissionType) event.admissionType = addmissionType;
      }

      let createdEvent = await this.dbConnection.getRepository(Event).save(event);
      createdEvent = await this.dbConnection.getRepository(Event).findOne({
        where: { id: createdEvent.id },
        relations: ['owner', 'ageLimit', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions'],
      });

      return responses.data(toEvent(createdEvent, null));
    } catch (err) {
      return responses.badRequest('Error at create item for Event');
    }
  }

  public static async listEvents(payload: QueryRequestDto): Promise<EventsResponse | ListEventsFeedResponse> {
    return this.getEvents(payload, true, false, true);
  }

  public static async listEventsFeed(payload: QueryRequestDto): Promise<EventsResponse | ListEventsFeedResponse> {
    return this.getEvents(payload, false, true, false);
  }

  public static async getFeaturedEvents(payload: QueryRequestDto): Promise<GetFeaturedEventsResponse> {
    try {
      const events: EventsResponse = (await this.getEvents(payload, false, true, true)) as EventsResponse;
      const filteredEvents = events.data.filter((event) => event.featuredEventSection !== null);
      if (!filteredEvents.length) return responses.data([]);

      const grouped = filteredEvents.reduce((acc, event) => {
        const sectionId = event.featuredEventSection.id;
        const sectionName = event.featuredEventSection.name;
        const sectionIndex = event.featuredEventSection.index;

        let section = acc.find((s) => s.id === sectionId);
        if (!section) {
          section = {
            id: sectionId,
            name: sectionName,
            index: sectionIndex,
            events: [],
          };
          acc.push(section);
        }

        section.events.push(event);
        return acc;
      }, [] as FeaturedEvent[]);

      return responses.data(grouped);
    } catch (err) {
      return responses.badRequest('Unable to load featured events');
    }
  }

  public static async getEvents(
    payload: QueryRequestDto,
    includeRelations: boolean,
    fromFeed: boolean,
    includeFeaturedEventSection: boolean,
  ): Promise<EventsResponse | ListEventsFeedResponse> {
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

      if (parsedQuery.longitude && parsedQuery.latitude) {
        const addLocationCondition = async (longitude: number, latitude: number) => {
          if (longitude && latitude) {
            const eventsNear = await this.dbConnection.getRepository(Event).find({
              where: {
                deletedAt: null,
                enabled: true,
                isPublished: fromFeed,
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
        if (!locationCondition) {
          return responses.data([]);
        }
        addCondition(locationCondition, 'AND');
      }

      // AND conditions

      let isPrivate = parsedQuery.isPrivate === 'true' ? true : parsedQuery.isPrivate === 'false' ? false : false;
      if (fromFeed) isPrivate = false;

      let status: EventStatus[];
      if (parsedQuery.statusName) {
        const statusArray = String(parsedQuery.statusName)
          .split(',')
          .map((status) => status.trim());
        const invalidStatuses = statusArray.filter((status) => !isValidEventStatus(status));
        if (invalidStatuses.length > 0) {
          return responses.badRequest(`Invalid status values: ${invalidStatuses.join(', ')}`);
        }
        status = statusArray.map((item) => item as unknown as EventStatus);
      }

      if (fromFeed) {
        addCondition(fromFeed && { isPublished: true }, 'AND');
      } else {
        addCondition(parsedQuery.isPublished && { isPublished: Boolean(parsedQuery.isPublished) }, 'AND');
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
      addCondition(parsedQuery.maxStartDate && { startDate: LessThanOrEqual(new Date(String(parsedQuery.maxStartDate))) }, 'AND');
      addCondition(parsedQuery.minStartDate && { startDate: MoreThanOrEqual(new Date(String(parsedQuery.minStartDate))) }, 'AND');
      addCondition(parsedQuery.minEndDate && { endDate: MoreThanOrEqual(new Date(String(parsedQuery.minEndDate))) }, 'AND');
      addCondition(parsedQuery.maxEndDate && { endDate: LessThanOrEqual(new Date(String(parsedQuery.maxEndDate))) }, 'AND');
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
      addCondition(
        parsedQuery.isPrivate && {
          isPrivate: Boolean(isPrivate),
        },
        'AND',
      );

      // Combine AND and OR conditions
      const whereClause = andConditions.length > 0 ? andConditions.reduce((acc, cond) => ({ ...acc, ...cond }), {}) : {};

      const eventsPrefiltered = await this.dbConnection.getRepository(Event).find({
        where: whereClause,
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

      let relations = includeRelations
        ? ['owner', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions', 'ageLimit']
        : ['owner', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'ageLimit'];

      if (includeFeaturedEventSection) {
        relations = [...relations, 'featuredEventSection'];
      }

      const finalWhereClause = orConditions.length > 0 ? orConditions : filter;

      let events = await this.dbConnection.getRepository(Event).find({
        where: finalWhereClause,
        ...pagination,
        order: order,
        relations,
      });

      if (status && status.length > 0) {
        events = events.filter((event) => {
          if (status.includes(EventStatus[formatEventStatus(event) as unknown as keyof typeof EventStatus])) {
            return event;
          }
        });
      }

      const searchValue = parsedQuery?.searchValue ? String(parsedQuery.searchValue) : undefined;

      if (searchValue) {
        const { skip, take } = pagination;
        const searchValueLower = searchValue.toLowerCase();

        const eventsFiltered = events
          .map((item) => toEvent(item, null))
          .filter((event) => {
            const eventStatusString = EventStatus[event.status]?.toLowerCase() ?? '';
            return (
              event.name?.toLowerCase().includes(searchValueLower) ||
              event.description?.toLowerCase().includes(searchValueLower) ||
              event.location?.city?.toLowerCase().includes(searchValueLower) ||
              event.location?.location?.toLowerCase().includes(searchValueLower) ||
              event.owner?.firstName?.toLowerCase().includes(searchValueLower) ||
              event.owner?.lastName?.toLowerCase().includes(searchValueLower) ||
              event.owner?.email?.toLowerCase().includes(searchValueLower) ||
              event.eventType?.name?.toLowerCase().includes(searchValueLower) ||
              event.ageLimit?.name?.toLowerCase().includes(searchValueLower) ||
              event.ageLimit?.description?.toLowerCase().includes(searchValueLower) ||
              event.admissionType?.name?.toLowerCase().includes(searchValueLower) ||
              event.admissionType?.description?.toLowerCase().includes(searchValueLower) ||
              eventStatusString.includes(searchValueLower) ||
              (event.talents?.length > 0 && event.talents.some((talent) => talent?.name?.toLowerCase().includes(searchValueLower))) ||
              (event.ticketTypes?.length > 0 && event.ticketTypes.some((ticketType) => ticketType?.name?.toLowerCase().includes(searchValueLower))) ||
              (event.collaborators?.length > 0 && event.collaborators.some((collaborator) => collaborator?.name?.toLowerCase().includes(searchValueLower)))
            );
          });

        let paginatedEvents;

        if (typeof skip === 'number' && typeof take === 'number') {
          paginatedEvents = eventsFiltered.slice(skip, skip + take);
        } else {
          paginatedEvents = eventsFiltered;
        }
        return responses.data(paginatedEvents);
      } else {
        return responses.data(events.map((item) => toEvent(item, null)));
      }
    } catch (err) {
      return responses.badRequest('Error at get list of items of Event');
    }
  }

  public static async getEvent(payload: UserAndIdRequestDto): Promise<EventResponse> {
    try {
      const event: Event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: payload.id },
        relations: ['owner', 'ageLimit', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions'],
      });

      // TODO: Change or update QR utilization when QR ready
      const qrCodeUtilization = 0;

      if (!event) return responses.notFound('Item Event  not found');

      const guest = await this.dbConnection.getRepository(Guest).findOne({
        where: {
          event: { id: payload.id },
          user: { id: payload.userId },
        },
        relations: { user: true },
      });

      return responses.data(toEvent(event, qrCodeUtilization, undefined, guest));
    } catch (err) {
      return responses.badRequest('Error at get an item  of Event');
    }
  }

  public static async deleteEvent(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.id, deletedAt: null } });
      if (!event) return responses.notFound('Event was not found!');
      if (event.status !== EventStatusEnum.PENDING_STATUS && event.status !== EventStatusEnum.DRAFT_STATUS) return responses.conflict('Cannot delete an approved event');
      await this.dbConnection.getRepository(Event).softDelete(event.id);
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at delete an item for Event');
    }
  }

  public static async updateEvent(payload: UpdateEventRequestDto): Promise<EventResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: payload.id, deletedAt: IsNull() },
        relations: ['owner', 'ageLimit', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions'],
      });

      if (!event) return responses.notFound('Item of Event not found');
      const validateEvenData = await this.validateEventUpdate(event, payload);
      if (!validateEvenData.validate) return responses.conflict(validateEvenData.message);
      if (payload.status && payload.status === EventStatusEnum.APPROVED_STATUS && !event.publishDate && !payload.publishDate) {
        await this.publishEvent(payload.id);
      }
      if (payload.status === EventStatusEnum.CANCELLED_STATUS) {
        // TODO: Add functionality to send notification to all guests for cancelled event
      } else if (payload.status === EventStatusEnum.DECLINED_STATUS && event.owner) {

        //Micro-service call

        // const success = await this.communicationClient.sendEmailFromTemplate(
        //   [
        //     {
        //       key: 'event_name',
        //       value: event.name,
        //     },
        //     {
        //       key: 'host_name',
        //       value: event.owner.firstName,
        //     },
        //   ],
        //   'Event Submission Rejected',
        //   [event.owner.email],
        //   null,
        //   this.logger,
        // );

        // if (!success) {
        //   this.logger.warn('failed to send the email for event rejection');
        // }
      }

      if (payload.publishDate) {
        event.publishDate = new Date(payload.publishDate);
      }
      event.name = payload.name ?? event.name;
      event.description = payload.description ?? event.description;
      event.enabled = payload.enabled ?? event.enabled;
      event.limitOnePlus = payload.limitOnePlus ?? event.limitOnePlus;
      event.useQr = payload.useQr ?? event.useQr;
      event.imageFlyer = payload.imageFlyer ?? event.imageFlyer;
      event.imageCover = payload.imageCover ?? event.imageCover;
      event.furtherInstructions = payload.furtherInstructions ?? event.furtherInstructions;
      event.showLocation = payload.showLocation ?? event.showLocation;
      event.isPrivate = payload.isPrivate ?? event.isPrivate;
      event.capacity = payload.capacity ?? event.capacity;
      event.status = EventStatusEnum[payload.status as keyof typeof EventStatusEnum];
      if (payload.status) {
        if (payload.status !== EventStatusEnum.APPROVED_STATUS) {
          event.isPublished = false;
        } else if (payload.status === EventStatusEnum.APPROVED_STATUS && !event.publishDate) {
          event.isPublished = true;
        }
      }
      if (payload.startDate) {
        event.startDate = new Date(payload.startDate);
      }
      if (payload.endDate) {
        event.endDate = new Date(payload.endDate);
      }
      if (payload.rsvpDeadline) {
        event.rsvpDeadline = new Date(payload.rsvpDeadline);
      }

      if (payload.ownerId) {
        const owner = {id:""}//await this.authClient.getCurrentMember(payload.ownerId, this.logger);
        if (owner) event.owner = { id: owner.id } as User;
      }
      if (payload.eventTypeId) {
        const eventType = await this.dbConnection.getRepository(EventTypes).findOne({
          where: { id: payload.eventTypeId },
        });
        if (eventType) event.eventType = eventType;
      }

      if (payload.locationId && event.location.id != payload.locationId) {
        await this.dbConnection.getRepository(EventLocation).delete({ id: event.location.id });
        const eventLocation = await this.dbConnection.getRepository(EventLocation).findOne({
          where: { id: payload.locationId },
        });
        if (eventLocation) event.location = eventLocation;
      }

      if (payload.ageLimitId) {
        const eventAgeLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({
          where: { id: payload.ageLimitId },
        });
        if (eventAgeLimit) event.ageLimit = eventAgeLimit;
      }

      if (payload.admissionTypeId) {
        const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({
          where: { id: payload.admissionTypeId },
        });
        if (admissionType) event.admissionType = admissionType;
      }
      await this.dbConnection.getRepository(Event).save(event);
      const updatedEvent = await this.dbConnection.getRepository(Event).findOne({
        where: { id: event.id },
        relations: ['owner', 'ageLimit', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions'],
      });
      return responses.data(toEvent(updatedEvent, null));
    } catch (err) {
      return responses.badRequest('Error at update an item for Event');
    }
  }

  public static async validateAddress(payload: AddressValidationRequest): Promise<AddressValidationResponse> {
    try {
      const addressvalidationClient = new AddressValidationClient({ authClient: this.googleAuthClient });

      const request = {
        address: {
          regionCode: payload.regionCode || 'US',
          addressLines: [payload.address],
        },
      };

      const validations = await addressvalidationClient.validateAddress(request);
      const response = {
        isValid: false,
        address: payload.address,
        formattedAddress: null,
      };

      if (validations && validations.length > 0) {
        const validation = validations[0];

        response.isValid = validation.result?.verdict?.addressComplete || false;
        response.formattedAddress = validation.result?.address?.formattedAddress;
      }

      return responses.data(response);
    } catch (err) {
      return responses.badRequest('Error validating event address');
    }
  }

  public static async createEventLocation(payload: EventLocationDto): Promise<EventLocationResponse> {
    try {
      let dataResp: EventLocation;
      let placeId = payload.placeId;

      if (!placeId) {
        const placeResponse =
         await GoogleAddressClient.findPlaceFromText(payload.location);
        placeId = placeResponse.candidates[0]?.place_id;

        if (placeId) {
          const placeLocation = await GoogleAddressClient.geodecodePlaceId(placeId);
          const geoLocation = placeLocation?.results[0]?.geometry?.location;
          const addressComponents = placeLocation?.results[0]?.address_components || [];
          const city = getCityNameFromAddressComponents(addressComponents);

          const savedAddress = this.dbConnection.getRepository(EventLocation).create({
            location: payload.location,
            googlePlaceId: placeId,
            city,
            latitude: geoLocation?.lat,
            longitude: geoLocation?.lng,
          });
          dataResp = await this.dbConnection.getRepository(EventLocation).save(savedAddress);
        }
      } else {
        const placeDetails = await GoogleAddressClient.findPlaceFromPlaceId(placeId);

        const city = getCityNameFromAddressComponents(placeDetails?.result?.address_components || []);
        const formattedAddress = placeDetails?.result?.formatted_address;
        const geoLocation = placeDetails?.result?.geometry?.location;

        const savedAddress = this.dbConnection.getRepository(EventLocation).create({
          location: formattedAddress,
          googlePlaceId: placeId,
          city: city,
          latitude: geoLocation?.lat,
          longitude: geoLocation?.lng,
        });
        dataResp = await this.dbConnection.getRepository(EventLocation).save(savedAddress);
      }

      return responses.data({ ...dataResp, placeId });
    } catch (err) {
      return responses.badRequest('Error at create event location');
    }
  }

  public static async updateEventLocation(payload: UpdateEventLocationRequestDto): Promise<EventLocationResponse> {
    try {
      let dataResp: EventLocation = await this.dbConnection.getRepository(EventLocation).findOne({
        where: { id: payload.id, deletedAt: null },
      });
      if (!dataResp) return responses.notFound('Location not found!');

      let placeId = payload.placeId;

      if (!placeId) {
        const request = {
          address: {
            regionCode: payload.regionCode || 'US',
            addressLines: [payload.location],
          },
        };
        const addressValidationClient = new AddressValidationClient({ authClient: this.googleAuthClient });
        const validations = await addressValidationClient.validateAddress(request);
        const addressUserValidated = validations[0]?.result?.address?.formattedAddress || null;

        if (addressUserValidated) {
          const placeData = await GoogleAddressClient.findPlaceFromText(addressUserValidated);
          placeId = placeData?.candidates[0]?.place_id;

          const geoLocation = validations[0]?.result?.geocode?.location;
          const postalAddress = validations[0]?.result?.address?.postalAddress;

          const city = postalAddress?.locality || postalAddress?.sublocality;

          await this.dbConnection.getRepository(EventLocation).update(
            { id: payload.id },
            {
              location: payload.location,
              googlePlaceId: placeId,
              city,
              latitude: geoLocation?.latitude,
              longitude: geoLocation?.longitude,
            },
          );
        }
      } else {
        const placeDetails = await GoogleAddressClient.findPlaceFromPlaceId(placeId);
        const city = getCityNameFromAddressComponents(placeDetails?.result?.address_components || []);
        const formattedAddress = placeDetails?.result?.formatted_address;
        const geoLocation = placeDetails?.result?.geometry?.location;

        await this.dbConnection.getRepository(EventLocation).update(
          { id: payload.id },
          {
            location: formattedAddress,
            googlePlaceId: payload.placeId,
            city,
            latitude: geoLocation?.lat,
            longitude: geoLocation?.lng,
          },
        );
      }

      dataResp = await this.dbConnection.getRepository(EventLocation).findOne({
        where: { id: payload.id, deletedAt: null },
      });

      return responses.data({ ...dataResp, placeId });
    } catch (err) {
      return responses.badRequest('Error at update event location');
    }
  }

  public static async getEventLocation(payload: RequestByIdDto): Promise<EventLocationResponse> {
    try {
      const eventLocation = await this.dbConnection.getRepository(EventLocation).findOne({
        where: { id: payload.id, deletedAt: null },
      });
      if (!eventLocation) return responses.notFound('Location not found!');

      return responses.data({ ...eventLocation, placeId: eventLocation.googlePlaceId });
    } catch (err) {
      return responses.badRequest('Error at get event location');
    }
  }

  public static async deleteEventLocation(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      const eventLocation = await this.dbConnection.getRepository(EventLocation).findOne({
        where: { id: payload.id, deletedAt: null },
      });
      if (!eventLocation) return responses.notFound('Location not found!');
      await this.dbConnection.getRepository(EventLocation).update({ id: payload.id }, { deletedAt: new Date() });
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at delete event location');
    }
  }

  public static async listEventLocations(payload: QueryRequestDto): Promise<EventLocationsResponse> {
    try {
      const parsedQuery = parse(payload.query);
      const pagination = hasPagination(parsedQuery)
        ? {
            take: parseInt(parsedQuery.take),
            skip: parseInt(parsedQuery.skip),
          }
        : {};

      const eventsLocation = await this.dbConnection.getRepository(EventLocation).find({ ...pagination });

      return responses.data(eventsLocation);
    } catch (err) {
      return responses.badRequest('Error at list event locations');
    }
  }

  public static async createEventAgeLimit(payload: EventAgeLimitDto): Promise<EventAgeLimitResponse> {
    try {
      const savedAgeLimit = this.dbConnection.getRepository(EventAgeLimit).create({
        name: payload.name,
        description: payload.description,
        maxAge: payload.maxAge,
        minAge: payload.minAge,
        enabled: true,
      });
      const savedAgeLimitResp = await this.dbConnection.getRepository(EventLocation).save(savedAgeLimit);

      return responses.data(savedAgeLimitResp);
    } catch (err) {
      return responses.badRequest('Error at create event age limit');
    }
  }

  public static async updateEventAgeLimit(payload: UpdateEventAgeLimitRequestDto): Promise<EventAgeLimitResponse> {
    let response: EventAgeLimitResponse;

    try {
      const { id, name, description, minAge, maxAge, enabled } = payload;

      const eventAgeLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({
        where: { id: id, deletedAt: null },
      });

      if (!eventAgeLimit) return responses.notFound('Age limit not found');

      eventAgeLimit.name = name ?? eventAgeLimit.name;
      eventAgeLimit.description = description ?? eventAgeLimit.description;
      eventAgeLimit.minAge = minAge ?? eventAgeLimit.minAge;
      eventAgeLimit.maxAge = maxAge ?? eventAgeLimit.maxAge;
      if (typeof enabled === 'boolean') {
        eventAgeLimit.enabled = enabled;
      }

      await this.dbConnection.getRepository(EventAgeLimit).save(eventAgeLimit);

      response = responses.data(eventAgeLimit);
    } catch (err) {
      response = responses.badRequest('Error at update event age limit');
    }

    return response;
  }

  public static async getEventAgeLimit(payload: RequestByIdDto): Promise<EventAgeLimitResponse> {
    try {
      const eventAgeLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({
        where: { id: payload.id, deletedAt: null },
      });
      if (!eventAgeLimit) return responses.notFound('Age limit not found!');

      return responses.data(eventAgeLimit);
    } catch (err) {
      return responses.badRequest('Error at get event age limit');
    }
  }

  public static async deleteEventAgeLimit(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      const eventAgeLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({
        where: { id: payload.id, deletedAt: null },
      });
      if (!eventAgeLimit) return responses.notFound('Age limit not found!');
      await this.dbConnection.getRepository(EventAgeLimit).update({ id: payload.id }, { deletedAt: new Date() });
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at delete event age limit');
    }
  }

  public static async listEventAgeLimits(): Promise<EventAgeLimitsResponse> {
    try {
      const eventAgeLimits = await this.dbConnection.getRepository(EventAgeLimit).find();
      return responses.data(eventAgeLimits);
    } catch (err) {
      return responses.badRequest('Error at list event locations');
    }
  }

  public static async publishEvent(eventId: string): Promise<EventResponse> {
    try {
      // this.logger.log(`Attempting to publish event with ID: ${eventId}`);
      const updateResult = await this.dbConnection.getRepository(Event).update(eventId, { isPublished: true });
      // this.logger.log(`Update result: ${JSON.stringify(updateResult)}`);
      // TODO: Add functionality send notifications
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at publish event');
    }
  }

  public static async getUpcomingEvents(): Promise<ListEventsFeedResponse> {
    try {
      const events = await this.dbConnection.getRepository(Event).find({
        where: {
          status: EventStatusEnum.APPROVED_STATUS,
          isPublished: true,
          deletedAt: null,
        },
        order: {
          startDate: 'DESC',
        },
        relations: ['owner', 'admissionType', 'location', 'eventType', 'guests', 'ticketTypes', 'ageLimit'],
      });
      const upcomingEvents = events.filter((event) => formatEventStatus(event) === EventStatus.UPCOMING_STATUS);
      return responses.data(upcomingEvents.map((item) => toEvent(item, null, item.guests.filter((guest) => guest.status === GuestStatus.CONFIRMED).length)));
    } catch (err) {
      return responses.badRequest('Error getting upcoming events.');
    }
  }

  public static async duplicateEvent(payload: RequestByIdDto): Promise<EventResponse> {
    try {
      const eventId = payload.id;
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: eventId, deletedAt: null },
      });
      if (!event) return responses.notFound('Event not found!');
      const status = event.status;
      if (status !== EventStatusEnum.APPROVED_STATUS && status !== EventStatusEnum.PENDING_STATUS) {
        return responses.conflict('The event cannot be duplicated.');
      }
      const newEvent = new Event();
      newEvent.name = event.name;
      newEvent.description = event.description;
      newEvent.enabled = event.enabled;
      newEvent.startDate = event.startDate;
      newEvent.endDate = event.endDate;
      newEvent.rsvpDeadline = event.rsvpDeadline;
      newEvent.limitOnePlus = event.limitOnePlus;
      newEvent.useQr = event.useQr;
      newEvent.isPrivate = event.isPrivate;
      newEvent.capacity = event.capacity;
      newEvent.imageFlyer = event.imageFlyer;
      newEvent.imageCover = event.imageCover;
      newEvent.furtherInstructions = event.furtherInstructions;
      newEvent.showLocation = event.showLocation;
      newEvent.publishDate = event.publishDate;
      newEvent.status = EventStatusEnum.DRAFT_STATUS;
      newEvent.isPublished = false;
      newEvent.owner = event.owner;
      newEvent.location = event.location;
      newEvent.ageLimit = event.ageLimit;
      newEvent.admissionType = event.admissionType;
      newEvent.eventType = event.eventType;
      newEvent.talents = event.talents;
      newEvent.ticketTypes = event.ticketTypes;
      newEvent.collaborators = event.collaborators;
      newEvent.quizQuestions = event.quizQuestions;
      const createdEvent = await this.dbConnection.getRepository(Event).save(newEvent);
      return responses.data(toEvent(createdEvent, null));
    } catch (err) {
      return responses.badRequest('Error at duplicate event');
    }
  }

  public static async publishPendingEvents(): Promise<GenericResponse> {
    try {
      const now = new Date();
      const status = EventStatusEnum.APPROVED_STATUS;
      const eventsPendingPublish = await this.dbConnection.getRepository(Event)
        .createQueryBuilder('event')
        .where('(event.isPublished = :isPublished OR event.isPublished IS NULL)', { isPublished: false })
        .andWhere('event.status = :status', { status })
        .andWhere('event.publishDate IS NOT NULL')
        .andWhere('event.publishDate <= :now', { now })
        .getMany();
      if (eventsPendingPublish.length > 0) {
        await Promise.all(
          eventsPendingPublish.map((event) => {
            this.publishEvent(event.id);
          }),
        );
      }
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at publish pending events');
    }
  }

  public static validateEventUpdate(
    event: Event,
    payload: UpdateEventRequestDto,
  ): {
    validate: boolean;
    message: string | null;
  } {
    if (event.status === EventStatusEnum.APPROVED_STATUS && event.isPublished) {
      if (!payload.status || payload.status === EventStatusEnum.APPROVED_STATUS) {
        return {
          validate: false,
          message: 'The event is APPROVED or event PUBLISHED and cannot be modified unless the status is changed to a different value.',
        };
      }
    }
    if (event.status !== EventStatusEnum.APPROVED_STATUS && payload.status === EventStatusEnum.CANCELLED_STATUS) {
      return { validate: false, message: 'The event cannot be CANCELLED at this time.' };
    }

    const publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
    const startDate = event.startDate ? new Date(event.startDate) : null;

    if (publishDate && startDate && publishDate > startDate) {
      return { validate: false, message: 'Publish date cannot be after the start date.' };
    }

    return { validate: true, message: null };
  }

  public static async manualEventStatusUpdate(payload: ManualEventStatusUpdateRequestDto): Promise<EventResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: payload.eventId, deletedAt: IsNull() },
      });
      if (!event) return responses.notFound('Event not found');
      const status = EventStatus[payload.status as keyof typeof EventStatus];
      if (!status) return responses.badRequest('Invalid status');
      if (formatEventStatus(event) === EventStatus[payload.status as keyof typeof EventStatus]) return responses.conflict('Event is already in the selected status');
      if (payload.status === EventStatus[EventStatus.UPCOMING_STATUS]) {
        event.status = EventStatusEnum.APPROVED_STATUS;
        event.isPublished = true;
      } else if (payload.status === EventStatus[EventStatus.SCHEDULED_STATUS]) {
        event.status = EventStatusEnum.APPROVED_STATUS;
        event.isPublished = false;
      } else {
        event.status = EventStatusEnum[payload.status as keyof typeof EventStatusEnum];
        event.isPublished =
          payload.status !== EventStatus[EventStatus.APPROVED_STATUS] || payload.status !== EventStatus[EventStatus.UPCOMING_STATUS] ? false : event.isPublished;
      }
      await this.dbConnection.getRepository(Event).save(event);
      const updatedEvent = await this.dbConnection.getRepository(Event).findOne({
        where: { id: event.id },
      });
      return responses.data(toEvent(updatedEvent, null));
    } catch (err) {
      return responses.badRequest('Error at manual event status update');
    }
  }

  public static async publishEventById(payload: RequestByIdDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: payload.id, deletedAt: IsNull() },
      });
      if (!event) return responses.notFound('Event not found');
      if (event.status !== EventStatusEnum.APPROVED_STATUS) return responses.conflict('Event must be approved before publishing');
      if (event.isPublished) return responses.conflict('Event is already published');
      await this.publishEvent(event.id);
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at publish event by id');
    }
  }

  public static async generateTicketForGuest(payload: RequestByIdDto): Promise<GenerateTicketForGuestResponse> {
    try {
      const guest = await this.dbConnection.getRepository(Guest).findOne({
        where: { id: payload.id, status: GuestStatus.CONFIRMED },
        relations: { event: true, user: true, ticketType: true },
      });
      if (!guest) return responses.badRequest('Not valid guest, guest must be confirmed');

      let hasTicket = await this.dbConnection.getRepository(Ticket).findOne({ where: { guest: { id: guest.id } } });
      if (!hasTicket) {
        const newTicket = await this.dbConnection.getRepository(Ticket).create({
          ticketType: guest.ticketType,
          guest: { id: guest.id },
          event: { id: guest.event.id },
          user: { id: guest.user.id },
          status: TicketStatusEnum.TICKET_GENERATED,
        });

        await this.dbConnection.getRepository(Ticket).save(newTicket);
        hasTicket = await this.dbConnection.getRepository(Ticket).findOne({ where: { guest: { id: guest.id } } });
      }

      if (guest && guest?.event?.useQr) {
        const tokenPayload = {
          guestId: guest.id,
          eventId: guest.event.id,
          ticket: hasTicket.id,
        };

        const token = ""//await this.jwtService.sign(tokenPayload);
        const qrCode = await QRCode.toDataURL(token);

        return responses.data({
          guestId: guest.id,
          ticketStatus: entityToTicketStatus[TicketStatusEnum.TICKET_GENERATED],
          b64QRCode: qrCode,
          eventQr: guest?.event?.useQr || false,
        });
      }

      return responses.data({
        guestId: guest.id,
        ticketStatus: entityToTicketStatus[TicketStatusEnum.TICKET_GENERATED],
        b64QRCode: 'N/A',
        eventQr: guest?.event?.useQr || false,
      });
    } catch (err) {
      console.error(err);
      return responses.badRequest('Error at generate QR code');
    }
  }

  public static async validateTicketForGuest(payload: ValidateTicketForGuestRequestDto): Promise<GenericResponse> {
    try {
      const decodedToken = {toke:'',ticket:''}//await this.jwtService.verify(payload.ticketToken);
      if (!decodedToken) {
        return responses.badRequest('Invalid ticket token');
      }

      const ticket = await this.dbConnection.getRepository(Ticket).findOne({
        where: {
          id: decodedToken.ticket,
          status: TicketStatusEnum.TICKET_GENERATED,
        },
        relations: ['guest', 'event'],
      });

      if (!ticket) {
        return responses.badRequest('Ticket not found or already used');
      }

      await this.dbConnection.getRepository(Ticket).update({ id: ticket.id }, { status: TicketStatusEnum.TICKET_USED });

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at validate ticket');
    }
  }

  public static async listEventUsedTickets(payload: RequestByIdDto): Promise<ListEventUsedTicketsResponse> {
    try {
      const tickets = await this.dbConnection.getRepository(Ticket).find({
        where: {
          status: TicketStatusEnum.TICKET_USED,
          event: { id: payload.id },
        },
        relations: {
          user: true,
          event: true,
          guest: true,
        },
      });
      return responses.data(
        tickets.map((item) => {
          return toTicketData(item);
        }),
      );
    } catch (err) {
      return responses.badRequest('Error at publish event by id');
    }
  }

  public static async updateTicket(payload: UpdateTicketRequestDto): Promise<GenericResponse> {
    try {
      const findTicket = await this.dbConnection.getRepository(Ticket).findOne({ where: { guest: { id: payload.guestId } } });
      findTicket.status = ticketStatusToEntity[payload.ticketStatus];
      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at publish event by id');
    }
  }

  public static async addEventToFeaturedSection(payload: AddEventToFeaturedSectionDto): Promise<GenericResponse> {
    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: payload.eventId },
        relations: {
          featuredEventSection: true,
        },
      });

      if (!event) return responses.notFound('Event was not found');

      if (!payload.featuredSectionId) {
        event.featuredEventSection = null;
        await this.dbConnection.getRepository(Event).save(event);
      } else {
        const featuredEventSection = false//await this.platformClient.getFeaturedEventSection(payload.featuredSectionId, this.logger);
        if (!featuredEventSection) return responses.notFound('Featured event section was not found');

        //event.featuredEventSection = { id: featuredEventSection.id } as FeaturedEventSection;
        await this.dbConnection.getRepository(Event).save(event);
      }

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at publish event by id');
    }
  }
}
