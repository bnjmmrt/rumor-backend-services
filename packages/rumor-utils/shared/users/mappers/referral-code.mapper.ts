import { ReferralCode } from '../grpc/platform/general.pb';
import { ReferralCode as ReferralCodeEntity } from '../entities/referral-code.entity';
import * as dayjs from 'dayjs';

export const toReferralCode = (code: ReferralCodeEntity): ReferralCode => {
  return {
    ...code,
    expirationDate: dayjs(code.expirationDate).format('MM/DD/YYYY'),
  };
};
