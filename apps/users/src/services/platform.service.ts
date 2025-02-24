// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Focus } from '../entities/focus.entity';
// import { IsNull, Repository } from 'typeorm';
// import { FocusResponse, GenericResponse, InterestResponse, InterestsResponse } from '../grpc/platform/platform.pb';
// import { toFocus, toInterest } from '../mappers/platform.mapper';
// import {
//   AddFocusRequestDto,
//   CreateInterestRequestDto,
//   EditFocusNameRequestDto,
//   IdRequestDto,
//   SaveFocusesForUserRequestoDto,
//   SaveInterestsForUserRequestDto,
//   UpdateInterestRequestDto,
// } from '../dtos/platform.dto';
// import { User } from 'apps/auth/src/entities/user.entity';
// import { Interest } from '../entities/interest.entity';
// import { responses } from '../common/responses';

// @Injectable()
// export class PlatformService {
//   private readonly logger = new Logger(PlatformService.name);

//   @InjectRepository(Focus)
//   private readonly focusRepository: Repository<Focus>;

//   @InjectRepository(Interest)
//   private readonly interestRepository: Repository<Interest>;

//   async getFocuses(): Promise<FocusResponse> {
//     try {
//       const focuses = await this.focusRepository.find({ where: { deletedAt: IsNull() } });
//       return responses.data(focuses.map((focus) => toFocus(focus)));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Unknown error occured, please try again');
//     }
//   }

//   async getUserFocuses(payload: IdRequestDto): Promise<FocusResponse> {
//     try {
//       const focuses = await this.focusRepository.find({ where: { users: { id: payload.id }, deletedAt: IsNull() } });
//       return responses.data(focuses.map((focus) => toFocus(focus)));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Unknown error occured, please try again');
//     }
//   }

//   async addFocus(payload: AddFocusRequestDto): Promise<GenericResponse> {
//     try {
//       const focus = await this.focusRepository.findOne({
//         where: {
//           name: payload.name.toLowerCase(),
//           deletedAt: IsNull(),
//         },
//       });
//       if (focus) return responses.conflict('Focus with this name already exists');

//       const newFocus = new Focus();
//       newFocus.name = payload.name.toLowerCase();
//       await this.focusRepository.save(newFocus);
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Unknown error occured, please try again');
//     }
//   }

//   async editFocusName(payload: EditFocusNameRequestDto): Promise<GenericResponse> {
//     try {
//       const focus = await this.focusRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });
//       if (!focus) return responses.notFound('Focus not found');

//       focus.name = payload.name.toLowerCase();
//       await this.focusRepository.save(focus);
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Unknown error occured, please try again');
//     }
//   }

//   async saveFocusesForUser(payload: SaveFocusesForUserRequestoDto): Promise<GenericResponse> {
//     try {
//       await Promise.all(
//         payload.focusIds.map(async (focusId) => {
//           const focus = await this.focusRepository.findOne({
//             where: {
//               id: focusId,
//               deletedAt: IsNull(),
//             },
//             relations: {
//               users: true,
//             },
//           });

//           if (!focus) return;

//           if (focus.users.find((u) => u.id === payload.userId) === undefined) {
//             focus.users = [...focus.users, { id: payload.userId } as User];
//             await this.focusRepository.save(focus);
//           }
//         }),
//       );
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Unknown error occured, please try again');
//     }
//   }

//   public async createInterest(payload: CreateInterestRequestDto): Promise<InterestResponse> {
//     try {
//       const item = new Interest();
//       item.name = payload.name;
//       item.description = payload.description;
//       item.enabled = payload.enabled;
//       const created = await this.interestRepository.save(item);
//       return responses.data(created);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error at create item for Interest');
//     }
//   }

//   public async listInterests(): Promise<InterestsResponse> {
//     try {
//       const interests = await this.interestRepository.find();
//       return responses.data(interests);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error at get list of items of Interest');
//     }
//   }

//   public async getUserInterests(payload: IdRequestDto): Promise<InterestsResponse> {
//     try {
//       const interests = await this.interestRepository.find({
//         where: {
//           users: { id: payload.id },
//           deletedAt: IsNull(),
//         },
//       });
//       return responses.data(interests.map((interest) => toInterest(interest)));
//     } catch (err) {
//       this.logger.error('Error fetching user interests:', err);
//       return responses.badRequest('Error fetching user interests');
//     }
//   }

//   public async saveInterestsForUser(payload: SaveInterestsForUserRequestDto): Promise<GenericResponse> {
//     try {
//       const interests = await this.interestRepository.find({
//         where: {
//           users: { id: payload.userId },
//           deletedAt: IsNull(),
//         },
//         relations: ['users'],
//       });

//       if (interests.length > 0) {
//         await Promise.all(
//           interests.map(async (interest) => {
//             interest.users = interest.users.filter((user) => user.id !== payload.userId);
//             return this.interestRepository.save(interest);
//           }),
//         );
//       }

//       await Promise.all(
//         payload.interestsIds.map(async (interestId) => {
//           const interest = await this.interestRepository.findOne({
//             where: {
//               id: interestId,
//               deletedAt: IsNull(),
//             },
//             relations: ['users'],
//           });

//           if (interest) {
//             if (!interest.users.find((u) => u.id === payload.userId)) {
//               interest.users = [...interest.users, { id: payload.userId } as User];
//               await this.interestRepository.save(interest);
//             }
//           }
//         }),
//       );

//       return responses.ok;
//     } catch (err) {
//       this.logger.error('Error saving interests for user:', err);
//       return responses.badRequest('Error saving interests for user');
//     }
//   }

//   public async deleteInterest(payload: IdRequestDto): Promise<GenericResponse> {
//     try {
//       const result = await this.interestRepository.delete(payload.id);
//       if (result.affected === 0) {
//         return responses.notFound('Item of Interest not found');
//       }
//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error at delete an item for Interest');
//     }
//   }

//   public async updateInterest(payload: UpdateInterestRequestDto): Promise<InterestResponse> {
//     try {
//       const updateItem = { ...payload };
//       delete updateItem.id;
//       await this.interestRepository.update(
//         {
//           id: payload.id,
//         },
//         updateItem,
//       );
//       const interest = await this.interestRepository.findOne({
//         where: {
//           id: payload.id,
//         },
//       });
//       if (!interest) return responses.notFound('Item of Interest not found');
//       return responses.data(interest);
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error at update an item for Interest');
//     }
//   }
// }
