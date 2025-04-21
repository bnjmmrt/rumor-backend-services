import {
  CreateTicketTypeRequestDto,
  RequestByIdDto,
  UpdateTicketTypeRequestDto,
} from 'rumor-utils/shared/events/dtos';
import {
  TicketTypesResponse,
  TicketTypeResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';
import { TicketType } from 'rumor-utils/shared/events/entities/ticket-type.entity';
import { IsNull } from 'typeorm';
import { responses } from '../common/responses';
import { normalizeCatalogName } from '../common/helpers';
import { Event, Guest } from 'rumor-utils/shared/events/entities';
import database from '../database';
import { BadRequestError, NotFoundError } from 'rumor-utils/errors';
import { TicketBreakdownResponse } from 'packages/rumor-utils/shared/events/grpc/events/general.pb';

export class TicketTypeService {
  public static dbConnection = database;

  public static async createTicketType(
    payload: CreateTicketTypeRequestDto,
  ): Promise<TicketTypeResponse> {
    try {
      const name = payload.name.trim();
      const existingTicketType = await this.dbConnection.getRepository(TicketType).findOne({
        where: {
          name,
          deletedAt: IsNull(),
          event: { id: payload.eventId },
        },
      });
      if (existingTicketType)
        return responses.conflict('Ticket type with the same name already exists');
      const ticketType = new TicketType();
      ticketType.name = name;
      ticketType.description = payload.description;
      ticketType.capacity = payload.capacity;

      if (payload.eventId) {
        const event = await this.dbConnection
          .getRepository(Event)
          .findOne({ where: { id: payload.eventId } });
        if (event) ticketType.event = event;
      }

      const created = await this.dbConnection.getRepository(TicketType).save(ticketType);

      return responses.data(created);
    } catch (err) {
      return responses.badRequest('Error creating a new ticket type');
    }
  }

  public static async getTicketType(payload: RequestByIdDto): Promise<TicketType> {
    const ticketType = await this.dbConnection.getRepository(TicketType).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!ticketType) {
      throw new NotFoundError('Ticket type not found');
    }
    return ticketType;
  }

  public static async getTicketTypes(payload: RequestByIdDto): Promise<TicketType[]> {
    const eventId = payload?.id;
    if (!eventId) throw new BadRequestError('eventId param is a required value');
    const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestError('Event with given Id was not found');
    const ticketTypes = await this.dbConnection.getRepository(TicketType).find({
      where: {
        event: {
          id: event.id,
        },
      },
    });
    return ticketTypes;
  }

  public static async updateTicketType(
    payload: UpdateTicketTypeRequestDto,
  ): Promise<TicketTypeResponse> {
    try {
      if (payload.name) payload.name = payload.name?.trim();
      const existingTicketType = await this.dbConnection.getRepository(TicketType).findOne({
        where: {
          name: payload.name,
          deletedAt: IsNull(),
        },
      });
      if (existingTicketType)
        return responses.conflict('Ticket type with the same name already exists');
      const ticketType = await this.dbConnection.getRepository(TicketType).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!ticketType) return responses.badRequest('Ticket type not found');

      delete payload.id;
      const updatedTicketType = this.dbConnection
        .getRepository(TicketType)
        .merge(ticketType, payload);

      if (payload.eventId) {
        const event = await this.dbConnection
          .getRepository(Event)
          .findOne({ where: { id: payload.eventId } });
        if (event) updatedTicketType.event = event;
      }

      await updatedTicketType.save();

      return responses.data(updatedTicketType);
    } catch (err) {
      return responses.badRequest('Error updating ticket type');
    }
  }

  public static async deleteTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
    try {
      const ticketType = await this.dbConnection.getRepository(TicketType).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!ticketType) return responses.badRequest('Ticket type not found');

      await ticketType.softRemove();

      return responses.data(ticketType);
    } catch (err) {
      return responses.badRequest('Error updating ticket type');
    }
  }

  public static async getTicketBreakdown(payload: RequestByIdDto): Promise<String> {
    //For a given event, get the ticket types and the number of guests that have RSVPed for each ticket type
    //Get the ticket types
    const event = await this.dbConnection.getRepository(Event).findOne({
      where: {
        id: payload.id,
      },
    });
    if (!event) return responses.badRequest('Event not found');

    //Get the ticket types
    const ticketTypes = await this.dbConnection.getRepository(TicketType).find({
      where: {
        event: {
          id: event.id,
        },
      },
    });


    //Get the number of guests that have RSVPed for each ticket type
    const guests = await this.dbConnection.getRepository(Guest).find({
      where: {
        event: {
          id: event.id,
        },
      },
    });

    //Get the number of guests that have RSVPed for each ticket type
    const guestsByTicketType = guests.filter((guest) => 
      ticketTypes.some(ticketType => guest.ticketType.id === ticketType.id)
    );

    console.log(guestsByTicketType)

    return "Hello World"

  }
}
