import { TicketTypeService } from '../services/ticket-type.service';
import { TicketTypeResponse, TicketTypesResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { CreateTicketTypeRequestDto, RequestByIdDto, UpdateTicketTypeRequestDto } from 'rumor-utils/shared/events/dtos';

export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CreateTicketType')
  public async createTicketType(payload: CreateTicketTypeRequestDto): Promise<TicketTypeResponse> {
    return TicketTypeService.createTicketType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetTicketType')
  public async getTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
    return TicketTypeService.getTicketType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetTicketTypes')
  public async getTicketTypes(payload: RequestByIdDto): Promise<TicketTypesResponse> {
    return TicketTypeService.getTicketTypes(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateTicketType')
  public async updateTicketType(payload: UpdateTicketTypeRequestDto): Promise<TicketTypeResponse> {
    return TicketTypeService.updateTicketType(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteTicketType')
  public async deleteTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
    return TicketTypeService.deleteTicketType(payload);
  }
}
