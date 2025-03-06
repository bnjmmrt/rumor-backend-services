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
} from 'rumor-utils/shared/events/dtos/events.dto';

import { UserAndIdRequestDto, RequestByIdDto } from 'rumor-utils/shared/events/dtos/shared.dto';
import { CreateResponse, GetResponse, UpdateResponse, DeleteResponse } from '../../packages/rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';
export class EventsController {

  public static listEventStatus = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const eventStatuses: ListEventStatusResponse = await EventsService.listEventStatus();
    const successResponse = new GetResponse(eventStatuses);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static createEventType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateEventTypeRequestDto = req.body;
    const createdEventType: EventTypeResponse = await EventsService.createEventType(payload);
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
    const {id} = req.params;
    const payload: RequestByIdDto = {id}
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
    const {id} = req.params;
    const payload: RequestByIdDto = {id}
    const response: GenericResponse = await EventsService.deleteEventType(payload);
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
    const {id} = req.params;
    const payload: UserAndIdRequestDto = { id, userId }
    // const id = req.params.id;
    const event: EventResponse = await EventsService.getEvent(
      payload
    );
    const successResponse = new GetResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static updateEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: UpdateEventRequestDto = req.body
    // const id = req.params.id;
    const event: EventResponse = await EventsService.updateEvent(
      payload
    );
    const successResponse = new UpdateResponse();
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public static deleteEvent = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user;
    const {id} = req.params;
    const payload: UserAndIdRequestDto = { id, userId }
    // const id = req.params.id;
    const event: GenericResponse = await EventsService.deleteEvent(
      payload
    );

    const successResponse = new DeleteResponse(event);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
 
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DuplicateEvent')
  public async duplicateEvent(payload: RequestByIdDto): Promise<EventResponse> {
    return EventsService.duplicateEvent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ValidateAddress')
  public async validateAddress(payload: AddressValidationDto): Promise<AddressValidationResponse> {
    return EventsService.validateAddress(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetUpcomingEvents')
  public async getUpcomingEvents(): Promise<ListEventsFeedResponse> {
    return EventsService.getUpcomingEvents();
  }

  // events location

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEventLocation')
  public async createEventLocation(payload: EventLocationDto): Promise<EventLocationResponse> {
    return EventsService.createEventLocation(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventLocation')
  public async updateEventLocation(payload: UpdateEventLocationRequestDto): Promise<EventLocationResponse> {
    return EventsService.updateEventLocation(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventLocation')
  public async getEventLocation(payload: RequestByIdDto): Promise<EventLocationResponse> {
    return EventsService.getEventLocation(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventLocation')
  public async deleteEventLocation(payload: RequestByIdDto): Promise<GenericResponse> {
    return EventsService.deleteEventLocation(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventLocations')
  public async listEventLocations(payload: QueryRequestDto): Promise<EventLocationsResponse> {
    return EventsService.listEventLocations(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventsFeed')
  public async listEventsFeed(payload: QueryRequestDto): Promise<ListEventsFeedResponse> {
    return EventsService.listEventsFeed(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetFeaturedEvents')
  public async getFeaturedEvents(payload: QueryRequestDto): Promise<GetFeaturedEventsResponse> {
    return EventsService.getFeaturedEvents(payload);
  }

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
    const {id} = req.params;
    // const payload: UpdateEventAgeLimitRequestDto = {...req.body, id}
    const ageLimitResponse: EventAgeLimitResponse = await EventsService.createEventAgeLimit(
      {...req.body, id}
    );
    const successResponse = new CreateResponse(ageLimitResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  public async updateEventAgeLimit(payload: UpdateEventAgeLimitRequestDto): Promise<EventAgeLimitResponse> {
    return EventsService.updateEventAgeLimit(payload);
  }

    //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
    public static getEventAgeLimit = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
      const {id} = req.params;
      const payload: RequestByIdDto = {id}
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
    const {id} = req.params;
    const payload: RequestByIdDto = {id}
    // const payload: UpdateEventAgeLimitRequestDto = {...req.body, id}
    const response: GenericResponse = await EventsService.deleteEventAgeLimit(
      payload
    );
    const successResponse = new DeleteResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  )

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventAgeLimit')
  public async deleteEventAgeLimit(payload: RequestByIdDto): Promise<GenericResponse> {
    return EventsService.deleteEventAgeLimit(payload);
  }

 //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
 public static listEventAgeLimits = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  const payload: RequestByIdDto = {id}
  // const payload: UpdateEventAgeLimitRequestDto = {...req.body, id}
  const ageLimitResponse: EventAgeLimitsResponse = await EventsService.listEventAgeLimits(
    
  );
  const successResponse = new GetResponse(ageLimitResponse);
  res.status(successResponse.statusCode).json(successResponse);
}
)

  // //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventAgeLimits')
  // public async listEventAgeLimits(): Promise<EventAgeLimitsResponse> {
  //   return EventsService.listEventAgeLimits();
  // }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ManualEventStatusUpdate')
  public async manualEventStatusUpdate(payload: ManualEventStatusUpdateRequestDto): Promise<EventResponse> {
    return EventsService.manualEventStatusUpdate(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'PublishEvent')
  public async publishEvent(payload: RequestByIdDto): Promise<GenericResponse> {
    return EventsService.publishEventById(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'PublishPendingEvents')
  public async publishPendingEvents(): Promise<GenericResponse> {
    return EventsService.publishPendingEvents();
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GenerateTicketForGuest')
  public async generateTicketForGuest(payload: RequestByIdDto): Promise<GenerateTicketForGuestResponse> {
    return EventsService.generateTicketForGuest(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ValidateTicketForGuest')
  public async validateTicketForGuest(payload: ValidateTicketForGuestRequestDto): Promise<GenericResponse> {
    return EventsService.validateTicketForGuest(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventUsedTickets')
  public async listEventUsedTickets(payload: RequestByIdDto): Promise<ListEventUsedTicketsResponse> {
    return EventsService.listEventUsedTickets(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateTicket')
  public async updateTicket(payload: UpdateTicketRequestDto): Promise<GenericResponse> {
    return EventsService.updateTicket(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'AddEventToFeaturedSection')
  public async addEventToFeaturedSection(payload: AddEventToFeaturedSectionDto): Promise<GenericResponse> {
    return EventsService.addEventToFeaturedSection(payload);
  }

  public static CancelEventAndNotify = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CancelEventAndNotifyRequestDto = { ...req.params, ...req.body }
    const response: GenericResponse = await EventsService.cancelEventAndNotify(
      payload
    );
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
