// import { Controller } from '@nestjs/common';
// import { TicketTypeService } from '../services/ticket-type.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import { EVENTS_SERVICE_NAME, TicketTypeResponse, TicketTypesResponse } from '../grpc/events/events.pb';
// import { CreateTicketTypeRequestDto, RequestByIdDto, UpdateTicketTypeRequestDto } from '../dtos';

// @Controller()
// export class TicketTypeController {
//   constructor(private readonly ticketTypeService: TicketTypeService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CreateTicketType')
//   public async createTicketType(payload: CreateTicketTypeRequestDto): Promise<TicketTypeResponse> {
//     return this.ticketTypeService.createTicketType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetTicketType')
//   public async getTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
//     return this.ticketTypeService.getTicketType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetTicketTypes')
//   public async getTicketTypes(payload: RequestByIdDto): Promise<TicketTypesResponse> {
//     return this.ticketTypeService.getTicketTypes(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateTicketType')
//   public async updateTicketType(payload: UpdateTicketTypeRequestDto): Promise<TicketTypeResponse> {
//     return this.ticketTypeService.updateTicketType(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteTicketType')
//   public async deleteTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
//     return this.ticketTypeService.deleteTicketType(payload);
//   }
// }
