import { CreateVouchRequestDto, UpdateVouchRequestDto } from 'rumor-utils/shared/users/dtos/vouch-request.dto';
import { IdRequestDto, GetUserVouchRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import { VouchRequestsResponse, GenericResponse, GetUserVouchesResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { VouchRequest } from 'rumor-utils/shared/users/entities/vouch-request.entity';
import { IsNull, Repository } from 'typeorm';
import { toUserVouchRequest, toVouchRequest } from 'rumor-utils/shared/events/mappers/vouch-request.mapper';
import { responses } from '../common/responses';
import { Event, User } from 'rumor-utils/shared/events/entities';
import database from '../database';

export class VouchRequestService {
 public static dbConnection = database;
  public static async createVouchRequest(payload: CreateVouchRequestDto): Promise<GenericResponse> {
      const existingVouchRequest = await this.dbConnection.getRepository(VouchRequest).findOne({
        where: {
          user: { id: payload.userId },
          requester: { id: payload.requesterId },
          event: { id: payload.eventId },
        },
      });

      if (existingVouchRequest) return responses.conflict('Vouch request already exists');

      const vouchRequest = new VouchRequest();
      vouchRequest.user = { id: payload.userId } as User;
      vouchRequest.requester = { id: payload.requesterId } as User;
      vouchRequest.event = { id: payload.eventId } as Event;

      await this.dbConnection.getRepository(VouchRequest).save(vouchRequest);

      return responses.ok;
  }

  public static async getVouchRequests(payload: IdRequestDto): Promise<VouchRequestsResponse> {
      const vouchRequests = await this.dbConnection.getRepository(VouchRequest).find({
        where: {
          user: { id: payload.id },
          isApproved: IsNull(),
        },
        relations: {
          requester: true,
          event: true,
        },
      });

      return responses.data(vouchRequests.map((vouch) => toVouchRequest(vouch)));
  }

  public static async updateVouchRequest(payload: UpdateVouchRequestDto): Promise<GenericResponse> {
      const vouchRequest = await this.dbConnection.getRepository(VouchRequest).findOne({
        where: {
          id: payload.id,
        },
        relations: {
          user: true,
        },
      });

      if (!vouchRequest) return responses.badRequest('Vouch request does not exist');

      if (vouchRequest.user.id !== payload.userId) return responses.badRequest('Vouch request does not belong to user');

      vouchRequest.isApproved = payload.isApproved;

      await vouchRequest.save();

      return responses.ok;
  }

  public static async getUserVouches(payload: IdRequestDto): Promise<GetUserVouchesResponse> {
      const result = await this.dbConnection.getRepository(VouchRequest).find({
        where: { requester: { id: payload.id } },
        relations: {
          requester: true,
          user: true,
        },
      });
      return responses.data(
        result.map((item) => {
          return toUserVouchRequest(item);
        }),
      );
  }

  public static async getUserVouchesByEvent(payload: GetUserVouchRequestDto): Promise<GetUserVouchesResponse> {
    try {
      const result = await this.dbConnection.getRepository(VouchRequest).find({
        where: {
          requester: { id: payload.requesterId },
          event: payload.eventId ? { id: payload.eventId } : undefined,
        },
        relations: {
          requester: true,
          user: true,
        },
      });
      return responses.data(
        result.map((item) => {
          return toUserVouchRequest(item);
        }),
      );
    } catch (err) {
      return responses.badRequest('Error at get user vouches');
    }
  }
}
