import { EventsService } from '../services/events.service';

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
} from 'rumor-utils/shared/events/dtos/events.dto';

import { UserAndIdRequestDto, RequestByIdDto } from 'rumor-utils/shared/events/dtos/shared.dto';
export class EventsController {

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventStatus')
  public async listEventStatus(): Promise<ListEventStatusResponse> {
    return EventsService.listEventStatus();
  }

  //Event types Controller
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEventType')
  public async createEventType(payload: CreateEventTypeRequestDto): Promise<EventTypeResponse> {
    return EventsService.createEventType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventTypes')
  public async listEventTypes(payload: QueryRequestDto): Promise<void> {
    return EventsService.listEventTypes(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventType')
  public async getEventType(payload: RequestByIdDto): Promise<EventTypeResponse> {
    return EventsService.getEventType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventType')
  public async updateEventType(payload: UpdateEventTypeRequestDto): Promise<EventTypeResponse> {
    return EventsService.updateEventType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventType')
  public async deleteEventType(payload: RequestByIdDto): Promise<GenericResponse> {
    return EventsService.deleteEventType(payload);
  }

  //Event Controller
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
  public async createEvent(payload: CreateEventRequestDto): Promise<void> {
    return EventsService.createEvent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEvents')
  public async listEvents(payload: QueryRequestDto): Promise<EventsResponse | ListEventsFeedResponse> {
    return EventsService.listEvents(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetEvent')
  public async getEvent(payload: UserAndIdRequestDto): Promise<EventResponse> {
    return EventsService.getEvent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEvent')
  public async updateEvent(payload: UpdateEventRequestDto): Promise<void> {
    return EventsService.updateEvent(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEvent')
  public async deleteEvent(payload: RequestByIdDto): Promise<GenericResponse> {
    return EventsService.deleteEvent(payload);
  }

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
  public async createEventAgeLimit(payload: EventAgeLimitDto): Promise<EventAgeLimitResponse> {
    return EventsService.createEventAgeLimit(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
  public async updateEventAgeLimit(payload: UpdateEventAgeLimitRequestDto): Promise<EventAgeLimitResponse> {
    return EventsService.updateEventAgeLimit(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventAgeLimit')
  public async getEventAgeLimit(payload: RequestByIdDto): Promise<EventAgeLimitResponse> {
    return EventsService.getEventAgeLimit(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventAgeLimit')
  public async deleteEventAgeLimit(payload: RequestByIdDto): Promise<GenericResponse> {
    return EventsService.deleteEventAgeLimit(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventAgeLimits')
  public async listEventAgeLimits(): Promise<EventAgeLimitsResponse> {
    return EventsService.listEventAgeLimits();
  }

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
}
