import { IsNull } from 'typeorm';
import { CreateTalentRequestDto, RequestByIdDto, UpdateTalentRequestDto } from 'rumor-utils/shared/events/dtos';
import { TalentResponse, TalentsResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { Event, Talent } from 'rumor-utils/shared/events/entities';
import { responses } from '../common/responses';
import database from '../database';

export class TalentService {
  public static dbConnection = database;

  public static async createTalent(payload: CreateTalentRequestDto): Promise<TalentResponse> {
    try {
      let talent = new Talent();
      talent.name = payload.name;
      talent.description = payload.description;
      talent.imageKeyUrl = payload.imageKeyUrl;
      talent.contact = payload.contact;
      talent.socialNetwork = payload.socialNetwork;
      if (payload.eventId) {
        const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
        if (event) talent.event = event;
      }
      talent = this.dbConnection.getRepository(Talent).create(talent);
      await this.dbConnection.getRepository(Talent).save(talent);
      talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id: talent.id } });
      return responses.data(talent);
    } catch (error) {
      return responses.badRequest('Error creating a new talent');
    }
  }

  public static async getAllTalent(): Promise<TalentsResponse> {
    try {
      const talents = await this.dbConnection.getRepository(Talent).find({ where: { deletedAt: IsNull() } });
      return responses.data(talents);
    } catch (error) {
      return responses.badRequest('Error getting all talents');
    }
  }

  public static async getTalent(payload: RequestByIdDto): Promise<TalentResponse> {
    try {
      const talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
      if (!talent) return responses.notFound('Talent not found');
      return responses.data(talent);
    } catch (error) {
      return responses.badRequest('Error getting talent');
    }
  }

  public static async updateTalent(payload: UpdateTalentRequestDto): Promise<TalentResponse> {
    try {
      const { id } = payload;
      const talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id, deletedAt: IsNull() } });
      if (payload.eventId) {
        const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
        if (event) talent.event = event;
      }
      if (!talent) return responses.notFound('Talent not found');
      await this.dbConnection.getRepository(Talent).update(id, payload);
      return responses.data({ ...talent, ...payload });
    } catch (error) {
      return responses.badRequest('Error updating talent');
    }
  }

  public static async deleteTalent(payload: RequestByIdDto): Promise<TalentResponse> {
    try {
      const talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
      if (!talent) return responses.notFound('Talent not found');
      await talent.softRemove();
      return responses.data(talent);
    } catch (error) {
      return responses.badRequest('Error deleting talent');
    }
  }
}
