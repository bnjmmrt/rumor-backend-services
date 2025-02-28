import { GuestService } from '../services/guest.service';

import {
  GenericResponse,
  GetGuestProfileResponse,
  GuestsResponse,
  ListEventGuestsResponse,
  GuestsDataResponse,
  ListUsersEventInviteesResponse,
  UsersAttendeesResponse,
  GetUserRequestsResponse,
  GuestDetailsResponse,
} from 'rumor-utils/shared/events/grpc/events/events.pb';

import {
  GuestsRequestDto,
  ListEventGuestsDto,
  ListUsersInviteesDto,
  UpdateGuestsRequestDto,
  RequestBecomeGuestRequestDto,
  CancelEventInvitationRequestDto,
  DeclineEventInvitationRequestDto,
  InvitedGuestRequestDto,
  UpdateRequestBecomeGuestRequestDto,
  GuestsQueryRequestDto,
  ManageBulkGuestsRequestDto,
  ListUsersEventInviteesRequestDto,
} from 'rumor-utils/shared/events/dtos/guest.dto';

import { AddGuestsRequestDto, RequestByIdDto } from 'rumor-utils/shared/events/dtos';

export class GuestController {
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'AddGuests')
  public async addGuests(payload: AddGuestsRequestDto): Promise<void> {
    return GuestService.addGuests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'WithdrawInvites')
  public async withdrawInvites(payload: GuestsRequestDto): Promise<GenericResponse> {
    return GuestService.withdrawInvites(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetGuests')
  public async getGuests(payload: GuestsQueryRequestDto): Promise<void> {
    return GuestService.getGuests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateGuests')
  public async updateGuests(payload: UpdateGuestsRequestDto): Promise<GuestsDataResponse> {
    return GuestService.updateGuests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteGuests')
  public async deleteGuests(payload: GuestsRequestDto): Promise<GenericResponse> {
    return GuestService.deleteGuests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListGuestsOverview')
  private async listGuestsOverview(payload: GuestsQueryRequestDto): Promise<GuestsDataResponse> {
    return GuestService.listGuestsOverview(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListGuestProfiles')
  private async listGuestProfiles(payload: GuestsQueryRequestDto): Promise<GuestsDataResponse> {
    return GuestService.listGuestProfiles(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetGuestProfile')
  private async getGuestProfile(payload: RequestByIdDto): Promise<void> {
    return GuestService.getGuestProfile(payload);
  }

  // GetUserEventInvitees
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetUserEventInvitees')
  public async getUsersEventInvitees(payload: ListUsersInviteesDto): Promise<ListUsersEventInviteesResponse> {
    return GuestService.getUsersEventInvitees(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventGuests')
  private async listGuestEvents(payload: ListEventGuestsDto): Promise<ListEventGuestsResponse> {
    return GuestService.listEventGuests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'RequestBecomeGuest')
  private async requestBecomeGuest(payload: RequestBecomeGuestRequestDto): Promise<GenericResponse> {
    return GuestService.requestBecomeGuest(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateRequestBecomeGuest')
  private async updateRequestBecomeGuest(payload: UpdateRequestBecomeGuestRequestDto): Promise<GenericResponse> {
    return GuestService.updateRequestBecomeGuest(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'SyncUserTopAttendee')
  public async syncUserTopAttendee(): Promise<GenericResponse> {
    return GuestService.syncUserTopAttendee();
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetTopUsersAttendees')
  public async getTopUsersAttendees(): Promise<UsersAttendeesResponse> {
    return GuestService.getTopUsersAttendees();
  }

  // Guest invitations
  //@GrpcMethod(EVENTS_SERVICE_NAME, 'CancelEventInvitation')
  private async cancelEventInvitation(payload: CancelEventInvitationRequestDto): Promise<GenericResponse> {
    return GuestService.cancelEventInvitation(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'DeclineEventInvitation')
  private async declineEventInvitation(payload: DeclineEventInvitationRequestDto): Promise<GenericResponse> {
    return GuestService.declineEventInvitation(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'InviteGuest')
  private async inviteGuest(payload: InvitedGuestRequestDto): Promise<GuestsDataResponse> {
    return GuestService.inviteGuest(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListUserRequests')
  private async listUserRequests(payload: GuestsQueryRequestDto): Promise<GuestsResponse> {
    return GuestService.listUserRequests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetUserRequests')
  private async getUserRequests(payload: RequestByIdDto): Promise<GetUserRequestsResponse> {
    return GuestService.getUserRequests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'GetGuestDetails')
  private getGuestDetails(payload: RequestByIdDto): Promise<void> {
    return GuestService.getGuestDetails(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ManageBulkGuests')
  private manageBulkGuests(payload: ManageBulkGuestsRequestDto): Promise<GenericResponse> {
    return GuestService.manageBulkGuests(payload);
  }

  //@GrpcMethod(EVENTS_SERVICE_NAME, 'ListInvitedGuests')
  private listInvitedGuests(payload: ListUsersEventInviteesRequestDto): Promise<GuestsDataResponse> {
    return GuestService.listInvitedGuests(payload);
  }
}
