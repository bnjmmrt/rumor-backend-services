import { UserStatus as UserStatusProto, UserSource as UserSourceProto, NewUserStatus } from '../grpc/auth/shared.pb';
import { UserSource, UserStatus } from '../interfaces/shared.interface';

export const userStatusToEntity: { [s in UserStatusProto]: UserStatus } = {
  [UserStatusProto.NEW_APPLICANT]: UserStatus.NEW_APPLICANT,
  [UserStatusProto.ACTIVE]: UserStatus.ACTIVE,
  [UserStatusProto.WAITLISTED]: UserStatus.WAITLISTED,
  [UserStatusProto.DEACTIVATED]: UserStatus.DEACTIVATED,
  [UserStatusProto.REJECTED]: UserStatus.REJECTED,
  [UserStatusProto.UNRECOGNIZED]: UserStatus.UNRECOGNIZED,
};

export const entityToUserStatus: { [s in UserStatus]: UserStatusProto } = {
  [UserStatus.NEW_APPLICANT]: UserStatusProto.NEW_APPLICANT,
  [UserStatus.ACTIVE]: UserStatusProto.ACTIVE,
  [UserStatus.WAITLISTED]: UserStatusProto.WAITLISTED,
  [UserStatus.DEACTIVATED]: UserStatusProto.DEACTIVATED,
  [UserStatus.REJECTED]: UserStatusProto.REJECTED,
  [UserStatus.UNRECOGNIZED]: UserStatusProto.UNRECOGNIZED,
};

export const userSourceToEntity: { [s in UserSourceProto]: UserSource } = {
  [UserSourceProto.INVITED_BY_HOST]: UserSource.INVITED_BY_HOST,
  [UserSourceProto.INVITED_BY_ADMIN]: UserSource.INVITED_BY_ADMIN,
  [UserSourceProto.INVITED_BY_COLLABORATOR]: UserSource.INVITED_BY_COLLABORATOR,
  [UserSourceProto.SIGN_UP_FORM]: UserSource.SIGN_UP_FORM,
  [UserSourceProto.REQUEST_IN_APP]: UserSource.REQUEST_IN_APP,
  [UserSourceProto.PLUS_1]: UserSource.PLUS_1,
  [UserSourceProto.UNRECOGNIZED]: UserSource.UNRECOGNIZED,
};

export const entityToUserSource: { [s in UserSource]: UserSourceProto } = {
  [UserSource.INVITED_BY_HOST]: UserSourceProto.INVITED_BY_HOST,
  [UserSource.INVITED_BY_ADMIN]: UserSourceProto.INVITED_BY_ADMIN,
  [UserSource.INVITED_BY_COLLABORATOR]: UserSourceProto.INVITED_BY_COLLABORATOR,
  [UserSource.SIGN_UP_FORM]: UserSourceProto.SIGN_UP_FORM,
  [UserSource.REQUEST_IN_APP]: UserSourceProto.REQUEST_IN_APP,
  [UserSource.PLUS_1]: UserSourceProto.PLUS_1,
  [UserSource.UNRECOGNIZED]: UserSourceProto.UNRECOGNIZED,
};

export const newUserStatusTosUserStatus: { [s in NewUserStatus]: UserStatus } = {
  [NewUserStatus.APPROVE]: UserStatus.ACTIVE,
  [NewUserStatus.WAITLIST]: UserStatus.WAITLISTED,
  [NewUserStatus.DEACTIVATE]: UserStatus.DEACTIVATED,
  [UserStatusProto.UNRECOGNIZED]: UserStatus.UNRECOGNIZED,
};
