// import { Controller } from '@nestjs/common';
// import { GuestService } from '../services/guest.service';
// import { GrpcMethod } from '@nestjs/microservices';
// import {
//   EVENTS_SERVICE_NAME,
//   GenericResponse,
//   GetGuestProfileResponse,
//   GuestsResponse,
//   ListEventGuestsResponse,
//   GuestsDataResponse,
//   ListUsersEventInviteesResponse,
//   UsersAttendeesResponse,
//   GetUserRequestsResponse,
//   GuestDetailsResponse,
// } from '../grpc/events/events.pb';
// import {
//   GuestsRequestDto,
//   ListEventGuestsDto,
//   ListUsersInviteesDto,
//   UpdateGuestsRequestDto,
//   RequestBecomeGuestRequestDto,
//   CancelEventInvitationRequestDto,
//   DeclineEventInvitationRequestDto,
//   InvitedGuestRequestDto,
//   UpdateRequestBecomeGuestRequestDto,
//   GuestsQueryRequestDto,
//   ManageBulkGuestsRequestDto,
//   ListUsersEventInviteesRequestDto,
// } from '../dtos/guest.dto';
// import { AddGuestsRequestDto, RequestByIdDto } from '../dtos';

// @Controller()
// export class GuestController {
//   constructor(private readonly guestService: GuestService) {}

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'AddGuests')
//   public async addGuests(payload: AddGuestsRequestDto): Promise<GuestsResponse> {
//     return this.guestService.addGuests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'WithdrawInvites')
//   public async withdrawInvites(payload: GuestsRequestDto): Promise<GenericResponse> {
//     return this.guestService.withdrawInvites(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetGuests')
//   public async getGuests(payload: GuestsQueryRequestDto): Promise<GuestsResponse> {
//     return this.guestService.getGuests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateGuests')
//   public async updateGuests(payload: UpdateGuestsRequestDto): Promise<GuestsDataResponse> {
//     return this.guestService.updateGuests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeleteGuests')
//   public async deleteGuests(payload: GuestsRequestDto): Promise<GenericResponse> {
//     return this.guestService.deleteGuests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListGuestsOverview')
//   private async listGuestsOverview(payload: GuestsQueryRequestDto): Promise<GuestsDataResponse> {
//     return this.guestService.listGuestsOverview(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListGuestProfiles')
//   private async listGuestProfiles(payload: GuestsQueryRequestDto): Promise<GuestsDataResponse> {
//     return this.guestService.listGuestProfiles(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetGuestProfile')
//   private async getGuestProfile(payload: RequestByIdDto): Promise<GetGuestProfileResponse> {
//     return this.guestService.getGuestProfile(payload);
//   }

//   // GetUserEventInvitees
//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetUserEventInvitees')
//   public async getUsersEventInvitees(payload: ListUsersInviteesDto): Promise<ListUsersEventInviteesResponse> {
//     return this.guestService.getUsersEventInvitees(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListEventGuests')
//   private async listGuestEvents(payload: ListEventGuestsDto): Promise<ListEventGuestsResponse> {
//     return this.guestService.listEventGuests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'RequestBecomeGuest')
//   private async requestBecomeGuest(payload: RequestBecomeGuestRequestDto): Promise<GenericResponse> {
//     return this.guestService.requestBecomeGuest(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'UpdateRequestBecomeGuest')
//   private async updateRequestBecomeGuest(payload: UpdateRequestBecomeGuestRequestDto): Promise<GenericResponse> {
//     return this.guestService.updateRequestBecomeGuest(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'SyncUserTopAttendee')
//   public async syncUserTopAttendee(): Promise<GenericResponse> {
//     return this.guestService.syncUserTopAttendee();
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetTopUsersAttendees')
//   public async getTopUsersAttendees(): Promise<UsersAttendeesResponse> {
//     return this.guestService.getTopUsersAttendees();
//   }

//   // Guest invitations
//   @GrpcMethod(EVENTS_SERVICE_NAME, 'CancelEventInvitation')
//   private async cancelEventInvitation(payload: CancelEventInvitationRequestDto): Promise<GenericResponse> {
//     return this.guestService.cancelEventInvitation(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'DeclineEventInvitation')
//   private async declineEventInvitation(payload: DeclineEventInvitationRequestDto): Promise<GenericResponse> {
//     return this.guestService.declineEventInvitation(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'InviteGuest')
//   private async inviteGuest(payload: InvitedGuestRequestDto): Promise<GuestsDataResponse> {
//     return this.guestService.inviteGuest(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListUserRequests')
//   private async listUserRequests(payload: GuestsQueryRequestDto): Promise<GuestsResponse> {
//     return this.guestService.listUserRequests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetUserRequests')
//   private async getUserRequests(payload: RequestByIdDto): Promise<GetUserRequestsResponse> {
//     return this.guestService.getUserRequests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'GetGuestDetails')
//   private getGuestDetails(payload: RequestByIdDto): Promise<GuestDetailsResponse> {
//     return this.guestService.getGuestDetails(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ManageBulkGuests')
//   private manageBulkGuests(payload: ManageBulkGuestsRequestDto): Promise<GenericResponse> {
//     return this.guestService.manageBulkGuests(payload);
//   }

//   @GrpcMethod(EVENTS_SERVICE_NAME, 'ListInvitedGuests')
//   private listInvitedGuests(payload: ListUsersEventInviteesRequestDto): Promise<GuestsDataResponse> {
//     return this.guestService.listInvitedGuests(payload);
//   }
// }
