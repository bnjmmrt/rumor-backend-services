import { CreateVouchRequestDto, UpdateVouchRequestDto } from 'rumor-utils/shared/users/dtos/vouch-request.dto';
import { IdRequestDto, GetUserVouchRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import { VouchRequestsResponse, GenericResponse, GetUserVouchesResponse } from 'rumor-utils/shared/events/grpc/platform/platform.pb';
import { VouchRequest } from 'rumor-utils/shared/users/entities/vouch-request.entity';
import { IsNull, Repository } from 'typeorm';
import { toUserVouchRequest, toVouchRequest } from 'rumor-utils/shared/events/mappers/vouch-request.mapper';
import { responses } from '../common/responses';
import { Event, User } from 'rumor-utils/shared/events/entities';
import database from '../database';
import { BadRequestError, ConflictError } from 'rumor-utils/errors';
import { UserVouch, VouchRequest as VouchRequestResponse } from 'rumor-utils/shared/events/grpc/platform/general.pb';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb'
import serviceMesh from '../server/helpers/serviceMeshHandler';

export class VouchRequestService {
  public static dbConnection = database;
  public static async createVouchRequest(payload: CreateVouchRequestDto): Promise<string> {
    const existingVouchRequest = await this.dbConnection.getRepository(VouchRequest).findOne({
      where: {
        user: { id: payload.userId },
        requester: { id: payload.requesterId },
        event: { id: payload.eventId },
      },
    });

    if (existingVouchRequest) throw new ConflictError('Vouch request already exists');

    const vouchRequest = new VouchRequest();
    vouchRequest.user = { id: payload.userId } as User;
    vouchRequest.requester = { id: payload.requesterId } as User;
    vouchRequest.event = { id: payload.eventId } as Event;

    await this.dbConnection.getRepository(VouchRequest).save(vouchRequest);

    try {
      serviceMesh.notificationService().sendNotification(NotificationType.EVENT_VOUCH, payload.userId, payload.eventId, payload.requesterId);
    } catch (error) {
      console.log("🚀 ~ VouchRequestService ~ createVouchRequest ~ error:", error)
    }
    return ''
  }

  public static async getVouchRequests(payload: IdRequestDto): Promise<VouchRequestResponse[]> {
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

    return vouchRequests.map((vouch) => toVouchRequest(vouch))
  }

  public static async updateVouchRequest(payload: UpdateVouchRequestDto): Promise<string> {
    const vouchRequest = await this.dbConnection.getRepository(VouchRequest).findOne({
      where: {
        id: payload.id,
      },
      relations: {
        user: true,
      },
    });

    if (!vouchRequest) throw new BadRequestError('Vouch request does not exist');

    if (vouchRequest.user.id !== payload.userId) throw new BadRequestError('Vouch request does not belong to user');

    vouchRequest.isApproved = payload.isApproved;

    await vouchRequest.save();

    return ''
  }

  public static async getUserVouches(payload: IdRequestDto): Promise<any> {
    const result = await this.dbConnection.getRepository(VouchRequest).find({
      where: { requester: { id: payload.id } },
      relations: {
        requester: true,
        user: true,
      },
    });
    const data = result.map((item) => {
      return toUserVouchRequest(item);
    })
    return data
  }

  public static async getUserVouchesByEvent(payload: GetUserVouchRequestDto): Promise<UserVouch[]> {
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
    return result.map((item) => {
      return toUserVouchRequest(item);
    })
  }
}
