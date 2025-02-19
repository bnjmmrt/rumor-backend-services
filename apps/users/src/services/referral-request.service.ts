// import { Injectable, Logger } from '@nestjs/common';
// import { CreateReferralRequestDto, UpdateReferralRequestDto } from '../dtos/referral-request.dto';
// import { IdRequestDto } from '../dtos/platform.dto';
// import { ReferralRequestsResponse, GenericResponse, GetSentReferralRequestsResponse } from '../grpc/platform/platform.pb';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ReferralRequest } from '../entities/referral-request.entity';
// import { IsNull, Repository } from 'typeorm';
// import { toReferralRequest } from '../mappers/referral-request.mapper';
// import { responses } from '../common/responses';
// import { User } from 'apps/events/src/entities';

// @Injectable()
// export class ReferralRequestService {
//   private readonly logger = new Logger(ReferralRequestService.name);

//   @InjectRepository(ReferralRequest)
//   private readonly referralRequestRepository: Repository<ReferralRequest>;

//   public async createReferralRequest(payload: CreateReferralRequestDto): Promise<GenericResponse> {
//     try {
//       const existingReferralRequest = await this.referralRequestRepository.findOne({
//         where: {
//           user: { id: payload.userId },
//           requester: { id: payload.requesterId },
//         },
//       });

//       if (existingReferralRequest) return responses.conflict('Referral request already exists');

//       const referralRequest = new ReferralRequest();
//       referralRequest.user = { id: payload.userId } as User;
//       referralRequest.requester = { id: payload.requesterId } as User;

//       await this.referralRequestRepository.save(referralRequest);

//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error creating a new referral request');
//     }
//   }

//   public async getReferralRequests(payload: IdRequestDto): Promise<ReferralRequestsResponse> {
//     try {
//       const referralRequests = await this.referralRequestRepository.find({
//         where: {
//           user: { id: payload.id },
//           isApproved: IsNull(),
//         },
//         relations: {
//           requester: true,
//         },
//       });

//       return responses.data(referralRequests.map((referral) => toReferralRequest(referral)));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting referral requests');
//     }
//   }

//   public async updateReferralRequest(payload: UpdateReferralRequestDto): Promise<GenericResponse> {
//     try {
//       const referralRequest = await this.referralRequestRepository.findOne({
//         where: {
//           id: payload.id,
//         },
//         relations: {
//           user: true,
//         },
//       });

//       if (!referralRequest) return responses.badRequest('Referral request does not exist');

//       if (referralRequest.user.id !== payload.userId) return responses.badRequest('Referral request does not belong to user');

//       referralRequest.isApproved = payload.isApproved;

//       await referralRequest.save();

//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating referral request');
//     }
//   }

//   public async getSentReferralRequests(payload: IdRequestDto): Promise<GetSentReferralRequestsResponse> {
//     try {
//       const listReferralRequest = await this.referralRequestRepository.find({
//         where: { requester: { id: payload.id } },
//         relations: { user: true },
//       });
//       const result = listReferralRequest.map((el) => {
//         return {
//           name: `${el.user?.firstName || ''} ${el.user?.lastName || ''}`,
//           phoneNumber: el.user?.phoneNumber || '',
//           isApproved: !!el.isApproved,
//           userId: el.user.id,
//         };
//       });

//       return responses.data(result);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('An error occurred while processing the referral request.');
//     }
//   }
// }
