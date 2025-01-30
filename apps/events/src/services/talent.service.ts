// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { IsNull, Repository } from 'typeorm';
// import { CreateTalentRequestDto, RequestByIdDto, UpdateTalentRequestDto } from '../dtos';
// import { TalentResponse, TalentsResponse } from '../grpc/events/events.pb';
// import { Event, Talent } from '../entities';
// import { responses } from '../common/responses';

// @Injectable()
// export class TalentService {
//   private readonly logger = new Logger(TalentService.name);
//   @InjectRepository(Talent)
//   private readonly talentRepository: Repository<Talent>;

//   @InjectRepository(Event)
//   private readonly eventRepository: Repository<Event>;

//   public async createTalent(payload: CreateTalentRequestDto): Promise<TalentResponse> {
//     try {
//       let talent = new Talent();
//       talent.name = payload.name;
//       talent.description = payload.description;
//       talent.imageKeyUrl = payload.imageKeyUrl;
//       talent.contact = payload.contact;
//       talent.socialNetwork = payload.socialNetwork;
//       if (payload.eventId) {
//         const event = await this.eventRepository.findOne({ where: { id: payload.eventId } });
//         if (event) talent.event = event;
//       }
//       talent = this.talentRepository.create(talent);
//       await this.talentRepository.save(talent);
//       talent = await this.talentRepository.findOne({ where: { id: talent.id } });
//       return responses.data(talent);
//     } catch (error) {
//       this.logger.error(`Error creating admission type: ${error}`);
//       return responses.badRequest('Error creating a new talent');
//     }
//   }

//   public async getAllTalent(): Promise<TalentsResponse> {
//     try {
//       const talents = await this.talentRepository.find({ where: { deletedAt: IsNull() } });
//       return responses.data(talents);
//     } catch (error) {
//       this.logger.error(`Error getting all talents: ${error}`);
//       return responses.badRequest('Error getting all talents');
//     }
//   }

//   public async getTalent(payload: RequestByIdDto): Promise<TalentResponse> {
//     try {
//       const talent = await this.talentRepository.findOne({ where: { id: payload.id, deletedAt: IsNull() } });
//       if (!talent) return responses.notFound('Talent not found');
//       return responses.data(talent);
//     } catch (error) {
//       this.logger.error(`Error getting talent: ${error}`);
//       return responses.badRequest('Error getting talent');
//     }
//   }

//   public async updateTalent(payload: UpdateTalentRequestDto): Promise<TalentResponse> {
//     try {
//       const { id } = payload;
//       const talent = await this.talentRepository.findOne({ where: { id, deletedAt: IsNull() } });
//       if (payload.eventId) {
//         const event = await this.eventRepository.findOne({ where: { id: payload.eventId } });
//         if (event) talent.event = event;
//       }
//       if (!talent) return responses.notFound('Talent not found');
//       await this.talentRepository.update(id, payload);
//       return responses.data({ ...talent, ...payload });
//     } catch (error) {
//       this.logger.error(`Error updating talent: ${error}`);
//       return responses.badRequest('Error updating talent');
//     }
//   }

//   public async deleteTalent(payload: RequestByIdDto): Promise<TalentResponse> {
//     try {
//       const talent = await this.talentRepository.findOne({ where: { id: payload.id, deletedAt: IsNull() } });
//       if (!talent) return responses.notFound('Talent not found');
//       await talent.softRemove();
//       return responses.data(talent);
//     } catch (error) {
//       this.logger.error(`Error deleting talent: ${error}`);
//       return responses.badRequest('Error deleting talent');
//     }
//   }
// }
