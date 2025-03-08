import { EventsService } from '../services/events.service';
import { Request, Response } from 'express'
import {
  AddressValidationResponse,
  EventAgeLimitResponse,
  EventAgeLimitsResponse,
  EventLocationResponse,
  EventLocationsResponse,
  EventResponse,
  EVENTS_SERVICE_NAME,
  EventsResponse,
  EventTypeResponse,
  EventTypesResponse,
  GenerateTicketForGuestResponse,
  GenericResponse,
  GetFeaturedEventsResponse,
  ListEventsFeedResponse,
  ListEventStatusResponse,
  ListEventUsedTicketsResponse,
  ListHostEventsResponse,
  PaginatedEventsResponse,
  ToggleGuestCheckStatusResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';

import {
  AddEventToFeaturedSectionDto,
  AddressValidationDto,
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
  CancelEventAndNotifyRequestDto,
  ListHostEventsDto,
  ToggleGuestCheckStatusRequestDto,
} from 'rumor-utils/shared/events/dtos/events.dto';

import { UserAndIdRequestDto, RequestByIdDto } from 'rumor-utils/shared/events/dtos/shared.dto';
import { CreateResponse, GetResponse, UpdateResponse, DeleteResponse } from '../../packages/rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { EventData, EventTypeData } from 'rumor-utils/shared/events/grpc/events/general.pb';
export class EventsController {

  public static listEventStatus = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventStatuses: string[] = await EventsService.listEventStatus();
    const successResponse = new GetResponse(eventStatuses);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static createEventType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateEventTypeRequestDto = req.body;
    const createdEventType: EventTypeData = await EventsService.createEventType(payload);
    const successResponse = new CreateResponse(createdEventType);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //TODO: check where query is used
  public static listEventTypes = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: QueryRequestDto = req.query;
    const eventTypeResponse: EventTypesResponse = await EventsService.listEventTypes(payload);
    const successResponse = new GetResponse(eventTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //TODO: check where query is used
  public static getEventType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const getEventTypeResponse: EventTypeResponse = await EventsService.getEventType(payload);
    const successResponse = new GetResponse(getEventTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //TODO: check where query is used
  public static updateEventType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: UpdateEventTypeRequestDto = { ...req.body, ...req.params }
    const updatedEventTypesData: EventTypeResponse = await EventsService.updateEventType(payload);
    const successResponse = new UpdateResponse();
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //TODO: check where query is used
  public static deleteEventType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const response: string = await EventsService.deleteEventType(payload);
    const successResponse = new DeleteResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static createEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateEventRequestDto = req.body
    // const id = req.params.id;
    const event: EventResponse = await EventsService.createEvent(
      payload
    );
    const successResponse = new CreateResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static listEvents = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: QueryRequestDto = req.query;
    // const id = req.params.id;
    const event: EventResponse | ListEventsFeedResponse = await EventsService.listEvents(
      payload
    );
    const successResponse = new GetResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static getEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    // const { user: userId } = req
    const userId = (req as any).user;
    const { id } = req.params;
    const payload: UserAndIdRequestDto = { id, userId }
    // const id = req.params.id;
    const event: EventData = await EventsService.getEvent(
      payload
    );
    const successResponse = new GetResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static updateEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    req.body.id = id
    const payload: UpdateEventRequestDto = req.body
    const event: EventData = await EventsService.updateEvent(
      payload
    );
    const successResponse = new UpdateResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static deleteEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user;
    const { id } = req.params;
    const payload: UserAndIdRequestDto = { id, userId }
    // const id = req.params.id;
    const event: string = await EventsService.deleteEvent(
      payload
    );

    const successResponse = new DeleteResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static duplicateEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const eventResponse: EventResponse = await EventsService.duplicateEvent(
      payload);
    const successResponse = new CreateResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static validateAddress = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: AddressValidationDto = req.body
    const addressResponse: AddressValidationResponse = await EventsService.validateAddress(
      payload);
    const successResponse = new GetResponse(addressResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getUpcomingEvents = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventsResponse: ListEventsFeedResponse = await EventsService.getUpcomingEvents(
    );
    const successResponse = new GetResponse(eventsResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
  // events location

  public static createEventLocation = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: EventLocationDto = req.body
    const eventLocationResponse: EventLocationResponse = await EventsService.createEventLocation(
      payload
    );
    const successResponse = new CreateResponse(eventLocationResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static updateEventLocation = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: UpdateEventLocationRequestDto = { ...req.body, id }
    const eventLocationResponse: EventLocationResponse = await EventsService.updateEventLocation(
      payload
    );
    const successResponse = new UpdateResponse(eventLocationResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getEventLocation = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const eventLocationResponse: EventLocationResponse = await EventsService.getEventLocation(
      payload
    );
    const successResponse = new GetResponse(eventLocationResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static deleteEventLocation = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const eventLocationResponse: string = await EventsService.deleteEventLocation(
      payload
    );
    const successResponse = new DeleteResponse(eventLocationResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static listEventLocations = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: QueryRequestDto = req.query
    const eventLocationResponse: EventLocationsResponse = await EventsService.listEventLocations(
      payload
    );
    const successResponse = new GetResponse(eventLocationResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static listEventsFeed = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: QueryRequestDto = req.query
    const eventResponse: ListEventsFeedResponse = await EventsService.listEventsFeed(
      payload
    );
    const successResponse = new GetResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getFeaturedEvents = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: QueryRequestDto = req.query
    const eventResponse: GetFeaturedEventsResponse = await EventsService.getFeaturedEvents(
      payload
    );
    const successResponse = new GetResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  // Events age limit
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEventAgeLimit')
  public static createEventAgeLimit = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: EventAgeLimitDto = req.body
    const ageLimitResponse: EventAgeLimitResponse = await EventsService.createEventAgeLimit(
      payload
    );
    const successResponse = new CreateResponse(ageLimitResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
  public static updateEventAgeLimit = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // const payload: UpdateEventAgeLimitRequestDto = {...req.body, id}
    const ageLimitResponse: EventAgeLimitResponse = await EventsService.createEventAgeLimit(
      { ...req.body, id }
    );
    const successResponse = new CreateResponse(ageLimitResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
  public static getEventAgeLimit = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    // const payload: UpdateEventAgeLimitRequestDto = {...req.body, id}
    const ageLimitResponse: EventAgeLimitResponse = await EventsService.getEventAgeLimit(
      payload
    );
    const successResponse = new GetResponse(ageLimitResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
  public static deleteEventAgeLimit = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const response: string = await EventsService.deleteEventAgeLimit(
      payload
    );
    const successResponse = new DeleteResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
  public static listEventAgeLimits = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    // const payload: UpdateEventAgeLimitRequestDto = {...req.body, id}
    const ageLimitResponse: EventAgeLimitsResponse = await EventsService.listEventAgeLimits(

    );
    const successResponse = new GetResponse(ageLimitResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
  public static getPublicEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const ageLimitResponse: EventData = await EventsService.getPublicEvent(
      payload
    );
    const successResponse = new GetResponse(ageLimitResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static manualEventStatusUpdate = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: ManualEventStatusUpdateRequestDto = req.body
    const eventResponse: EventResponse = await EventsService.manualEventStatusUpdate(
      payload
    );
    const successResponse = new UpdateResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static publishEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const eventResponse: string = await EventsService.publishEventById(
      payload
    );
    const successResponse = new UpdateResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static publishPendingEvents = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventResponse: string = await EventsService.publishPendingEvents(
    );
    const successResponse = new UpdateResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )


  public static generateTicketForGuest = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const ticketResponse: GenerateTicketForGuestResponse = await EventsService.generateTicketForGuest(
      payload
    );
    const successResponse = new CreateResponse(ticketResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static validateTicketForGuest = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: ValidateTicketForGuestRequestDto = req.body
    const ticketResponse: string = await EventsService.validateTicketForGuest(
      payload
    );
    const successResponse = new CreateResponse(ticketResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static listEventUsedTickets = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: RequestByIdDto = { id }
    const ticketResponse: ListEventUsedTicketsResponse = await EventsService.listEventUsedTickets(
      payload
    );
    const successResponse = new GetResponse(ticketResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static updateTicket = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: UpdateTicketRequestDto = { id, ...req.body }
    const ticketResponse: string = await EventsService.updateTicket(
      payload
    );
    const successResponse = new UpdateResponse(ticketResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static addEventToFeaturedSection = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payload: AddEventToFeaturedSectionDto = { id, ...req.body }
    const eventResponse: string = await EventsService.addEventToFeaturedSection(
      payload
    );
    const successResponse = new CreateResponse(eventResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public static cancelEventAndNotify = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CancelEventAndNotifyRequestDto = { ...req.params, ...req.body }
    const response: string = await EventsService.cancelEventAndNotify(
      payload
    );
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getEventByInvitedUserId = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { userId, id } = req.params
    const payload: UserAndIdRequestDto = { userId, id }
    const response: EventData = await EventsService.getEventByInvitedUserId(
      payload
    );
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static listHostEvents = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const id = (req as any).user;
    const queryParams = JSON.stringify(req.query)
    const payload: ListHostEventsDto = { userId: id, query: queryParams }
    const response: PaginatedEventsResponse = await EventsService.listHostEvents(
      payload
    );
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static toggleGuestCheckStatus = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { query } = req.params
    const payload: ToggleGuestCheckStatusRequestDto = { id, ...req.body }
    const response: ToggleGuestCheckStatusResponse = await EventsService.toggleGuestCheckStatus(
      payload
    );
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
