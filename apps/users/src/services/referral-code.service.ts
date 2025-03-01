import {
  CreateReferralCodeRequestDto,
  ReferredUserRequestDto,
  UpdateReferralCodeRequestDto,
} from "rumor-utils/shared/users/dtos/referral-code.dto";
import { IdRequestDto } from "rumor-utils/shared/users/dtos/platform.dto";
import {
  ReferralCodesResponse,
  ReferralCodeResponse,
  GenericResponse,
} from "rumor-utils/shared/users/grpc/platform/platform.pb";
import { ReferralCode } from "rumor-utils/shared/users/entities/referral-code.entity";
import { ReferredUser } from "rumor-utils/shared/users/entities/referred-user.entity";
import { IsNull } from "typeorm";
import { QueryParamRequestDto } from "rumor-utils/shared/users/dtos/platform.dto";
import { parse } from "qs";
import { toReferralCode } from "rumor-utils/shared/users/mappers/referral-code.mapper";
import { responses } from "../common/responses.common";
import * as dayjs from "dayjs";
import database from "../database";

export class ReferralCodeService {
  public static dbConnection = database;

  public static async createReferralCode(
    payload: CreateReferralCodeRequestDto
  ): Promise<ReferralCodeResponse> {
    try {
      const code = payload.code;
      const existingReferralCode = await this.dbConnection
        .getRepository(ReferralCode)
        .findOne({
          where: {
            code,
            deletedAt: IsNull(),
          },
        });
      if (existingReferralCode)
        return responses.conflict(
          "Referral code with the same name already exists"
        );
      const referralCode = new ReferralCode();
      referralCode.code = payload.code;
      referralCode.description = payload.description;
      referralCode.usageLimit = payload.usageLimit;
      referralCode.expirationDate = payload.expirationDate
        ? new Date(payload.expirationDate)
        : null;

      const created = await this.dbConnection
      .getRepository(ReferralCode).save(referralCode);

      return responses.data(toReferralCode(created));
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest("Error creating a new referral code");
    }
  }

  public static async getReferralCode(
    payload: IdRequestDto
  ): Promise<ReferralCodeResponse> {
    try {
      const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!referralCode) {
        return responses.notFound("Referral code not found");
      }
      return responses.data(toReferralCode(referralCode));
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest("Error getting referral code");
    }
  }

  public static async getReferralCodes(
    payload: QueryParamRequestDto
  ): Promise<ReferralCodesResponse> {
    try {
      const parsedQuery = parse(payload.query);

      const deactivatedCodes =
        parsedQuery?.deactivated && parsedQuery.deactivated === "true";

      const queryBuilder =
        this.dbConnection.getRepository(ReferralCode).createQueryBuilder("code");

      if (deactivatedCodes) {
        queryBuilder
          .where("code.isManuallyDeactivated = true")
          .orWhere("code.expirationDate < CURRENT_DATE")
          .orWhere("code.usageCount = code.usageLimit");
      } else {
        queryBuilder
          .where("code.isManuallyDeactivated = false")
          .andWhere(
            "(code.expirationDate >= CURRENT_DATE OR code.expirationDate IS NULL)"
          )
          .andWhere(
            "(code.usageCount < code.usageLimit OR code.usageLimit = -1)"
          );
      }

      const referralCodes = await queryBuilder.getMany();

      return responses.data(referralCodes.map((code) => toReferralCode(code)));
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest("Error getting referral codes");
    }
  }

  public static async updateReferralCode(
    payload: UpdateReferralCodeRequestDto
  ): Promise<ReferralCodeResponse> {
    try {
      const existingReferralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
        where: {
          code: payload.code,
          deletedAt: IsNull(),
        },
      });

      if (existingReferralCode && existingReferralCode.id !== payload.id)
        return responses.conflict(
          "Referral code with the same name already exists"
        );

      const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!referralCode) return responses.badRequest("Referral code not found");

      if (payload.expirationDate) {
        referralCode.expirationDate = payload.expirationDate
          ? new Date(payload.expirationDate)
          : null;
      }

      delete payload.id;
      const updatedReferralCode = this.dbConnection.getRepository(ReferralCode).merge(
        referralCode,
        payload
      );

      await this.dbConnection.getRepository(ReferralCode).save(updatedReferralCode);

      return responses.data(toReferralCode(updatedReferralCode));
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest("Error updating referral code");
    }
  }

  public static async deactivateReferralCode(
    payload: IdRequestDto
  ): Promise<ReferralCodeResponse> {
    try {
      const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!referralCode) return responses.badRequest("Referral code not found");

      referralCode.isManuallyDeactivated = true;
      await this.dbConnection.getRepository(ReferralCode).save(referralCode);

      return responses.data(toReferralCode(referralCode));
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest("Error deactivating referral code");
    }
  }

  public static async deleteReferralCode(
    payload: IdRequestDto
  ): Promise<ReferralCodeResponse> {
    try {
      const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
        where: {
          id: payload.id,
          deletedAt: IsNull(),
        },
      });

      if (!referralCode) return responses.badRequest("Referral code not found");

      await this.dbConnection.getRepository(ReferralCode).remove(referralCode);

      return responses.data(toReferralCode(referralCode));
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest("Error updating referral code");
    }
  }

  public static async saveReferredUser(
    payload: ReferredUserRequestDto
  ): Promise<GenericResponse> {
    try {
      const referralCode = await this.dbConnection.getRepository(ReferralCode).findOne({
        where: {
          code: payload.referralCode,
          deletedAt: IsNull(),
        },
      });

      if (!referralCode)
        return responses.notFound(
          `Referral code ${payload.referralCode} doesn't exist.`
        );

      if (
        referralCode.isManuallyDeactivated ||
        referralCode.usageCount == referralCode.usageLimit ||
        dayjs().isAfter(dayjs(referralCode.expirationDate))
      )
        return responses.conflict(`Referral code has been expired.`);

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

      return responses.ok;
    } catch (err) {
    //   this.logger.error(err);
      return responses.badRequest(
        "An error occured while saving referred user, please try again."
      );
    }
  }
}
