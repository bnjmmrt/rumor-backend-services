import {
  CreateReferralRequestDto,
  UpdateReferralRequestDto,
} from 'rumor-utils/shared/users/dtos/referral-request.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/platform.dto';
import {
  ReferralRequestsResponse,
  GenericResponse,
  GetSentReferralRequestsResponse,
} from 'rumor-utils/shared/users/grpc/platform/platform.pb';
import { ReferralRequest } from 'rumor-utils/shared/users/entities/referral-request.entity';
import { IsNull } from 'typeorm';
import { toReferralRequest } from 'rumor-utils/shared/users/mappers/referral-request.mapper';
import { responses } from '../common/responses.common';
import { User } from 'rumor-utils/shared/users/entities/user.entity';
import database from '../database';
import { NotificationType } from 'rumor-utils/shared/notifications/grpc/notification/notification.pb';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { isValidPhoneNumber } from 'rumor-utils/utils/file-utils';
import config from '../config';
import { BadRequestError, ConflictError } from 'rumor-utils/errors';

export class ReferralRequestService {
  public static dbConnection = database;

  public static async createReferralRequest(payload: CreateReferralRequestDto): Promise<string> {
    const existingReferralRequest = await this.dbConnection.getRepository(ReferralRequest).findOne({
      where: {
        user: { id: payload.userId },
        requester: { id: payload.requesterId },
      },
    });

    if (existingReferralRequest) throw new ConflictError('Referral request already exists');

    const referralRequest = new ReferralRequest();
    referralRequest.user = { id: payload.userId } as User;
    referralRequest.requester = { id: payload.requesterId } as User;

    await this.dbConnection.getRepository(ReferralRequest).save(referralRequest);

    try {
      serviceMesh
        .notificationService()
        .sendNotification(
          NotificationType.PROFILE_REFERRALS,
          payload.userId,
          null,
          payload.requesterId,
        );
    } catch (error) {
      console.log('🚀 ~ ReferralRequestService ~ createReferralRequest ~ error:', error);
    }

    const user = await this.dbConnection.getRepository(User).findOne({
      where: { id: payload.userId },
    });
    let userPhoneNumber = user?.phoneNumber;
    //send text message to user to whom the referral request is sent
    if (userPhoneNumber) {
      try {
        let link = config.get('RUMOR_WEBSITE_HOST') + 'redirect';
        let message = `Hey ${user?.firstName} - Someone has requested your referral to Rumor. Click to refer them now! ${link}`;
        const validateNumber = isValidPhoneNumber(userPhoneNumber);
        if (validateNumber) {
          const cleanedNumber = userPhoneNumber.replace(/[\s\-()]/g, '');
          await serviceMesh.notificationService().sendTextMessage(cleanedNumber, message);
        }
      } catch (err) {
        console.error(`❌ Error while processing SMS for ${userPhoneNumber}:`, err);
      }
    }
    return '';
  }

  public static async getReferralRequests(
    payload: IdRequestDto,
  ): Promise<ReferralRequestsResponse> {
    const referralRequests = await this.dbConnection.getRepository(ReferralRequest).find({
      where: {
        user: { id: payload.id },
        isApproved: IsNull(),
      },
      relations: {
        requester: true,
      },
    });

    return responses.data(referralRequests.map(referral => toReferralRequest(referral)));
  }

  public static async updateReferralRequest(
    payload: UpdateReferralRequestDto,
  ): Promise<GenericResponse> {
    try {
      const referralRequest = await this.dbConnection.getRepository(ReferralRequest).findOne({
        where: {
          id: payload.id,
        },
        relations: {
          user: true,
        },
      });

      if (!referralRequest) return responses.badRequest('Referral request does not exist');

      if (referralRequest.user.id !== payload.userId)
        return responses.badRequest('Referral request does not belong to user');

      referralRequest.isApproved = payload.isApproved;

      await referralRequest.save();

      return responses.ok;
    } catch (err) {
      //   this.logger.error(err);
      return responses.badRequest('Error updating referral request');
    }
  }

  public static async getSentReferralRequests(
    payload: IdRequestDto,
  ): Promise<GetSentReferralRequestsResponse> {
    try {
      const listReferralRequest = await this.dbConnection.getRepository(ReferralRequest).find({
        where: { requester: { id: payload.id } },
        relations: { user: true },
      });
      const result = listReferralRequest.map(el => {
        return {
          name: `${el.user?.firstName || ''} ${el.user?.lastName || ''}`,
          phoneNumber: el.user?.phoneNumber || '',
          isApproved: !!el.isApproved,
          userId: el.user.id,
        };
      });

      return responses.data(result);
    } catch (err) {
      //   this.logger.error(err);
      return responses.badRequest('An error occurred while processing the referral request.');
    }
  }
}
