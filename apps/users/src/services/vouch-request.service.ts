// import { Injectable, Logger } from '@nestjs/common';
// import { CreateVouchRequestDto, UpdateVouchRequestDto } from '../dtos/vouch-request.dto';
// import { IdRequestDto } from '../dtos/platform.dto';
// import { VouchRequestsResponse, GenericResponse, GetUserVouchesResponse } from '../grpc/platform/platform.pb';
// import { InjectRepository } from '@nestjs/typeorm';
// import { VouchRequest } from '../entities/vouch-request.entity';
// import { IsNull, Repository } from 'typeorm';
// import { toUserVouchRequest, toVouchRequest } from '../mappers/vouch-request.mapper';
// import { responses } from '../common/responses';
// import { User } from 'apps/events/src/entities';
// import { Event } from 'apps/events/src/entities';

// @Injectable()
// export class VouchRequestService {
//   private readonly logger = new Logger(VouchRequestService.name);

//   @InjectRepository(VouchRequest)
//   private readonly vouchRequestRepository: Repository<VouchRequest>;

//   public async createVouchRequest(payload: CreateVouchRequestDto): Promise<GenericResponse> {
//     try {
//       const existingVouchRequest = await this.vouchRequestRepository.findOne({
//         where: {
//           user: { id: payload.userId },
//           requester: { id: payload.requesterId },
//           event: { id: payload.eventId },
//         },
//       });

//       if (existingVouchRequest) return responses.conflict('Vouch request already exists');

//       const vouchRequest = new VouchRequest();
//       vouchRequest.user = { id: payload.userId } as User;
//       vouchRequest.requester = { id: payload.requesterId } as User;
//       vouchRequest.event = { id: payload.eventId } as Event;

//       await this.vouchRequestRepository.save(vouchRequest);

//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error creating a new vouch request');
//     }
//   }

//   public async getVouchRequests(payload: IdRequestDto): Promise<VouchRequestsResponse> {
//     try {
//       const vouchRequests = await this.vouchRequestRepository.find({
//         where: {
//           user: { id: payload.id },
//           isApproved: IsNull(),
//         },
//         relations: {
//           requester: true,
//           event: true,
//         },
//       });

//       return responses.data(vouchRequests.map((vouch) => toVouchRequest(vouch)));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting vouch requests');
//     }
//   }

//   public async updateVouchRequest(payload: UpdateVouchRequestDto): Promise<GenericResponse> {
//     try {
//       const vouchRequest = await this.vouchRequestRepository.findOne({
//         where: {
//           id: payload.id,
//         },
//         relations: {
//           user: true,
//         },
//       });

//       if (!vouchRequest) return responses.badRequest('Vouch request does not exist');

//       if (vouchRequest.user.id !== payload.userId) return responses.badRequest('Vouch request does not belong to user');

//       vouchRequest.isApproved = payload.isApproved;

//       await vouchRequest.save();

//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating vouch request');
//     }
//   }

//   public async getUserVouches(payload: IdRequestDto): Promise<GetUserVouchesResponse> {
//     try {
//       const result = await this.vouchRequestRepository.find({
//         where: { requester: { id: payload.id } },
//         relations: {
//           requester: true,
//           user: true,
//         },
//       });
//       return responses.data(
//         result.map((item) => {
//           return toUserVouchRequest(item);
//         }),
//       );
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error at get user vouches');
//     }
//   }
// }
