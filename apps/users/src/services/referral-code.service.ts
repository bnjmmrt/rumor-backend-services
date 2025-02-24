// import { Injectable, Logger } from '@nestjs/common';
// import { CreateReferralCodeRequestDto, ReferredUserRequestDto, UpdateReferralCodeRequestDto } from '../dtos/referral-code.dto';
// import { IdRequestDto } from '../dtos/platform.dto';
// import { ReferralCodesResponse, ReferralCodeResponse, GenericResponse } from '../grpc/platform/platform.pb';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ReferralCode } from '../entities/referral-code.entity';
// import { ReferredUser } from '../entities/referred-user.entity';
// import { IsNull, Repository } from 'typeorm';
// import { QueryParamRequestDto } from '../dtos/platform.dto';
// import { parse } from 'qs';
// import { toReferralCode } from '../mappers/referral-code.mapper';
// import { responses } from '../common/responses';
// import * as dayjs from 'dayjs';

// @Injectable()
// export class ReferralCodeService {
//   private readonly logger = new Logger(ReferralCodeService.name);

//   @InjectRepository(ReferralCode)
//   private readonly referralCodeRepository: Repository<ReferralCode>;

//   @InjectRepository(ReferredUser)
//   private readonly referredUserRepository: Repository<ReferredUser>;

//   public async createReferralCode(payload: CreateReferralCodeRequestDto): Promise<ReferralCodeResponse> {
//     try {
//       const code = payload.code;
//       const existingReferralCode = await this.referralCodeRepository.findOne({
//         where: {
//           code,
//           deletedAt: IsNull(),
//         },
//       });
//       if (existingReferralCode) return responses.conflict('Referral code with the same name already exists');
//       const referralCode = new ReferralCode();
//       referralCode.code = payload.code;
//       referralCode.description = payload.description;
//       referralCode.usageLimit = payload.usageLimit;
//       referralCode.expirationDate = payload.expirationDate ? new Date(payload.expirationDate) : null;

//       const created = await this.referralCodeRepository.save(referralCode);

//       return responses.data(toReferralCode(created));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error creating a new referral code');
//     }
//   }

//   public async getReferralCode(payload: IdRequestDto): Promise<ReferralCodeResponse> {
//     try {
//       const referralCode = await this.referralCodeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!referralCode) {
//         return responses.notFound('Referral code not found');
//       }
//       return responses.data(toReferralCode(referralCode));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting referral code');
//     }
//   }

//   public async getReferralCodes(payload: QueryParamRequestDto): Promise<ReferralCodesResponse> {
//     try {
//       const parsedQuery = parse(payload.query);

//       const deactivatedCodes = parsedQuery?.deactivated && parsedQuery.deactivated === 'true';

//       const queryBuilder = this.referralCodeRepository.createQueryBuilder('code');

//       if (deactivatedCodes) {
//         queryBuilder.where('code.isManuallyDeactivated = true').orWhere('code.expirationDate < CURRENT_DATE').orWhere('code.usageCount = code.usageLimit');
//       } else {
//         queryBuilder
//           .where('code.isManuallyDeactivated = false')
//           .andWhere('(code.expirationDate >= CURRENT_DATE OR code.expirationDate IS NULL)')
//           .andWhere('(code.usageCount < code.usageLimit OR code.usageLimit = -1)');
//       }

//       const referralCodes = await queryBuilder.getMany();

//       return responses.data(referralCodes.map((code) => toReferralCode(code)));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error getting referral codes');
//     }
//   }

//   public async updateReferralCode(payload: UpdateReferralCodeRequestDto): Promise<ReferralCodeResponse> {
//     try {
//       const existingReferralCode = await this.referralCodeRepository.findOne({
//         where: {
//           code: payload.code,
//           deletedAt: IsNull(),
//         },
//       });

//       if (existingReferralCode && existingReferralCode.id !== payload.id) return responses.conflict('Referral code with the same name already exists');

//       const referralCode = await this.referralCodeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!referralCode) return responses.badRequest('Referral code not found');

//       if (payload.expirationDate) {
//         referralCode.expirationDate = payload.expirationDate ? new Date(payload.expirationDate) : null;
//       }

//       delete payload.id;
//       const updatedReferralCode = this.referralCodeRepository.merge(referralCode, payload);

//       await updatedReferralCode.save();

//       return responses.data(toReferralCode(updatedReferralCode));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating referral code');
//     }
//   }

//   public async deactivateReferralCode(payload: IdRequestDto): Promise<ReferralCodeResponse> {
//     try {
//       const referralCode = await this.referralCodeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!referralCode) return responses.badRequest('Referral code not found');

//       referralCode.isManuallyDeactivated = true;
//       await referralCode.save();

//       return responses.data(toReferralCode(referralCode));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error deactivating referral code');
//     }
//   }

//   public async deleteReferralCode(payload: IdRequestDto): Promise<ReferralCodeResponse> {
//     try {
//       const referralCode = await this.referralCodeRepository.findOne({
//         where: {
//           id: payload.id,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!referralCode) return responses.badRequest('Referral code not found');

//       await referralCode.softRemove();

//       return responses.data(toReferralCode(referralCode));
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('Error updating referral code');
//     }
//   }

//   async saveReferredUser(payload: ReferredUserRequestDto): Promise<GenericResponse> {
//     try {
//       const referralCode = await this.referralCodeRepository.findOne({
//         where: {
//           code: payload.referralCode,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!referralCode) return responses.notFound(`Referral code ${payload.referralCode} doesn't exist.`);

//       if (referralCode.isManuallyDeactivated || referralCode.usageCount == referralCode.usageLimit || dayjs().isAfter(dayjs(referralCode.expirationDate)))
//         return responses.conflict(`Referral code has been expired.`);

//       //Check if already referred
//       const existingReferredUser = await this.referredUserRepository.findOne({
//         where: {
//           userId: payload.userId,
//           referralCode: payload.referralCode,
//           deletedAt: IsNull(),
//         },
//       });

//       if (!existingReferredUser) {
//         referralCode.usageCount++;
//         await this.referralCodeRepository.save(referralCode);

//         const referredUser = new ReferredUser();
//         referredUser.userId = payload.userId;
//         referredUser.referralCode = payload.referralCode;

//         await this.referredUserRepository.save(referredUser);
//       }

//       return responses.ok;
//     } catch (err) {
//       this.logger.error(err);
//       return responses.badRequest('An error occured while saving referred user, please try again.');
//     }
//   }
// }
