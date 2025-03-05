import { StatusCodes } from 'http-status-codes';
import config from '../config';
import { AddressValidationClient } from '@googlemaps/addressvalidation';
import { JWT as GoogleAuthJWT } from 'google-auth-library';
import * as QRCode from 'qrcode';

import {
  AddEventToFeaturedSectionDto,
  CancelEventAndNotifyRequestDto,
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
import { DataSource, ILike, In, IsNull, LessThanOrEqual, MoreThanOrEqual, QueryRunner } from 'typeorm';
import { parse } from 'qs';
import { hasPagination } from 'rumor-utils/shared/events/dtos/shared.dto';
import { RequestByIdDto, UserAndIdRequestDto } from 'rumor-utils/shared/events/dtos/shared.dto';
import { normalizeCatalogName } from '../common/helpers';
import { EventLocation, AdmissionType, EventAgeLimit, Guest, User, EventTypes, Event, Ticket, FeaturedEventSection, EventSignupForms, Talent, TicketType, Collaborator, QuizQuestion } from '../../packages/rumor-utils/shared/entities';
import { GoogleAddressClient } from '../utils/google';
import { formatEventStatus, toEvent } from 'rumor-utils/shared/events/mappers/events.mapper';
import { getCityNameFromAddressComponents, hasEventDateOrLocationChanged, isValidEventStatus, validateEventDates } from '../utils/event.utils';
import { EventLocationInterface, EventStatusEnum, GuestStatus, TicketStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import { haversineDistance } from 'rumor-utils/utils/utils';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { collaboratorRoleToEntity } from 'rumor-utils/shared/events/mappers/collaborator.mapper';
// import { JwtService } from '@nestjs/jwt';
import { generateToken, verifyToken } from 'rumor-utils/jwt';
import { EventStatus, FeaturedEvent } from 'rumor-utils/shared/events/grpc/events/general.pb';
import { entityToTicketStatus, ticketStatusToEntity, toTicketData } from 'rumor-utils/shared/events/mappers/guest.mapper';
import database from '../database'
import { EventData } from '../../packages/rumor-utils/shared/events/grpc/events/general.pb';
import { CreateCollaboratorDto, CreateTalentRequestDto, CreateTicketTypeRequestDto, UpdateCollaboratorDto, UpdateTalentRequestDto, UpdateTicketTypeRequestDto } from 'packages/rumor-utils/shared/events/dtos';
import { CreateQuizQuestionRequestDto, UpdateQuizQuestionRequestDto } from '../../packages/rumor-utils/shared/events/dtos/quiz-question.dto';
import { RoleData } from '../../packages/rumor-utils/shared/users/grpc/auth/role.pb';
import { UserWithRoles } from '../../packages/rumor-utils/shared/users/grpc/auth/auth.pb';
import { createCollaboratorEntity } from '../utils/collaborator.utils';
import { GuestService } from './guest.service';
import { Role } from '../../packages/rumor-utils/shared/users/entities';

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
  public static googleAddressClient = new GoogleAddressClient()

  public static googleAuthClient = new GoogleAuthJWT();
  public static dataSource: DataSource;
  constructor() {
    const GOOGLE_MAPS_API_KEY = config.get('GOOGLE_MAPS_API_KEY');
    EventsService.googleAuthClient.fromAPIKey(GOOGLE_MAPS_API_KEY);
  }

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
    const parsedQuery = parse(payload.query);
    const pagination = hasPagination(parsedQuery)
      ? {
        take: parseInt(parsedQuery.take),
        skip: parseInt(parsedQuery.skip),
      }
      : {};
    const [eventTypes, total] = await this.dbConnection.getRepository(Event).findAndCount({ ...pagination });
    return responses.data({
      items: eventTypes,
      total,
    });
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
  }

  public static async createEvent(payload: CreateEventRequestDto): Promise<EventResponse> {
    if (!payload.ownerId) return responses.badRequest('OwnerId is required');
    // Validate dates
    // Validate event dates
    const dateValidationResult = validateEventDates(payload);
    if (dateValidationResult.error) {
      return responses.conflict(dateValidationResult.response);
    }
    if (!payload.ticketTypes?.length) {
      throw new Error('Ticket type is required');
    }
    if (!payload.eventLocation?.placeId) {
      throw new Error('Event Location is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Create event object
      const event = await this.createEventObject(payload);

      // Save location if provided
      if (payload.eventLocation) {
        event.location = await this.saveEventLocation(payload.eventLocation, queryRunner);
      }

      // Save event within the transaction
      const createdEvent = await queryRunner.manager.save(event);

      // Save associated data (ticket types, talents, collaborators, quiz questions)
      await this.saveAssociatedData(payload, createdEvent.id, queryRunner);

      // Commit transaction
      await queryRunner.commitTransaction();
      const fullEvent = await this.fetchFullEvent(createdEvent.id);
      if (!fullEvent) {
        throw new Error('Failed to get created event.');
      }
      // Fetch and return the created event with all relations
      //send email to admin for new event creation
      await this.sendEmailToAdminOnCreateEvent(fullEvent.data);
      return fullEvent;
    } catch (error) {
      // Rollback transaction in case of an error
      await queryRunner.rollbackTransaction();
      // this.logger.error(`Error occurred while creating event: ${error?.message}`);
      return responses.badRequest(`Error occurred while creating event: ${error?.message}`);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }


  private  static async sendEmailToAdminOnCreateEvent(event: EventData) {
    const { id: eventId, owner } = event;
    const redirectPath = `events/event-details?id=${eventId}`;
    const mailServiceResponse = await serviceMesh.notificationService().sendEmailFromTemplate(
      [
        {
          key: 'host',
          value: owner?.firstName && owner?.lastName ? `${owner.firstName} ${owner.lastName}` : 'Host',
        },
        {
          key: 'event_url',
          value: config.get('RUMOR_WEBSITE_ADMIN') + `${redirectPath}`,
        },
      ],
      'Super Admin - New Event Submission',
      ['admin@therumor.com'],
      null,
      // this.logger,
    );
    if (!mailServiceResponse) {
      // this.logger.error('Unable to send mail to admin for new event creation.');
    }
  }

  private static async createEventObject(payload: CreateEventRequestDto): Promise<Event> {
    const event = new Event();
    if (payload.status === EventStatusEnum.DRAFT_STATUS) {
      payload.status = EventStatusEnum.DRAFT_STATUS;
    } else {
      payload.status = EventStatusEnum.PENDING_STATUS;
    }
    event.owner = { id: payload.ownerId } as User;
    event.name = payload.name;
    event.description = payload.description;
    event.enabled = payload.enabled;
    event.startDate = new Date(payload.startDate);
    event.endDate = new Date(payload.endDate);
    event.publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
    event.status = EventStatusEnum[payload.status as keyof typeof EventStatusEnum];
    event.timeZone = payload.timeZone || 'UTC';
    event.limitOnePlus = payload.limitOnePlus;
    event.useQr = payload.useQr;
    event.isPrivate = payload.isPrivate;
    event.capacity = payload.capacity;
    event.imageFlyer = payload.imageFlyer;
    event.imageCover = payload.imageCover;
    event.furtherInstructions = payload.furtherInstructions;
    event.showLocation = payload.showLocation;

    if (payload.eventTypeId) {
      event.eventType = await this.dbConnection.getRepository(EventTypes).findOne({ where: { id: payload.eventTypeId } });
    }
    if (payload.ageLimitId) {
      event.ageLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({ where: { id: payload.ageLimitId } });
    }
    if (payload.admissionTypeId) {
      event.admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.admissionTypeId } });
    }
    return event;
  }

  private static async saveAssociatedData(payload: CreateEventRequestDto, eventId: string, queryRunner: QueryRunner): Promise<void> {
    if (payload.ticketTypes && payload.ticketTypes.length > 0) {
      await this.insertTicketTypesForEvent(payload.ticketTypes, eventId, queryRunner);
    }
    if (payload.talents && payload.talents.length > 0) {
      await this.insertTalentsWithTransaction(payload.talents, queryRunner, eventId);
    }
    if (payload.collaborators && payload.collaborators.length > 0) {
      await this.insertCollaboratorsWithTransaction(payload.collaborators, queryRunner, eventId);
    }
    if (payload.quizQuestions && payload.quizQuestions.length > 0) {
      await this.insertQuizQuestionsWithTransaction(payload.quizQuestions, queryRunner, eventId);
    }
  }

  private static async fetchFullEvent(eventId: string): Promise<EventResponse> {
    const fullEvent = await this.getEventWithAllRelations(eventId);
    return responses.data(toEvent(fullEvent, null));
  }

  private static async getEventWithAllRelations(eventId: string): Promise<Event> {
    const event = await this.dbConnection.getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.owner', 'owner')
      .leftJoinAndSelect('event.ageLimit', 'ageLimit')
      .leftJoinAndSelect('event.admissionType', 'admissionType')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .leftJoinAndSelect('event.talents', 'talents')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('event.collaborators', 'collaborators')
      .leftJoinAndSelect('collaborators.user', 'user')
      .leftJoinAndSelect('event.featuredEventSection', 'featuredEventSection')
      .leftJoinAndSelect('collaborators.role', 'role')
      .leftJoinAndSelect('collaborators.ticketType', 'collaboratorTicketType')
      .leftJoinAndSelect('event.quizQuestions', 'quizQuestions')
      .where('event.id = :id', { id: eventId })
      .getOne();

    return event;
  }

  /**
   * Saves the event location to the database within the given transaction.
   *
   * @param eventLocationPayload - The event location details from the payload.
   * @param queryRunner - The query runner to handle the transaction.
   * @returns The saved EventLocation entity.
   */
  private static async saveEventLocation(eventLocationPayload: EventLocationDto, queryRunner: QueryRunner): Promise<EventLocation> {
    // Create a new EventLocation entity from the payload
    const eventLocation = this.dbConnection.getRepository(EventLocation).create({
      location: eventLocationPayload.location,
      googlePlaceId: eventLocationPayload.placeId,
      city: eventLocationPayload.city,
      latitude: eventLocationPayload.latitude,
      longitude: eventLocationPayload.longitude,
    });
    // Save the location within the transaction
    const savedLocation = await queryRunner.manager.save(eventLocation);
    return savedLocation; // Return the saved location
  }

  /**
   * Bulk insert ticket types for a given event in a single operation.
   *
   * @param ticketTypes - The list of ticket types to be inserted
   * @param eventId - The ID of the event to associate the ticket types with
   * @param queryRunner - The query runner to execute the bulk insert in a transaction
   */
  private static async insertTicketTypesForEvent(ticketTypes: CreateTicketTypeRequestDto[], eventId: string, queryRunner: QueryRunner): Promise<void> {
    try {
      // Normalize and prepare ticket type names
      const ticketNames = ticketTypes.map((ticket) => normalizeCatalogName(ticket.name));

      // Fetch existing ticket types for the event
      const existingTicketTypes = await queryRunner.manager.find(TicketType, {
        where: { name: In(ticketNames), event: { id: eventId } },
      });

      // Convert existing ticket types to a Set for quick lookup
      const existingTicketNames = new Set(existingTicketTypes.map((ticket) => normalizeCatalogName(ticket.name)));
      const ticketTypeInsertData = ticketTypes.map((ticketTypePayload) => {
        const name = normalizeCatalogName(ticketTypePayload.name);
        if (existingTicketNames.has(name)) {
          throw new Error(`Ticket type with name "${ticketTypePayload.name}" already exists for this event.`);
        }
        return {
          name,
          description: ticketTypePayload.description,
          capacity: ticketTypePayload.capacity,
          event: { id: eventId } as Event,
        };
      });
      // Bulk insert ticket types using query runner
      await queryRunner.manager.createQueryBuilder().insert().into(TicketType).values(ticketTypeInsertData).execute();
    } catch (error) {
      // this.logger.error('Error while inserting ticket types for event', error?.message);
      throw new Error(`Error inserting ticket types. ${error?.message}`);
    }
  }

  /**
   * Bulk inserts talents associated with an event under a transaction.
   * Rolls back the transaction if any error occurs.
   *
   * @param talentsDto - Array of CreateTalentRequestDto objects.
   * @param queryRunner - The query runner instance to manage the transaction.
   * @param eventId - The ID of the event to associate the talents with.
   * @throws {Error} If any error occurs during the process, the transaction is rolled back.
   */
  public static async insertTalentsWithTransaction(talentsDto: CreateTalentRequestDto[], queryRunner: QueryRunner, eventId: string): Promise<void> {
    try {
      // Check if talents array is empty; skip processing if it is.
      if (!talentsDto || talentsDto.length === 0) {
        // this.logger.log('No talents to insert.');
        return;
      }

      // Prepare talent entities for bulk insertion.
      const talents = talentsDto.map((talentDto) => {
        const talent = new Talent();
        talent.name = talentDto.name;
        talent.description = talentDto.description;
        talent.imageKeyUrl = talentDto.imageKeyUrl;
        talent.contact = talentDto.contact;
        talent.socialNetwork = talentDto.socialNetwork;
        talent.event = { id: eventId } as Event; // Associate the talent with the event.
        return talent;
      });
      // Use the query runner to insert all talents in bulk.
      await queryRunner.manager.save(Talent, talents);
    } catch (error) {
      // this.logger.error(`Error inserting talents: ${error.message}`);
      // Rollback will be handled at the main transaction level.
      throw new Error(`Error inserting talents: ${error.message}`);
    }
  }

  /**
   * Bulk inserts collaborators associated with an event under a transaction.
   * Rolls back the transaction if any error occurs.
   *
   * @param collaboratorsDto - Array of CreateCollaboratorDto objects.
   * @param queryRunner - The query runner instance to manage the transaction.
   * @param eventId - The ID of the event to associate the collaborators with.
   * @throws {Error} If any error occurs during the process, the transaction is rolled back.
   */
  public static async insertCollaboratorsWithTransaction(
    collaboratorsDto: CreateCollaboratorDto[] | UpdateCollaboratorDto[],
    queryRunner: QueryRunner,
    eventId: string,
  ): Promise<void> {
    try {
      // Check if collaborators array is empty; skip processing if it is.
      if (!collaboratorsDto || collaboratorsDto.length === 0) {
        return;
      }

      // Verify that the event exists.
      const event = await queryRunner.manager.findOne(Event, { where: { id: eventId } });
      if (!event) {
        throw new Error(`Event with ID ${eventId} does not exist.`);
      }
      // Fetch all required roles in a single call BEFORE the loop
      const roleNames = collaboratorsDto.map((c) => collaboratorRoleToEntity[c.role]).filter(Boolean);
      if (roleNames.length === 0) {
        throw new Error('No valid roles found for collaborators.');
      }
      const uniqueRoleNames = [...new Set(roleNames)]; // Remove duplicates
      const roles = await Promise.all(uniqueRoleNames.map((role) => serviceMesh.userService().getRoleByName(role)));
      const validRoles = roles.filter((role) => role !== null);
      if (validRoles.length === 0) {
        throw new Error('Failed to fetch collaborator roles.');
      }
      // Convert roles array to a Map for quick lookups
      const roleMap: any = new Map(validRoles.map((role : any) => [role.name, role]));

      // Fetch existing collaborators once to avoid duplicate inserts
      const existingCollaborators = await queryRunner.manager.find(Collaborator, {
        where: { event: { id: eventId } },
        relations: ['ticketType', 'user'],
      });

      // Create a Set to track existing (userId, eventId, ticketTypeId) combinations
      const existingCollaboratorSet = new Set(existingCollaborators.map((c) => `${c.user.id}-${eventId}-${c.ticketType?.id ?? 'NULL'}`));

      const collaboratorsToInsert = [];
      for (const collaboratorDto of collaboratorsDto) {
        // Ensure the user exists or create a user with the collaborator role.
        let user : any = await serviceMesh.userService().getUserWithRolesByEmail(collaboratorDto.email);
        const roleEntity = roleMap.get(collaboratorRoleToEntity[collaboratorDto.role]);
        if (!roleEntity) {
          throw new Error(`Failed to get collaborator role data for ${collaboratorDto.role}.`);
        }
        // Check if the role should be a collaborator's role only
        if (!user) {
          await serviceMesh.userService().createHostCollaborator(collaboratorDto.email, undefined, undefined, undefined, roleEntity?.name);
          user  = await serviceMesh.userService().getUserWithRolesByEmail(collaboratorDto.email);
        }
        // Assign role to user if not already assigned.
        const hasRole = user.roles.some((role) => role.name === roleEntity.name);
        if (!hasRole) {
          await serviceMesh.userService().assignRoleToUser(user.id, roleEntity.name);
        }

        const tickets = collaboratorDto.tickets;

        // Process tickets for the collaborator.
        for (const ticket of tickets) {
          //TODO:add validations for duplicate here, if there is duplicate collaborator with same ticket type, user id and event id
          //should only update the collaborator for new tickets since it is creating new collaborator
          if (['update', 'delete'].includes(ticket.action)) {
            continue;
          }
          // Normalize the ticket name and find the corresponding TicketType entity.
          const ticketName = normalizeCatalogName(ticket.name);
          const ticketType = await queryRunner.manager.findOne(TicketType, {
            where: {
              name: ticketName,
              event: { id: eventId },
              deletedAt: IsNull(),
            },
          });

          if (!ticketType) {
            throw new Error(`Ticket type with name "${ticket.name}" not found for event ID ${eventId}.`);
          }

          const key = `${user.id}-${eventId}-${ticketType.id}`;
          if (!existingCollaboratorSet.has(key)) {
            existingCollaboratorSet.add(key);
            collaboratorsToInsert.push(createCollaboratorEntity(user.id, event, roleEntity, collaboratorDto, ticketType, ticket));
          }
        }

        //TODO: if no tickets the also it should do entry with null tickettype id
        // If no tickets, add entry with NULL ticketType
        if (!tickets || tickets.length === 0) {
          const key = `${user.id}-${eventId}-NULL`;
          if (!existingCollaboratorSet.has(key)) {
            existingCollaboratorSet.add(key);
            collaboratorsToInsert.push(createCollaboratorEntity(user.id, event, roleEntity, collaboratorDto, null));
          }
          continue;
        }
      }
      // Bulk save collaborators.
      if (collaboratorsToInsert.length > 0) {
        await queryRunner.manager.save(Collaborator, collaboratorsToInsert);
      }
    } catch (error) {
      // this.logger.error(`Error inserting collaborators: `);
      throw new Error(`Failed to insert collaborators. ${error.message}`);
    }
  }


  /**
   * Bulk inserts quiz questions associated with an event under a transaction.
   * Rolls back the transaction if any error occurs.
   *
   * @param quizQuestionsDto - Array of CreateQuizQuestionRequestDto objects.
   * @param queryRunner - The query runner instance to manage the transaction.
   * @param eventId - The ID of the event to associate the quiz questions with.
   * @throws {Error} If any error occurs during the process, the transaction is rolled back.
   */
  public static async insertQuizQuestionsWithTransaction(quizQuestionsDto: CreateQuizQuestionRequestDto[], queryRunner: QueryRunner, eventId: string): Promise<void> {
    try {
      // Check if quiz questions array is empty; skip processing if it is.
      if (!quizQuestionsDto || quizQuestionsDto.length === 0) {
        // this.logger.log('No quiz questions to insert.');
        return;
      }

      // Verify that the event exists.
      const event = await queryRunner.manager.findOne(Event, { where: { id: eventId } });
      if (!event) {
        throw new Error(`Event with ID ${eventId} does not exist.`);
      }

      // Prepare quiz question entities for bulk insertion.
      const quizQuestions = quizQuestionsDto.map((quizQuestionDto) => {
        const quizQuestion = new QuizQuestion();
        quizQuestion.question = quizQuestionDto.question;
        quizQuestion.required = quizQuestionDto.required ?? false; // Default to false if not provided.
        quizQuestion.order = quizQuestionDto.order;
        quizQuestion.event = event; // Associate the quiz question with the event.
        return quizQuestion;
      });

      // Use the query runner to insert all quiz questions in bulk.
      await queryRunner.manager.save(QuizQuestion, quizQuestions);
    } catch (error) {
      // this.logger.error(`Error inserting quiz questions: ${error.message}`);
      // Rollback will be handled at the main transaction level.
      throw new Error('Failed to insert quiz questions.');
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


  private static async updateAssociatedData(payload: UpdateEventRequestDto, event: Event, queryRunner: QueryRunner): Promise<void> {
    if (payload.ticketTypes && payload.ticketTypes.length > 0) {
      await this.updateTicketTypesForEvent(payload.ticketTypes, event, queryRunner);
    }
    if (payload.talents && payload.talents.length > 0) {
      await this.updateTalentsWithTransaction(event, payload.talents, queryRunner);
    }
    if (payload.collaborators && payload.collaborators.length > 0) {
      await this.updateCollaboratorsWithTransaction(payload.collaborators, event, queryRunner);
    }
    if (payload.quizQuestions && payload.quizQuestions.length > 0) {
      await this.updateQuizQuestionsWithTransaction(payload.quizQuestions, queryRunner, event);
    }
  }

  public static async updateTalentsWithTransaction(event: Event, talentsDto: UpdateTalentRequestDto[], queryRunner: QueryRunner): Promise<void> {
    try {
      const eventId = event.id;
      if (!talentsDto || talentsDto.length === 0) {
        // this.logger.log('No talents to process.');
        return;
      }

      const newTalents: UpdateTalentRequestDto[] = [];
      const updatePromises = [];
      const deleteIds: string[] = [];
      const skippedUpdates: UpdateTalentRequestDto[] = [];

      // Single loop to categorize actions
      for (const talent of talentsDto) {
        if (talent.action === 'create') {
          newTalents.push(talent);
        } else if (talent.action === 'update' && talent.id) {
          if (!talent.name?.trim()) {
            skippedUpdates.push(talent);
          } else {
            updatePromises.push(
              queryRunner.manager.update(
                Talent,
                { id: talent.id, event: { id: eventId } },
                {
                  name: talent.name,
                  description: talent.description,
                  imageKeyUrl: talent.imageKeyUrl,
                  contact: talent.contact,
                  socialNetwork: talent.socialNetwork,
                },
              ),
            );
          }
        } else if (talent.action === 'delete' && talent.id) {
          deleteIds.push(talent.id);
        }
      }

      // Step 1: Bulk Insert
      if (newTalents.length > 0) {
        await this.insertTalentsWithTransaction(newTalents, queryRunner, eventId);
      }

      // Step 2: Bulk Update
      if (skippedUpdates.length > 0) {
        // this.logger.warn(`Skipped updating ${skippedUpdates.length} talents due to empty names:`, skippedUpdates);
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      // Step 3: Bulk Delete
      if (deleteIds.length > 0) {
        await queryRunner.manager.delete(Talent, { id: In(deleteIds), event: { id: eventId } });
      }
    } catch (error) {
      // this.logger.error(`Error updating talents: ${error.message}`);
      throw new Error(`Error updating talents: ${error.message}`);
    }
  }
  private static async updateCollaboratorsWithTransaction(collaborators: UpdateCollaboratorDto[], event: Event, queryRunner: QueryRunner): Promise<void> {
    try {
      const eventId = event.id;
      if (!collaborators || collaborators.length === 0) {
        // this.logger.log('No collaborators to process.');
        return;
      }

      // Step 1: Validate that there are no duplicate emails in create/update actions
      await this.validateCollaboratorEmails(collaborators);

      // Step 2: Process existing collaborators (update/delete)
      await this.processExistingCollaborators(collaborators, event, queryRunner);

      // Step 3: Process new collaborators
      const newCollaborators = collaborators.filter((c) => c.action === 'create');
      if (newCollaborators.length > 0) {
        await this.insertCollaboratorsWithTransaction(newCollaborators, queryRunner, eventId);
      }
    } catch (error) {
      throw new Error(`Failed to update collaborators.  ${error.message}`);
    }
  }

  /**
   * Ensures no duplicate emails exist in 'create' or 'update' actions.
   */
  private static validateCollaboratorEmails(collaborators: UpdateCollaboratorDto[]): void {
    const emailSet = new Set<string>();

    for (const collaborator of collaborators) {
      if (collaborator.action === 'create' || collaborator.action === 'update') {
        if (emailSet.has(collaborator.email)) {
          throw new Error(`Duplicate email detected: ${collaborator.email}`);
        }
        emailSet.add(collaborator.email);
      }
    }
  }

  /**
   * Processes updates and deletions for existing collaborators.
   */
  private static async processExistingCollaborators(collaborators: UpdateCollaboratorDto[], event: Event, queryRunner: QueryRunner): Promise<void> {
    const eventId = event.id;
    //  Get TicketType IDs that are being deleted (avoid duplicate deletions)
    const deleteIdsSet = new Set(event.ticketTypes.filter((t: UpdateTicketTypeRequestDto) => t.action === 'delete').map((t) => t.id));
    // Handle collaborator deletions
    const deleteUserIds = collaborators.filter((c) => c.action === 'delete').map((c) => c.id);
    if (deleteUserIds.length > 0) {
      await queryRunner.manager.delete(Collaborator, {
        user: { id: In(deleteUserIds) },
        event: { id: eventId },
      });
    }

    // const rolesTofind = collaborators.map(c => roleMap.get(collaboratorRoleToEntity[c.role]).name);
    const users = await (await Promise.all(collaborators.map((c) => serviceMesh.userService().getUserWithRolesByEmail(c.email)))).filter((node) => node);

    const roleNames = collaborators.map((c) => collaboratorRoleToEntity[c.role]).filter(Boolean);
    if (roleNames.length === 0) {
      throw new Error('No valid roles found for collaborators.');
    }
    const uniqueRoleNames = [...new Set(roleNames)]; // Remove duplicates

    // Fetch users from Auth Service in one batch
    // const users = await this.authClient.getUsersByEmails(emails);
    const userMap = new Map(users.map((user : any) => [user?.email, user]));
    // const roles = await Promise.all(uniqueRoleNames.map(role => this.authClient.getRoleByName(role)));
    // Fetch roles one by one from Auth Service
    const roles = await Promise.all(uniqueRoleNames.map((role) => serviceMesh.userService().getRoleByName(role)));
    const validRoles = roles.filter((role) => role !== null);
    const roleMap : any  = new Map(validRoles.map((role: any) => [role.name, role]));
    // Fetch existing collaborators for the event (including roles)
    const existingCollaboratorsData = await queryRunner.manager.find(Collaborator, {
      where: { event: { id: eventId } },
      relations: ['ticketType', 'user', 'role'],
    });
    const existingCollaboratorMap = new Map(existingCollaboratorsData.map((c) => [c.user?.id, c]));

    // Process collaborator updates
    const updateCollaborators = [];
    const collaboratorsToInsert = [];
    for (const collaborator of collaborators.filter((c) => c.action === 'update')) {
      if (!collaborator.id) {
        throw new Error(`Collaborator ID is required for update action.`);
      }
      let user : any = userMap.get(collaborator.email.trim());
      let isEmailUpdate = false;
      const existingCollaborator = existingCollaboratorMap.get(collaborator.id);
      isEmailUpdate = existingCollaborator && existingCollaborator.user.email.trim().toLowerCase() !== collaborator.email.trim().toLowerCase();

      const currentRoleId = existingCollaborator?.role?.id ?? null;
      if (!user || isEmailUpdate) {
        // Remove old collaborator records and insert a new one
        await queryRunner.manager.delete(Collaborator, { user: { id: collaborator.id }, event: { id: eventId } });
        const roleEntity : any = roleMap.get(collaboratorRoleToEntity[collaborator.role]);
        if (!roleEntity) {
          throw new Error(`Failed to get collaborator role data for ${collaborator.role}.`);
        }
        if (!user) {
          await serviceMesh.userService().createHostCollaborator(collaborator.email, undefined, undefined, undefined, roleEntity?.name);
        }
        user = await serviceMesh.userService().getUserWithRolesByEmail(collaborator.email);
        userMap.set(collaborator.email, user);

        //update collaboartor
        const tickets = collaborator.tickets;
        // Process tickets for the collaborator.
        for (const ticket of tickets) {
          //should not insert for deleted tickets
          if (ticket.action === 'delete') {
            continue;
          }
          // Normalize the ticket name and find the corresponding TicketType entity.
          const ticketName = normalizeCatalogName(ticket.name);

          const ticketType = await queryRunner.manager.findOne(TicketType, {
            where: {
              name: ticketName,
              event: { id: eventId },
              deletedAt: IsNull(),
            },
          });
          if (!ticketType) {
            throw new Error(`Ticket type with name "${ticket.name}" not found for event ID ${eventId}.`);
          }
          collaboratorsToInsert.push(createCollaboratorEntity(user.id, event, roleEntity, collaborator, ticketType, ticket));
        }
        //TODO: if no tickets the also it should do entry with null tickettype id
      }
      const roleEntity : any= roleMap.get(collaboratorRoleToEntity[collaborator.role]); //TODO: this is duplicate line

      if (!roleEntity) {
        throw new Error(`Failed to get collaborator role data for ${collaborator.role}.`);
      }
      if (!roleEntity) throw new Error(`Failed to get collaborator role data for ${collaborator.role}.`);
      //  Check if role has changed
      const newRoleId = roleEntity.id;
      const roleChanged = currentRoleId !== newRoleId;
      if (roleChanged) {
        await queryRunner.manager.update(Collaborator, { user: { id: user.id }, event: { id: eventId } }, { role: roleEntity });
      }

      // Assign role to user if not already assigned.
      const hasRole = user.roles.some((role) => role.name === roleEntity.name);

      if (!hasRole) {
        await serviceMesh.userService().assignRoleToUser(user.id, roleEntity?.name);
        updateCollaborators.push({ user, collaborator });
      }

      const collaboratorIds = new Set(updateCollaborators.map((c) => c.collaborator.id));
      let isTicketUpdate = false;
      for (const ticket of collaborator.tickets) {
        if ((ticket.action === 'delete' || ticket.action === 'update' || ticket.action === 'create') && !isEmailUpdate) {
          isTicketUpdate = true;
        }
      }
      //updating permissions and basic details all the time
      await this.updateCollaboratorBasicInfo(eventId, user.id, collaborator, queryRunner);
      await this.updateCollaboratorPermissions(eventId, user.id, collaborator, queryRunner);
      if (isTicketUpdate && !collaboratorIds.has(collaborator.id)) {
        updateCollaborators.push({ user, collaborator, roleEntity });
      }

      // Bulk save updated collaborator(when email updates) collaborators.
      if (collaboratorsToInsert.length > 0) {
        await queryRunner.manager.save(Collaborator, collaboratorsToInsert);
      }

      // Fetch required TicketTypes in bulk
      const ticketNames = updateCollaborators.flatMap(({ collaborator }) =>
        collaborator.tickets.filter((ticket) => ticket.action === 'create').map((ticket) => normalizeCatalogName(ticket.name)),
      );
      const ticketTypes = await queryRunner.manager.find(TicketType, {
        where: { name: In(ticketNames), event: { id: eventId } },
      });

      const ticketTypeMap = new Map(ticketTypes.map((ticket) => [normalizeCatalogName(ticket.name), ticket]));
      // Process ticket updates
      const collaboratorsToSave = [];

      // Fetch existing collaborators for the given event and user IDs
      const existingCollaborators = await queryRunner.manager.find(Collaborator, {
        where: {
          user: { id: In(updateCollaborators.map((c) => c.user.id)) },
          event: { id: eventId },
        },
        relations: ['ticketType', 'user'],
      });

      // Convert existing collaborators to a Set for quick lookup
      const existingCollaboratorSet = new Set(existingCollaborators.map((collab) => `${collab.user?.id}-${collab.ticketType?.id || 'NULL'}-${eventId}`));
      for (const { user, collaborator } of updateCollaborators) {
        for (const ticket of collaborator.tickets) {
          if (ticket.action === 'delete') {
            if (deleteIdsSet.has(ticket.id)) continue; //  Skip if already deleted via TicketType
            if (!ticket.id) {
              throw new Error(`Ticket ID is required for delete action.`);
            }
            await queryRunner.manager.delete(Collaborator, {
              user: { id: user.id },
              event: { id: eventId },
              ticketType: { id: ticket.id },
            });
          } else if (ticket.action === 'update') {
            if (!ticket.id) {
              throw new Error(`Ticket ID is required for update action.`);
            }
            await queryRunner.manager.update(
              Collaborator,
              { user: { id: user.id }, event: { id: eventId }, ticketType: { id: ticket.id }, role: { id: roleEntity.id } },
              { limitInvitationsNumber: ticket.limitInvitationsNumber },
            );
          } else if (ticket.action === 'create') {
            const ticketName = normalizeCatalogName(ticket.name);
            const ticketType = ticketTypeMap.get(ticketName);
            if (!ticketType) throw new Error(`Ticket type ${ticket.name} not found.`);
            // Check if a collaborator already exists
            const collaboratorKey = `${user.id}-${ticketType?.id}-${eventId}`;

            if (!existingCollaboratorSet.has(collaboratorKey)) {
              collaboratorsToSave.push(createCollaboratorEntity(user.id, event, roleEntity, collaborator, ticketType, ticket));
              existingCollaboratorSet.add(collaboratorKey);
            }
          }
        }
      }
      if (collaboratorsToInsert.length > 0) {
        await queryRunner.manager.save(Collaborator, collaboratorsToInsert);
      }
      if (collaboratorsToSave.length > 0) {
        await queryRunner.manager.save(Collaborator, collaboratorsToSave);
      }
    }
    if (updateCollaborators.length) {
      await this.ensureCollaboratorEntries(updateCollaborators, event, queryRunner, roleMap);
    }
  }
  private static async updateCollaboratorBasicInfo(eventId: string, userId: string, collaboratorDto: UpdateCollaboratorDto, queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.update(
      Collaborator,
      { event: { id: eventId }, user: { id: userId } },
      {
        displayName: collaboratorDto.displayName,
        displayNameListEvent: collaboratorDto.displayNameListEvent,
        limitInvitations: collaboratorDto.limitInvitations,
      },
    );
  }

  private static async updateCollaboratorPermissions(eventId: string, userId: string, collaboratorDto: UpdateCollaboratorDto, queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.update(
      Collaborator,
      { event: { id: eventId }, user: { id: userId } },
      {
        editEventDetailsSettings: collaboratorDto.editEventDetailsSettings,
        inviteGuestsToEvent: collaboratorDto.inviteGuestsToEvent,
        addGuestsToDrafts: collaboratorDto.addGuestsToDrafts,
        chatWithAllGuests: collaboratorDto.chatWithAllGuests,
        chatWithGuestsByCollaborator: collaboratorDto.chatWithGuestsByCollaborator,
        viewFullGuestList: collaboratorDto.viewFullGuestList,
        manageInAppRsvpRequests: collaboratorDto.manageInAppRsvpRequests,
        manageDedicatedSignUpForm: collaboratorDto.manageDedicatedSignUpForm,
        postAnnouncementsToAllGuests: collaboratorDto.postAnnouncementsToAllGuests,
        postAnnouncementsByCollaborator: collaboratorDto.postAnnouncementsByCollaborator,
        checkInGuests: collaboratorDto.checkInGuests,
        generateEventReports: collaboratorDto.generateEventReports,
      },
    );
  }

  /**
   * Ensures that every collaborator for an event has at least one entry, even if all ticket types were removed.
   */
  private static async ensureCollaboratorEntries(
    updateCollaborators: { user: User; collaborator: UpdateCollaboratorDto }[],
    event: Event,
    queryRunner: QueryRunner,
    roleMap: Map<string, RoleData>,
  ): Promise<void> {
    const collaboratorsToInsert = [];
    const eventId = event.id;
    // Fetch existing collaborators for the given event and user IDs
    const existingCollaborators = await queryRunner.manager.find(Collaborator, {
      where: {
        user: { id: In(updateCollaborators.map((c) => c.user.id)) },
        event: { id: eventId },
      },
      relations: ['ticketType', 'user'],
    });
    // Create a set of existing user IDs for quick lookup
    const existingUserIds = new Set(existingCollaborators.map((collab) => collab.user.id));

    // Find collaborators that are in updateCollaborators but not in existingCollaborators
    const collabWhichIsNotInExistingCollab = [];
    for (const { user, collaborator } of updateCollaborators) {
      if (!existingUserIds.has(user.id)) {
        collabWhichIsNotInExistingCollab.push({ user, collaborator });
      }
    }
    // Convert existing collaborators to a Set for quick lookup
    const existingCollaboratorSet = new Set(existingCollaborators.map((collab) => `${collab.user?.id}-${eventId}-${collab.ticketType?.id || 'NULL'}`));
    for (const { user, collaborator } of collabWhichIsNotInExistingCollab) {
      const roleEntity = roleMap.get(collaboratorRoleToEntity[collaborator.role]);
      if (!roleEntity) {
        throw new Error(`Failed to get collaborator role data for ${collaborator.role}.`);
      }
      if (!roleEntity) throw new Error(`Failed to get collaborator role data for ${collaborator.role}.`);

      const key = `${user.id}-${eventId}-NULL`;
      if (!existingCollaboratorSet.has(key)) {
        existingCollaboratorSet.add(key);
        collaboratorsToInsert.push(createCollaboratorEntity(user.id, event, roleEntity, collaborator, null));
      }
    }
    if (collaboratorsToInsert.length > 0) {
      await queryRunner.manager.save(Collaborator, collaboratorsToInsert);
    }
  }

  private static async updateTicketTypesForEvent(ticketTypesDto: UpdateTicketTypeRequestDto[], event: Event, queryRunner: QueryRunner): Promise<void> {
    try {
      if (!ticketTypesDto || ticketTypesDto.length === 0) {
        // this.logger.log('No ticket types to process.');
        return;
      }
      const eventId = event.id;
      let createTickets: CreateTicketTypeRequestDto[] = [];
      const updateTickets: { id: string; data: Partial<UpdateTicketTypeRequestDto> }[] = [];
      const deleteIds: string[] = [];
      const reassignMap: { oldId: string; newId?: string; newName?: string }[] = [];
      // Collect IDs of tickets that are being deleted
      const deleteIdsSet = new Set(ticketTypesDto.filter((t) => t.action === 'delete').map((t) => t.id));

      //  FIRST: Process Reassignments & Updates Before Creating New Tickets
      for (const ticket of ticketTypesDto) {
        // starts here: it is checkeing dependency a-> b-> c  (only 1 level delete dependency check)
        //TODO: this dependency check logic can be improve by getting all reassigned tickets and then check if any one of the reassigned ticket is also set to delete if so then throw error.
        if (ticket.action === 'delete' && ticket.reassignTo?.id) {
          // Check if the reassigned ticket is also being deleted
          if (deleteIdsSet.has(ticket.reassignTo.id)) {
            const reassignedTicket = ticketTypesDto.find((t) => t.id === ticket.reassignTo.id);

            // If the reassigned ticket is also being deleted but has no further reassignment, it's invalid
            if (!reassignedTicket?.reassignTo?.id && !reassignedTicket?.reassignTo?.name) {
              throw new Error(
                `Invalid reassignment: Ticket "${ticket.name}" is being deleted and reassigned to "${ticket.reassignTo?.name || 'other ticket'}", which is also being deleted.`,
              );
            }
          }
        }
        /**ends here */

        if (ticket.action === 'update') {
          if (!ticket.id) {
            throw new Error(`Ticket with name "${ticket.name}" is missing an ID for update.`);
          }
          updateTickets.push({
            id: ticket.id,
            data: {
              name: normalizeCatalogName(ticket.name),
              description: ticket.description,
              capacity: ticket.capacity,
            },
          });
        } else if (ticket.action === 'delete') {
          if (!ticket.id) {
            throw new Error(`Ticket with name "${ticket.name}" is missing an ID for deletion.`);
          }
          if (ticket.reassignTo) {
            if (ticket.reassignTo.id) {
              //  Case 1: Reassign to an existing ticket type
              reassignMap.push({ oldId: ticket.id, newId: ticket.reassignTo.id });
            } else if (ticket.reassignTo.name) {
              //  Case 2: Reassign to a new ticket (instead of creating, update old one)
              reassignMap.push({ oldId: ticket.id, newName: ticket.reassignTo.name });
              continue; //  No need to delete; just rename
            }
          }
          deleteIds.push(ticket.id);
        } else if (ticket.action === 'create') {
          createTickets.push(ticket); // Hold for later after handling reassignment
        }
      }
      //check if deleteIds contains the guest associated with it (it should not delete without reassigning)
      const hasAssignedGuests = await GuestService.hasGuestsAssignedToTicketTypes(deleteIds, eventId);   //TODO: check this after taking pull from dev-temp
      if (hasAssignedGuests) {
        throw new Error('Cannot delete ticket types as they are assigned to guests.');
      }
      //ends here
      //  STEP 2: Handle Reassignments Before Deleting Anything
      const reassignedNames = new Set<string>(); // Track reassigned ticket names

      for (const reassignment of reassignMap) {
        if (reassignment.newId) {
          //  Case 1: Reassigning to an existing ticket type
          await Promise.all([
            queryRunner.manager
              .createQueryBuilder()
              .update(Guest)
              .set({ ticketType: { id: reassignment.newId } })
              .where({ ticketType: { id: reassignment.oldId }, event: { id: eventId } })
              .execute(),

            queryRunner.manager
              .createQueryBuilder()
              .update(Ticket)
              .set({ ticketType: { id: reassignment.newId } })
              .where({ ticketType: { id: reassignment.oldId }, event: { id: eventId } })
              .execute(),

            queryRunner.manager
              .createQueryBuilder()
              .update(Collaborator)
              .set({ ticketType: { id: reassignment.newId } })
              .where({ ticketType: { id: reassignment.oldId }, event: { id: eventId } })
              .execute(),
          ]);
        } else if (reassignment.newName) {
          //  Case 2: Rename name and other data of old ticket instead of deleting it

          // Find the original ticket being reassigned
          const originalTicket = ticketTypesDto.find((ticket) => ticket.id === reassignment.oldId);

          const matchingTicket = ticketTypesDto.find((ticket) => ticket.name === reassignment.newName && ticket.action === 'create');
          if (matchingTicket) {
            await queryRunner.manager.update(
              TicketType,
              { id: reassignment.oldId, event: { id: eventId } },
              {
                name: normalizeCatalogName(matchingTicket.name),
                description: matchingTicket.description,
                capacity: matchingTicket.capacity,
              },
            );
            // Track this reassigned ticket so it's NOT inserted again
            reassignedNames.add(matchingTicket.name);
          } else {
            // ERROR: No matching "create" ticket for reassignment
            const availableCreateNames = ticketTypesDto
              .filter((ticket) => ticket.action === 'create')
              .map((ticket) => `"${ticket.name}"`)
              .join(', ');

            throw new Error(
              `Invalid reassignment: Ticket "${originalTicket?.name || 'Unknown Ticket'}" was set to be reassigned to "${reassignment.newName}", 
    but no matching ticket with this name was found.
    Available tickets are: [${availableCreateNames}]`,
            );
          }
        }
      }

      //  STEP 3: Only now delete tickets that were not reassigned
      //TODO: also for tickets that are not reassigned but have dependencies for guests we can add a check here rather than deleting directly
      if (deleteIds.length > 0) {
        // Delete Collaborators associated with the TicketType first
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(Collaborator)
          .where('ticket_type_id IN (:...deleteIds)', { deleteIds })
          .andWhere('event_id = :eventId', { eventId })
          .execute();

        // Now safely delete the TicketTypes
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(TicketType)
          .where('id IN (:...deleteIds)', { deleteIds })
          .andWhere('event_id = :eventId', { eventId })
          .execute();
      }

      //  STEP 4: Finally, insert NEW ticket types (only those not involved in reassignment)
      //  Remove reassigned tickets from createTickets to prevent duplicate insertion
      createTickets = createTickets.filter((ticket) => !reassignedNames.has(ticket.name));

      if (createTickets.length > 0) {
        await this.insertTicketTypesForEvent(createTickets, eventId, queryRunner);
      }

      //  STEP 5: Bulk update for normal updates
      if (updateTickets.length > 0) {
        await Promise.all(updateTickets.map((ticket) => queryRunner.manager.update(TicketType, { id: ticket.id, event: { id: eventId } }, ticket.data)));
      }
    } catch (error) {
      // this.logger.error(`Error updating ticket types: ${error.message}`);
      throw new Error(`Failed to update ticket types., ${error.message}`);
    }
  }

  public static async updateQuizQuestionsWithTransaction(quizQuestionsDto: UpdateQuizQuestionRequestDto[], queryRunner: QueryRunner, event: Event): Promise<void> {
    const eventId = event.id;
    try {
      if (!quizQuestionsDto || quizQuestionsDto.length === 0) {
        // this.logger.log('No quiz questions to process.');
        return;
      }

      const createQuestions: UpdateQuizQuestionRequestDto[] = [];
      const updateQuestions: { id: string; data: UpdateQuizQuestionRequestDto }[] = [];
      const deleteIds: string[] = [];

      // Single Loop to Categorize Actions
      for (const quiz of quizQuestionsDto) {
        if (quiz.action === 'create') {
          createQuestions.push(quiz);
        } else if (quiz.action === 'update' && quiz.id) {
          updateQuestions.push({
            id: quiz.id,
            data: {
              question: quiz.question,
              required: quiz.required ?? false,
              order: quiz.order,
            },
          });
        } else if (quiz.action === 'delete' && quiz.id) {
          deleteIds.push(quiz.id);
        }
      }

      // Reuse existing insert function for bulk creation
      if (createQuestions.length > 0) {
        await this.insertQuizQuestionsWithTransaction(createQuestions, queryRunner, eventId);
      }

      // Bulk Update (Parallel Execution)
      if (updateQuestions.length > 0) {
        await Promise.all(
          updateQuestions.map((q) =>
            queryRunner.manager.update(
              QuizQuestion,
              { id: q.id, event: { id: eventId } }, // Ensuring event ID matches
              q.data,
            ),
          ),
        );
      }

      // Bulk Delete (Only If IDs Exist)
      if (deleteIds.length > 0) {
        await queryRunner.manager.delete(QuizQuestion, { id: In(deleteIds), event: { id: eventId } });
      }
    } catch (error) {
      // this.logger.error(`Error updating quiz questions: ${error.message}`);
      throw new Error('Failed to update quiz questions.');
    }
  }


  public static async updateEvent(payload: UpdateEventRequestDto): Promise<EventResponse> {
    const eventId = payload.id;
    if (!eventId) return responses.badRequest('Event ID is required');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await this.dbConnection.getRepository(Event).findOne({
        where: { id: payload.id, deletedAt: IsNull() },
        relations: ['owner', 'ageLimit', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions'],
      });

      /**date validations */
      if (!payload.startDate) {
        payload.startDate = event.startDate.toISOString();
      }
      if (!payload.endDate) {
        payload.endDate = event.endDate.toISOString();
      }
      // if (event.isPublished && payload.publishDate !== event.publishDate?.toISOString()) {
      //   throw new Error('Event is already published, publish date cannot be changed');
      // }
      //TODO:also handle cases for rsvp deadline if it is in scope

      const dateValidationResult = validateEventDates(payload);
      if (dateValidationResult.error) {
        return responses.conflict(dateValidationResult.response);
      }
      /**date validations ends here */

      if (!event) return responses.notFound('Item of Event not found');
      const eventStatusFromClient = EventStatusEnum[payload.status as keyof typeof EventStatusEnum];
      const eventCurrentStatus = event.status;

      // 2️ Only update fields present in payload
      if (payload.name) {
        event.name = payload.name;
      }
      if (payload.description) {
        event.description = payload.description;
      }
      if (payload.enabled !== undefined) {
        event.enabled = payload.enabled;
      }
      if (payload.startDate) {
        event.startDate = new Date(payload.startDate);
      }
      if (payload.endDate) {
        event.endDate = new Date(payload.endDate);
      }
      if (event.publishDate != undefined || event.publishDate !== null) {
        event.publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
      }
      if (payload.timeZone) {
        event.timeZone = payload.timeZone;
      }
      if (payload.limitOnePlus !== undefined) {
        event.limitOnePlus = payload.limitOnePlus;
      }
      if (payload.useQr !== undefined) {
        event.useQr = payload.useQr;
      }
      if (payload.isPrivate !== undefined) {
        event.isPrivate = payload.isPrivate;
      }
      if (payload.capacity) {
        event.capacity = payload.capacity;
      }
      if (payload.imageFlyer) {
        event.imageFlyer = payload.imageFlyer;
      }
      if (payload.imageCover) {
        event.imageCover = payload.imageCover;
      }
      if (payload.furtherInstructions) {
        event.furtherInstructions = payload.furtherInstructions;
      }
      if (payload.showLocation !== undefined) {
        event.showLocation = payload.showLocation;
      }
      // 3 Update Relations if Sent in Payload
      if (payload.eventTypeId) {
        const eventType = await this.dbConnection.getRepository(EventTypes).findOne({
          where: { id: payload.eventTypeId },
        });
        if (eventType) event.eventType = eventType;
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
      //update location chnages to db
      const existingLocation = event.location;
      if (payload.eventLocation) {
        if (
          !payload.eventLocation.location ||
          !payload.eventLocation.placeId ||
          !payload.eventLocation.city ||
          !payload.eventLocation.latitude ||
          !payload.eventLocation.longitude
        ) {
          throw new Error('Invalid location data');
        }
        // Update existing location
        existingLocation.location = payload.eventLocation.location;
        existingLocation.googlePlaceId = payload.eventLocation.placeId;
        existingLocation.city = payload.eventLocation.city;
        existingLocation.latitude = payload.eventLocation.latitude;
        existingLocation.longitude = payload.eventLocation.longitude;
        await queryRunner.manager.save(existingLocation);
      }

      /**event status
       * If user provide status in payload then we need to update the status of event
       * case1: if event status is Draft_status and payload status is also Draft_status   -> no need to change event status
       * case 2: if event status was in draft and payload status is in PENDING_status -> means event is submit for approval
       */
      if (eventCurrentStatus === EventStatusEnum.DRAFT_STATUS && eventStatusFromClient === EventStatusEnum.PENDING_STATUS) {
        event.status = EventStatusEnum.PENDING_STATUS;
      }
      //ends here

      // 4️ Save updated event
      await queryRunner.manager.save(event);

      // Save associated data (ticket types, talents, collaborators, quiz questions)
      await this.updateAssociatedData(payload, event, queryRunner);
      // Detect changes before updating the event
      let eventDateOrLocationComparisionResponse = { changed: false };
      if (eventCurrentStatus === EventStatusEnum.APPROVED_STATUS) {
        eventDateOrLocationComparisionResponse = hasEventDateOrLocationChanged(payload, event);
      }

      //ends here
      await queryRunner.commitTransaction();
      /**
       * only if event is approved (upcoming -> (prepublish and publish))
       * send email notification if date, time, location is updated
       * end email only after successful commit & only if relevant details changed
       */
      if (eventDateOrLocationComparisionResponse.changed && eventCurrentStatus === EventStatusEnum.APPROVED_STATUS) {
        try {
          const guestStatuses: GuestStatus[] = [GuestStatus.APPLIED, GuestStatus.CONFIRMED, GuestStatus.REVIEW, GuestStatus.DECLINED, GuestStatus.INVITED];
          await this.notifyGuestsOnDateOrLocationChange({ eventPayload: payload, eventId, guestStatuses });
        } catch (emailError) {
          // this.logger.warn(`Failed to send update email: ${emailError.message}`);
          // Email failure does NOT rollback the DB update
        }
      }
      /**ends here */
      const updatedEvent = await this.dbConnection.getRepository(Event).findOne({
        where: { id: event.id },
        relations: ['owner', 'ageLimit', 'admissionType', 'location', 'eventType', 'talents', 'ticketTypes', 'collaborators', 'quizQuestions'],
      });
      return responses.data(toEvent(updatedEvent, null));
    } catch (error) {
      // Rollback transaction in case of an error
      await queryRunner.rollbackTransaction();
      // this.logger.error(`Error occurred while updating event: ${error?.message}`);
      return responses.badRequest(`Error occurred while updating event: ${error?.message}`);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Sends notifications (email or SMS) to guests based on their available contact details.
   * If email exists, send an email; otherwise, send an SMS notification.
   * @param eventId - The event ID.
   * @param statuses - List of guest statuses to filter.
   * @returns Promise resolving when notifications are sent.
   */
  private static async notifyGuestsOnDateOrLocationChange({
    eventPayload,
    eventId,
    guestStatuses,
  }: {
    eventPayload: UpdateEventRequestDto;
    eventId: string;
    guestStatuses: GuestStatus[];
  }): Promise<void> {
    try {
      if (!guestStatuses.length) {
        // this.logger.warn('No statuses provided for guest filtering.');
        return;
      }
      const guests: Guest[] = await GuestService.fetchGuestsByStatuses(eventId, guestStatuses);
      if (!guests.length) {
        // this.logger.warn(`No guests found for event ${eventId} with statuses ${guestStatuses.join(', ')}`);
        return;
      }

      // Process notifications in parallel
      const notificationPromises = guests.map(async (guest) => {
        const guestName = guest.user?.firstName || 'Guest';
        const eventName = eventPayload.name || guest.event?.name || 'Event';
        const eventStartDate = eventPayload.startDate || guest.event?.startDate || 'TBD';
        const eventLocation =
          eventPayload?.eventLocation?.location && eventPayload?.eventLocation?.city
            ? `${eventPayload.eventLocation.location}, ${eventPayload.eventLocation.city}`
            : 'TBD';
        const message = `Hi ${guestName}, the details for ${eventName} have changed. It will now take place on ${eventStartDate} at ${eventLocation}. Please check for more details.`;

        try {
          if (guest.user?.email) {
            // TO DO: Change email and sms template
            const mailServiceResponse =  await serviceMesh.notificationService().sendEmailFromTemplate(
              [
                {
                  key: 'custom_message',
                  value: message,
                },
                {
                  key: 'event_name',
                  value: eventName,
                },
                {
                  key: 'image_url',
                  value: guest.event.imageFlyer,
                },
                {
                  key: 'time',
                  value: eventStartDate,
                },
                {
                  key: 'location',
                  value: eventLocation,
                },
              ],
              'Event Info Updated',
              [guest.user.email],
              null,
              // this.logger,
            );

            if (!mailServiceResponse) {
              // this.logger.warn(`Failed to send mail for event date/location to ${guestName}`);
            }
          } else if (guest.user?.phoneNumber) {
            // Send SMS notification
            const success =  await serviceMesh.notificationService().sendTextMessage(guest.user.phoneNumber, message);

            if (!success) {
              // this.logger.warn(`Failed to send SMS  for event date/location to guest ${guestName}`);
            }
          } else {
            // Log if no contact details exist
            // this.logger.warn(`No contact details available for ${guestName}, skipping notification for event date/location .`);
          }
        } catch (error) {
          // this.logger.error(`Error sending notification to guest ${guest.id} for event date/location :`, error);
        }
      });
      await Promise.allSettled(notificationPromises);
      // this.logger.log(`Notifications sent for event ${eventId}`);
    } catch (error) {
      // this.logger.error('Error while notifying guests', error);
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
   
      const eventAgeLimit = await this.dbConnection.getRepository(EventAgeLimit).findOne({
        where: { id: payload.id, deletedAt: null },
      });
      if (!eventAgeLimit) return responses.notFound('Age limit not found!');

      return responses.data(eventAgeLimit);
  
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

        const token = generateToken(tokenPayload)//this.jwtService.sign(tokenPayload);
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
      const decodedToken = await verifyToken(payload.ticketToken);
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
        const featuredEventSection = //await serviceMesh.getFeaturedEventSection(config.get('API_BASE_URL'),payload.featuredSectionId);
          //if (!featuredEventSection) return responses.notFound('Featured event section was not found');

          //event.featuredEventSection = { id: featuredEventSection.id } as FeaturedEventSection;
          await this.dbConnection.getRepository(Event).save(event);
      }

      return responses.ok;
    } catch (err) {
      return responses.badRequest('Error at publish event by id');
    }
  }

  /**
* Cancels an event and notifies all relevant users via email or SMS.
*
* Steps:
* 1. Fetch event details along with its owner and collaborators.
* 2. Validate that the event exists and is in the approved state.
* 3. Ensure that the requestor is the event owner.
* 4. Collect unique collaborators and fetch guests with specific statuses.
* 5. If no guests or collaborators exist, cancel the event immediately.
* 6. Notify all relevant users via email or SMS.
* 7. If all notification attempts fail, do not update the event status.
* 8. Commit the transaction if at least one notification is successful.
*/
  public static async cancelEventAndNotify(payload: CancelEventAndNotifyRequestDto): Promise<GenericResponse> {
    const queryRunner: QueryRunner = database.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const eventId = payload.eventId;
      // Step 1: Fetch Event
      const event = await this.dbConnection.getRepository(Event)
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.owner', 'owner')
        .leftJoinAndSelect('event.collaborators', 'collaborators')
        .leftJoinAndSelect('collaborators.user', 'user')
        .leftJoinAndSelect('event.location', 'location')
        .where('event.id = :id', { id: eventId })
        .getOne();

      if (!event) {
        throw new Error('Event not found');
      }
      if (event.status !== EventStatusEnum.APPROVED_STATUS) {
        throw new Error('It is not approved event.');
      }

      if (event.owner.id !== payload.ownerId) {
        throw new Error('cannot cancel the event, The user is not the owner of the event');
      }
      // Step 2: Collect unique collaborators
      const uniqueCollaborator = Object.values(
        event.collaborators.reduce(
          (acc, collaborator) => {
            const user = collaborator.user;
            if (user && !acc[user.id]) {
              acc[user.id] = {
                user: {
                  email: user.email,
                  phoneNumber: user.phoneNumber,
                  firstName: user.firstName,
                },
              };
            }
            return acc;
          },
          {} as Record<string, { user: { email: string; phoneNumber: string; firstName: string } }>,
        ),
      );
      // Step 3: Fetch guests with specified statuses

      const guestStatuses: GuestStatus[] = [GuestStatus.INVITED, GuestStatus.CONFIRMED, GuestStatus.APPLIED];
      //using query to find guests
      const guests = await this.dbConnection.getRepository(Guest)
        .createQueryBuilder('guest')
        .leftJoinAndSelect('guest.user', 'user')
        .leftJoinAndSelect('guest.event', 'event')
        .select(['guest.id', 'user.email', 'user.phoneNumber', 'user.firstName', 'event.name', 'event.startDate', 'event.endDate', 'event.location'])
        .where({ event: { id: eventId } })
        .andWhere('guest.status IN (:...guestStatuses)', { guestStatuses })
        .getMany();

      const guestsAndCollaborators = [...uniqueCollaborator, ...guests];
      const eventName = event?.name || 'Event';
      // Step 4: If no users found, cancel event immediately
      if (guestsAndCollaborators.length === 0) {
        event.status = EventStatusEnum.CANCELLED_STATUS;
        await queryRunner.manager.save(event);
        // update signup form to make form unpublished 
        await this.makeEventSignupFormUnpublished(eventId)
        //ends here 
        await queryRunner.commitTransaction();
        return responses.ok;
      }
      let notificationSuccess = false;
      // Step 5: Process notifications in parallel
      const notificationPromises = guestsAndCollaborators.map(async (guest) => {
        const guestName = guest.user?.firstName || 'Guest';

        const mobileNotificationMessage = `Hi ${guestName},\n${eventName} has been canceled.`;
        const message = payload.customMessage;
        try {
          if (guest.user?.email) {
            // Send email notification
            let mailServiceResponse = await serviceMesh.notificationService().sendEmailFromTemplate([
              {
                key: 'first_name',
                value: guestName,
              },
              {
                key: 'event_name',
                value: eventName,
              },
              {
                key: 'custom_message',
                value: message,
              },
              {
                key: 'image_url',
                value: event.imageFlyer,
              },
              {
                key: 'time',
                value: event.startDate,
              },
              {
                key: 'location',
                value: `${event.location.location}, ${event.location.city}`,
              },
              {
                key: 'host_name',
                value: event.owner?.additionalHostInformation?.companyName || 'Host',
              },
            ],
              'Event Cancelation Notification',
              [guest.user.email],
              null,)
            if (mailServiceResponse) {
              notificationSuccess = true;
            }
          } else if (guest.user?.phoneNumber) {
            // Send SMS notification
            const success = await serviceMesh.notificationService().sendTextMessage(guest.user.phoneNumber, `${mobileNotificationMessage} \n${message}`);
            if (success) {
              notificationSuccess = true;
            }
          } else {
            // Log if no contact details exist
            // this.logger.warn(`No contact details available for ${guestName || 'guest'}, skipping notification for event.`);
          }
        }
        catch (error) {
          // this.logger.error(`Error sending notification to ${guestName || 'guest'} for event:`, error);
        }
      });
      // Step 6: Commit Transaction if Everything is Successful
      event.status = EventStatusEnum.CANCELLED_STATUS;
      await queryRunner.manager.save(event);
      // update signup form to make form unpublished 
      await this.makeEventSignupFormUnpublished(eventId)
      //ends here 
      await queryRunner.commitTransaction();

      //step 7: resolve notification promices
      //TODO: in separate ticket need to handle If mail sent fails then we need to implement notification fn with scheduler, that will take care of resend.
      let resolvedPromices = await Promise.allSettled(notificationPromises);

      if (!notificationSuccess) {
        // await queryRunner.rollbackTransaction();
        // throw new Error('Failed to notify all users. Event cancellation aborted.');
      }
      return responses.ok;
    } catch (error) {
      // Rollback transaction on failure
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to cancel event: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  public static async makeEventSignupFormUnpublished(eventId: string): Promise<any> {
    return await this.dbConnection.getRepository(EventSignupForms)
      .update(
        { event: { id: eventId } },
        { isPublished: false }
      );
  }
}
