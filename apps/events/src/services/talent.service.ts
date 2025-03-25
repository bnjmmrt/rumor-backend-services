import { IsNull } from 'typeorm';
import { CreateTalentRequestDto, RequestByIdDto, UpdateTalentRequestDto } from 'rumor-utils/shared/events/dtos';
import { TalentResponse, TalentsResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { Event, Talent } from 'rumor-utils/shared/events/entities';
import { responses } from '../common/responses';
import database from '../database';
import {  NotFoundError } from 'rumor-utils/errors';

export class TalentService {
  public static dbConnection = database;

  public static async createTalent(payload: CreateTalentRequestDto): Promise<TalentResponse> {
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
  }

  public static async getAllTalent(): Promise<TalentsResponse> {

    const talents = await this.dbConnection.getRepository(Talent).find({ where: { deletedAt: IsNull() } });
    return responses.data(talents);

  }

  public static async getTalent(payload: RequestByIdDto): Promise<Talent> {
    const talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
    if (!talent) throw new NotFoundError('Talent not found');
    return talent
  }

  public static async updateTalent(payload: UpdateTalentRequestDto): Promise<TalentResponse> {
    const { id } = payload;
    const talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id, deletedAt: IsNull() } });
    if (payload.eventId) {
      const event = await this.dbConnection.getRepository(Event).findOne({ where: { id: payload.eventId } });
      if (event) talent.event = event;
    }
    if (!talent) return responses.notFound('Talent not found');
    await this.dbConnection.getRepository(Talent).update(id, payload);
    return responses.data({ ...talent, ...payload });
  }

  public static async deleteTalent(payload: RequestByIdDto): Promise<TalentResponse> {
    const talent = await this.dbConnection.getRepository(Talent).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
    if (!talent) return responses.notFound('Talent not found');
    await talent.softRemove();
    return responses.data(talent);
  }
}
