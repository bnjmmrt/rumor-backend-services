// import { Injectable, Logger } from '@nestjs/common';
// import { CreateTicketTypeRequestDto, RequestByIdDto, UpdateTicketTypeRequestDto } from '../dtos';
// import { TicketTypesResponse, TicketTypeResponse } from '../grpc/events/events.pb';
// import { InjectRepository } from '@nestjs/typeorm';
// import { TicketType } from '../entities/ticket-type.entity';
// import { IsNull, Repository } from 'typeorm';
// import { responses } from '../common/responses';
// import { normalizeCatalogName } from '../common/helpers';
// import { Event } from '../entities';

// @Injectable()
// export class TicketTypeService {
//   private readonly logger = new Logger(TicketTypeService.name);

//   @InjectRepository(TicketType)
//   private readonly ticketTypeRepository: Repository<TicketType>;

//   @InjectRepository(Event)
//   private readonly eventRepository: Repository<Event>;

//   public async createTicketType(payload: CreateTicketTypeRequestDto): Promise<TicketTypeResponse> {
//     try {
//       const name = normalizeCatalogName(payload.name);
//       const existingTicketType = await this.ticketTypeRepository.findOne({
//         where: {
//           name,
//           deletedAt: IsNull(),
//           event: { id: payload.eventId },
//         },
//       });
//       if (existingTicketType) return responses.conflict('Ticket type with the same name already exists');
//       const ticketType = new TicketType();
//       ticketType.name = name;
//       ticketType.description = payload.description;
//       ticketType.capacity = payload.capacity;

//       if (payload.eventId) {
//         const event = await this.eventRepository.findOne({ where: { id: payload.eventId } });
//         if (event) ticketType.event = event;
//       }

//       const created = await this.ticketTypeRepository.save(ticketType);

//       return responses.data(created);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error creating a new ticket type');
//     }
//   }

//   public async getTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
//     try {
//       const ticketType = await this.ticketTypeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!ticketType) {
//         return responses.notFound('Ticket type not found');
//       }
//       return responses.data(ticketType);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting ticket type');
//     }
//   }

//   public async getTicketTypes(payload: RequestByIdDto): Promise<TicketTypesResponse> {
//     const eventId = payload?.id;
//     if (!eventId) return responses.badRequest('eventId param is a required value');
//     try {
//       const event = await this.eventRepository.findOne({ where: { id: eventId } });

//       if (!event) return responses.badRequest('Event with given Id was not found');

//       const ticketTypes = await this.ticketTypeRepository.find({
//         where: {
//           event: {
//             id: event.id,
//           },
//         },
//       });

//       return responses.data(ticketTypes);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting ticket types');
//     }
//   }

//   public async updateTicketType(payload: UpdateTicketTypeRequestDto): Promise<TicketTypeResponse> {
//     try {
//       if (payload.name) payload.name = normalizeCatalogName(payload.name);
//       const existingTicketType = await this.ticketTypeRepository.findOne({
//         where: {
//           name: payload.name,
//           deletedAt: IsNull(),
//         },
//       });
//       if (existingTicketType) return responses.conflict('Ticket type with the same name already exists');
//       const ticketType = await this.ticketTypeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!ticketType) return responses.badRequest('Ticket type not found');

//       delete payload.id;
//       const updatedTicketType = this.ticketTypeRepository.merge(ticketType, payload);

//       if (payload.eventId) {
//         const event = await this.eventRepository.findOne({ where: { id: payload.eventId } });
//         if (event) updatedTicketType.event = event;
//       }

//       await updatedTicketType.save();

//       return responses.data(updatedTicketType);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating ticket type');
//     }
//   }

//   public async deleteTicketType(payload: RequestByIdDto): Promise<TicketTypeResponse> {
//     try {
//       const ticketType = await this.ticketTypeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!ticketType) return responses.badRequest('Ticket type not found');

//       await ticketType.softRemove();

//       return responses.data(ticketType);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating ticket type');
//     }
//   }
// }
