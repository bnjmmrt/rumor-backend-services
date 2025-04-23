import {
  CreateReferralCodeRequestDto,
  ReferredUserRequestDto,
  UpdateReferralCodeRequestDto,
} from 'rumor-utils/shared/users/dtos/referral-code.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import { ReferralCode } from 'rumor-utils/shared/users/entities/referral-code.entity';
import { ReferredUser } from 'rumor-utils/shared/users/entities/referred-user.entity';
import { Brackets, IsNull } from 'typeorm';
import { QueryParamRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import { parse } from 'qs';
import { toReferralCode } from 'rumor-utils/shared/users/mappers/referral-code.mapper';
import * as dayjs from 'dayjs';
import database from '../database';
import { ReferralCodeData } from 'rumor-utils/shared/events/grpc/platform/general.pb';
import { BadRequestError, ConflictError, NotFoundError } from 'rumor-utils/errors';

export class ReferralCodeService {
  public static dbConnection = database;

  public static async createReferralCode(
    payload: CreateReferralCodeRequestDto,
  ): Promise<ReferralCodeData> {
    const code = payload.code;
    const existingReferralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        code,
        deletedAt: IsNull(),
      },
    });
    if (existingReferralCode) {
      throw new ConflictError('Referral code with the same name already exists');
    }

    const referralCode = new ReferralCode();
    referralCode.code = payload.code;
    referralCode.description = payload.description;
    referralCode.usageLimit = payload.usageLimit;
    referralCode.expirationDate = payload.expirationDate ? new Date(payload.expirationDate) : null;

    const created = await this.dbConnection.getRepository(ReferralCode).save(referralCode);

    return toReferralCode(created);
  }

  public static async getReferralCode(payload: IdRequestDto): Promise<ReferralCodeData> {
    const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!referralCode) {
      throw new BadRequestError('Referral code not found');
    }
    return toReferralCode(referralCode);
  }

  public static async getReferralCodes(payload: QueryParamRequestDto): Promise<ReferralCodeData[]> {
    const parsedQuery = parse(payload.query);

    const deactivatedCodes = parsedQuery?.deactivated && parsedQuery.deactivated === 'true';
    const queryBuilder = this.dbConnection.getRepository(ReferralCode).createQueryBuilder('code');

    if (deactivatedCodes) {
      queryBuilder
        .where('code.isManuallyDeactivated = true')
        .orWhere('code.expirationDate < CURRENT_DATE')
        .orWhere('code.usageCount = code.usageLimit');
    } else {
      queryBuilder
        .where('code.isManuallyDeactivated = false')
        .andWhere('(code.expirationDate >= CURRENT_DATE OR code.expirationDate IS NULL)')
        .andWhere('(code.usageCount < code.usageLimit OR code.usageLimit = -1)');
    }

    const referralCodes = await queryBuilder.getMany();
    return referralCodes.map(code => toReferralCode(code));
  }

  public static async updateReferralCode(
    payload: UpdateReferralCodeRequestDto,
    reactivate: boolean = false,
  ): Promise<ReferralCodeData> {
    const existingReferralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        code: payload.code,
        deletedAt: IsNull(),
      },
    });

    if (existingReferralCode && existingReferralCode.id !== payload.id) {
      throw new ConflictError('Referral code with the same name already exists');
    }

    const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!referralCode) {
      throw new BadRequestError('Referral code not found');
    }

    if (payload.expirationDate) {
      referralCode.expirationDate = payload.expirationDate
        ? new Date(payload.expirationDate)
        : null;
    }

    delete payload.id;
    const updatedReferralCode = this.dbConnection
      .getRepository(ReferralCode)
      .merge(referralCode, payload);
    updatedReferralCode.isManuallyDeactivated = reactivate ? false : true;

    await this.dbConnection.getRepository(ReferralCode).save(updatedReferralCode);

    return toReferralCode(updatedReferralCode);
  }

  public static async deactivateReferralCode(payload: IdRequestDto): Promise<ReferralCodeData> {
    const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!referralCode) {
      throw new BadRequestError('Referral code not found');
    }

    referralCode.isManuallyDeactivated = true;
    await this.dbConnection.getRepository(ReferralCode).save(referralCode);

    return toReferralCode(referralCode);
  }

  public static async activateReferralCode(payload: IdRequestDto): Promise<ReferralCodeData> {
    const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!referralCode) {
      throw new BadRequestError('Referral code not found');
    }

    referralCode.isManuallyDeactivated = false;
    await this.dbConnection.getRepository(ReferralCode).save(referralCode);

    return toReferralCode(referralCode);
  }

  public static async deleteReferralCode(payload: IdRequestDto): Promise<ReferralCodeData> {
    const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });

    if (!referralCode) {
      throw new BadRequestError('Referral code not found');
    }

    await this.dbConnection.getRepository(ReferralCode).remove(referralCode);
    return toReferralCode(referralCode);
  }

  public static async saveReferredUser(payload: ReferredUserRequestDto): Promise<string> {
    const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
      where: {
        code: payload.referralCode,
        deletedAt: IsNull(),
      },
    });

    if (!referralCode) {
      throw new NotFoundError(`Referral code ${payload.referralCode} doesn't exist.`);
    }

    if (
      referralCode.isManuallyDeactivated ||
      referralCode.usageCount == referralCode.usageLimit ||
      dayjs().isAfter(dayjs(referralCode.expirationDate))
    ) {
      throw new ConflictError('Referral code has been expired.');
    }

    //Check if already referred
    const existingReferredUser = await this.dbConnection.getRepository(ReferredUser).findOne({
      where: {
        userId: payload.userId,
        referralCode: payload.referralCode,
        deletedAt: IsNull(),
      },
    });

    if (!existingReferredUser) {
      referralCode.usageCount++;
      await this.dbConnection.getRepository(ReferralCode).save(referralCode);

      const referredUser = new ReferredUser();
      referredUser.userId = payload.userId;
      referredUser.referralCode = payload.referralCode;
      await this.dbConnection.getRepository(ReferredUser).save(referredUser);
    }
    return '';
  }
}
