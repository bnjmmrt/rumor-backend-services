// import { Controller } from '@nestjs/common';
// import { EventsService } from '../services/events.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import {
//   AddressValidationResponse,
//   EventAgeLimitResponse,
//   EventAgeLimitsResponse,
//   EventLocationResponse,
//   EventLocationsResponse,
//   EventResponse,
//   EVENTS_SERVICE_NAME,
//   EventsResponse,
//   EventTypeResponse,
//   EventTypesResponse,
//   GenerateTicketForGuestResponse,
//   GenericResponse,
//   GetFeaturedEventsResponse,
//   ListEventsFeedResponse,
//   ListEventStatusResponse,
//   ListEventUsedTicketsResponse,
// } from '../grpc/events/events.pb';
// import {
//   AddEventToFeaturedSectionDto,
//   AddressValidationDto,
//   CreateEventRequestDto,
//   CreateEventTypeRequestDto,
//   EventAgeLimitDto,
//   EventLocationDto,
//   ManualEventStatusUpdateRequestDto,
//   QueryRequestDto,
//   UpdateEventAgeLimitRequestDto,
//   UpdateEventLocationRequestDto,
//   UpdateEventRequestDto,
//   UpdateEventTypeRequestDto,
//   UpdateTicketRequestDto,
//   ValidateTicketForGuestRequestDto,
// } from '../dtos/events.dto';
// import { UserAndIdRequestDto, RequestByIdDto } from '../dtos/shared.dto';

// @Controller()
// export class EventsController {
//   constructor(private readonly eventsService: EventsService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventStatus')
//   public async listEventStatus(): Promise<ListEventStatusResponse> {
//     return this.eventsService.listEventStatus();
//   }

//   //Event types Controller
//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEventType')
//   public async createEventType(payload: CreateEventTypeRequestDto): Promise<EventTypeResponse> {
//     return this.eventsService.createEventType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventTypes')
//   public async listEventTypes(payload: QueryRequestDto): Promise<EventTypesResponse> {
//     return this.eventsService.listEventTypes(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventType')
//   public async getEventType(payload: RequestByIdDto): Promise<EventTypeResponse> {
//     return this.eventsService.getEventType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventType')
//   public async updateEventType(payload: UpdateEventTypeRequestDto): Promise<EventTypeResponse> {
//     return this.eventsService.updateEventType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventType')
//   public async deleteEventType(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.eventsService.deleteEventType(payload);
//   }

//   //Event Controller
//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEvent')
//   public async createEvent(payload: CreateEventRequestDto): Promise<EventResponse> {
//     return this.eventsService.createEvent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEvents')
//   public async listEvents(payload: QueryRequestDto): Promise<EventsResponse | ListEventsFeedResponse> {
//     return this.eventsService.listEvents(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetEvent')
//   public async getEvent(payload: UserAndIdRequestDto): Promise<EventResponse> {
//     return this.eventsService.getEvent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEvent')
//   public async updateEvent(payload: UpdateEventRequestDto): Promise<EventResponse> {
//     return this.eventsService.updateEvent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEvent')
//   public async deleteEvent(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.eventsService.deleteEvent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DuplicateEvent')
//   public async duplicateEvent(payload: RequestByIdDto): Promise<EventResponse> {
//     return this.eventsService.duplicateEvent(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ValidateAddress')
//   public async validateAddress(payload: AddressValidationDto): Promise<AddressValidationResponse> {
//     return this.eventsService.validateAddress(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetUpcomingEvents')
//   public async getUpcomingEvents(): Promise<ListEventsFeedResponse> {
//     return this.eventsService.getUpcomingEvents();
//   }

//   // events location

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEventLocation')
//   public async createEventLocation(payload: EventLocationDto): Promise<EventLocationResponse> {
//     return this.eventsService.createEventLocation(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventLocation')
//   public async updateEventLocation(payload: UpdateEventLocationRequestDto): Promise<EventLocationResponse> {
//     return this.eventsService.updateEventLocation(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventLocation')
//   public async getEventLocation(payload: RequestByIdDto): Promise<EventLocationResponse> {
//     return this.eventsService.getEventLocation(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventLocation')
//   public async deleteEventLocation(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.eventsService.deleteEventLocation(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventLocations')
//   public async listEventLocations(payload: QueryRequestDto): Promise<EventLocationsResponse> {
//     return this.eventsService.listEventLocations(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventsFeed')
//   public async listEventsFeed(payload: QueryRequestDto): Promise<ListEventsFeedResponse> {
//     return this.eventsService.listEventsFeed(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetFeaturedEvents')
//   public async getFeaturedEvents(payload: QueryRequestDto): Promise<GetFeaturedEventsResponse> {
//     return this.eventsService.getFeaturedEvents(payload);
//   }

//   // Events age limit

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateEventAgeLimit')
//   public async createEventAgeLimit(payload: EventAgeLimitDto): Promise<EventAgeLimitResponse> {
//     return this.eventsService.createEventAgeLimit(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateEventAgeLimit')
//   public async updateEventAgeLimit(payload: UpdateEventAgeLimitRequestDto): Promise<EventAgeLimitResponse> {
//     return this.eventsService.updateEventAgeLimit(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetEventAgeLimit')
//   public async getEventAgeLimit(payload: RequestByIdDto): Promise<EventAgeLimitResponse> {
//     return this.eventsService.getEventAgeLimit(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteEventAgeLimit')
//   public async deleteEventAgeLimit(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.eventsService.deleteEventAgeLimit(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventAgeLimits')
//   public async listEventAgeLimits(): Promise<EventAgeLimitsResponse> {
//     return this.eventsService.listEventAgeLimits();
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ManualEventStatusUpdate')
//   public async manualEventStatusUpdate(payload: ManualEventStatusUpdateRequestDto): Promise<EventResponse> {
//     return this.eventsService.manualEventStatusUpdate(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'PublishEvent')
//   public async publishEvent(payload: RequestByIdDto): Promise<GenericResponse> {
//     return this.eventsService.publishEventById(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'PublishPendingEvents')
//   public async publishPendingEvents(): Promise<GenericResponse> {
//     return this.eventsService.publishPendingEvents();
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GenerateTicketForGuest')
//   public async generateTicketForGuest(payload: RequestByIdDto): Promise<GenerateTicketForGuestResponse> {
//     return this.eventsService.generateTicketForGuest(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ValidateTicketForGuest')
//   public async validateTicketForGuest(payload: ValidateTicketForGuestRequestDto): Promise<GenericResponse> {
//     return this.eventsService.validateTicketForGuest(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventUsedTickets')
//   public async listEventUsedTickets(payload: RequestByIdDto): Promise<ListEventUsedTicketsResponse> {
//     return this.eventsService.listEventUsedTickets(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateTicket')
//   public async updateTicket(payload: UpdateTicketRequestDto): Promise<GenericResponse> {
//     return this.eventsService.updateTicket(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'AddEventToFeaturedSection')
//   public async addEventToFeaturedSection(payload: AddEventToFeaturedSectionDto): Promise<GenericResponse> {
//     return this.eventsService.addEventToFeaturedSection(payload);
//   }
// }
