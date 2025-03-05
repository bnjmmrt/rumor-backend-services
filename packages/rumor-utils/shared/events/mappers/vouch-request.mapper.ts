import { UserVouch, VouchRequest } from '../../users/grpc/platform/general.pb';
import { VouchRequest as VouchRequestEntity } from '../../users/entities/vouch-request.entity';

export const toVouchRequest = (request: VouchRequestEntity): VouchRequest => {
  return {
    id: request.id,
    requesterName: `${request.requester.firstName} ${request.requester.lastName}`,
    requesterProfileImage: request.requester.profilePicture,
    eventName: request.event.name,
  };
};

export const toUserVouchRequest = (vouchItem: VouchRequestEntity): UserVouch => {
  return {
    idUserRequest: vouchItem?.requester?.id,
    name: `${vouchItem?.user?.firstName || ''} ${vouchItem?.user?.lastName || ''}`,
    email: vouchItem?.user?.email,
    picture: vouchItem?.user?.profilePicture,
    idVouch: vouchItem.id,
    idUserVouch: vouchItem.user.id,
    isApproved: vouchItem.isApproved || false,
  };
};
