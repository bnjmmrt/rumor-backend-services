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
  BulkUploadGuestsResponse,
  FetchBulkGuestsResponse,
  GetAttendeeCountRequest,
  GetAttendeeCountResponse
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
  ManageGuestsRequestDto,
  BulkUploadGuestsRequestDto,
  FetchBulkGuestsRequestDto,
  InvitedGuestsRequestDto,
  InviteNewUserRequestDto,
  AddGuestsRequestDto,
  AcceptEventInvitationRequestDto
} from 'rumor-utils/shared/events/dtos/guest.dto';
import { RequestByIdDto } from 'rumor-utils/shared/events/dtos/shared.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import { RequestByUserAndEventDto } from 'rumor-utils/shared/users/dtos/shared.dto';

export class GuestController {
  public static manageGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageGuestsRequestDto = req.body;
      const response: GenericResponse = await GuestService.manageGuests(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static addGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: AddGuestsRequestDto = req.body;
      const response: GuestsResponse = await GuestService.addGuests(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static withdrawInvites = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GuestsRequestDto = req.body;
      const response: GenericResponse = await GuestService.withdrawInvites(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GuestsQueryRequestDto = req.body;
      const response: GuestsResponse = await GuestService.getGuests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static updateGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateGuestsRequestDto = req.body;
      const response: GuestsDataResponse = await GuestService.updateGuests(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static deleteGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GuestsRequestDto = req.body;
      const response: GenericResponse = await GuestService.deleteGuests(payload);
      const successResponse = new DeleteResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static listGuestsOverview = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GuestsQueryRequestDto = req.body;
      const response: GuestsDataResponse = await GuestService.listGuestsOverview(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static listGuestProfiles = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GuestsQueryRequestDto = req.body;
      const response: GuestsDataResponse = await GuestService.listGuestProfiles(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getGuestProfile = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RequestByIdDto = req.body;
      const response: GetGuestProfileResponse = await GuestService.getGuestProfile(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getUsersEventInvitees = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersInviteesDto = req.body;
      const response: ListUsersEventInviteesResponse = await GuestService.getUsersEventInvitees(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static listGuestEvents = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListEventGuestsDto = req.body;
      const response: ListEventGuestsResponse = await GuestService.listEventGuests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static requestBecomeGuest = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RequestBecomeGuestRequestDto = req.body;
      const response: GenericResponse = await GuestService.requestBecomeGuest(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static updateRequestBecomeGuest = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: UpdateRequestBecomeGuestRequestDto = req.body;
      const response: GenericResponse = await GuestService.updateRequestBecomeGuest(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static syncUserTopAttendee = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: GenericResponse = await GuestService.syncUserTopAttendee();
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getTopUsersAttendees = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: UsersAttendeesResponse = await GuestService.getTopUsersAttendees();
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static bulkUploadGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: BulkUploadGuestsRequestDto = req.body;
      const response: BulkUploadGuestsResponse = await GuestService.bulkUploadGuests(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static fetchBulkGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: FetchBulkGuestsRequestDto = req.body;
      const response: FetchBulkGuestsResponse = await GuestService.fetchBulkGuests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static cancelEventInvitation = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: CancelEventInvitationRequestDto = req.body;
      const response: GenericResponse = await GuestService.cancelEventInvitation(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static declineEventInvitation = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: DeclineEventInvitationRequestDto = req.body;
      const response: GenericResponse = await GuestService.declineEventInvitation(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static acceptEventInvitation = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: AcceptEventInvitationRequestDto = req.body;
      const response: GenericResponse = await GuestService.acceptEventInvitation(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static inviteGuest = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InvitedGuestRequestDto = req.body;
      const response: GuestsDataResponse = await GuestService.inviteGuest(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static inviteGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InvitedGuestsRequestDto = req.body;
      const response: GuestsDataResponse = await GuestService.inviteGuests(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static inviteNewUser = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: InviteNewUserRequestDto = req.body;
      const response: GetUserRequestsResponse = await GuestService.inviteNewUser(payload);
      const successResponse = new CreateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static listUserRequests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GuestsQueryRequestDto = req.body;
      const response: GuestsResponse = await GuestService.listUserRequests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getUserRequests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RequestByUserAndEventDto = req.query; // Assuming it's a GET request
      const response: GetUserRequestsResponse = await GuestService.getUserRequests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getGuestDetails = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RequestByIdDto = req.query; // Assuming it's a GET request
      const response: GuestDetailsResponse = await GuestService.getGuestDetails(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static manageBulkGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ManageBulkGuestsRequestDto = req.body;
      const response: GenericResponse = await GuestService.manageBulkGuests(payload);
      const successResponse = new UpdateResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static listInvitedGuests = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: ListUsersEventInviteesRequestDto = req.query; // Assuming it's a GET request
      const response: GuestsDataResponse = await GuestService.listInvitedGuests(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static deleteInvitedGuest = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: IdRequestDto = req.body;
      const response: GenericResponse = await GuestService.deleteInvitedGuest(payload);
      const successResponse = new DeleteResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );

  public static getEventAttendeeCountByTicketType = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetAttendeeCountRequest = req.query; // Assuming it's a GET request
      const response: GetAttendeeCountResponse = await GuestService.getEventAttendeeCountByTicketType(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    }
  );
}
