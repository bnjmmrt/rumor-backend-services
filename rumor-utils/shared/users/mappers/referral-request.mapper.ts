import { ReferralRequest } from '../grpc/platform/general.pb';
import { ReferralRequest as ReferralRequestEntity } from '../entities/referral-request.entity';

export const toReferralRequest = (request: ReferralRequestEntity): ReferralRequest => {
  return {
    id: request.id,
    requesterName: `${request.requester.firstName} ${request.requester.lastName}`,
    requesterProfileImage: request.requester.profilePicture,
  };
};
