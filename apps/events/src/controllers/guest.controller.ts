import { GuestService } from '../services/guest.service';
import {
  GenericResponse,
  GetUserRequestsResponse,
  GetAttendeeCountRequest,
  PaginatedGuestEventsResponse,
  Attendees,
  Guests,
  FetchBulkGuestsData,
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
  AcceptEventInvitationRequestDto,
} from 'rumor-utils/shared/events/dtos/guest.dto';
import { IdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import {
  RequestByUserAndEventDto,
  UserAndIdRequestDto,
} from 'rumor-utils/shared/users/dtos/shared.dto';
import {
  GuestDataSimple,
  GuestData,
  BulkUserData,
  GuestDetails,
  UserAttendee,
  UserEventInviteesData,
} from 'rumor-utils/shared/events/grpc/events/general.pb';

export class GuestController {
  public static manageGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: ManageGuestsRequestDto = {
      hostId: (req as any).user,
      query: req.query as string,
      ...req.body,
    };
    const token = (req as any).token;
    const response: { message: string } = await GuestService.manageGuests(payload, token);
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static addGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: AddGuestsRequestDto = {
      eventId: req.params.id,
      hostId: (req as any).user,
      ...req.body,
    };
    const token = (req as any).token;
    const response: Guests = await GuestService.addGuests(payload, token);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static withdrawInvites = asyncWrapper(async (req, res): Promise<void> => {
    const payload: GuestsRequestDto = {
      eventId: req.params.id,
      ...req.body,
    };
    const response: GenericResponse = await GuestService.withdrawInvites(payload);
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: GuestsQueryRequestDto = {
      eventId: req.params.id,
      hostId: (req as any).user,
      query: req.query as string,
      ...req.body,
    };
    const response: Guests = await GuestService.getGuests(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static updateGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UpdateGuestsRequestDto = {
      eventId: req.params.id,
      hostId: (req as any).user,
      ...req.body,
    };
    const response: GuestDataSimple[] = await GuestService.updateGuests(payload);
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static deleteGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: GuestsRequestDto = {
      eventId: req.params.id,
      ...req.body,
    };
    const response: GenericResponse = await GuestService.deleteGuests(payload);
    const successResponse = new DeleteResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listGuestsOverview = asyncWrapper(async (req, res): Promise<void> => {
    const payload: GuestsQueryRequestDto = {
      eventId: req.params.id,
      query: req.query as string,
      ...req.body,
    };
    const response: GuestDataSimple[] = await GuestService.listGuestsOverview(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listGuestProfiles = asyncWrapper(async (req, res): Promise<void> => {
    const payload: GuestsQueryRequestDto = {
      eventId: req.params.id,
      query: req.query as string,
      ...req.body,
    };
    const response: GuestDataSimple[] = await GuestService.listGuestProfiles(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getGuestProfile = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UserAndIdRequestDto = {
      id: req.params.id,
      userId: (req as any).user,
      ...req.body,
    };
    const response: GuestData = await GuestService.getGuestProfile(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getUsersEventInvitees = asyncWrapper(async (req, res): Promise<void> => {
    const payload: ListUsersInviteesDto = {
      userId: req.params.id,
      query: req.query as string,
      ...req.body,
    };
    const token = (req as any).token;
    const response: UserEventInviteesData[] = await GuestService.getUsersEventInvitees(
      payload,
      token,
    );
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listGuestEvents = asyncWrapper(async (req, res): Promise<void> => {
    const payload: ListEventGuestsDto = {
      userId: req.params.id,
      query: req.query as string,
      ...req.body,
    };
    const response: PaginatedGuestEventsResponse = await GuestService.listEventGuests(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static requestBecomeGuest = asyncWrapper(async (req, res): Promise<void> => {
    const payload: RequestBecomeGuestRequestDto = {
      id: (req as any).user,
      ...req.body,
    };
    const response: string = await GuestService.requestBecomeGuest(payload);
    const successResponse = new CreateResponse(response, 'Succesfully applied for the event');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static updateRequestBecomeGuest = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UpdateRequestBecomeGuestRequestDto = {
      id: (req as any).user,
      ...req.body,
    };
    const response: string = await GuestService.updateRequestBecomeGuest(payload);
    const successResponse = new UpdateResponse(response, 'Application updated succesfully');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static syncUserTopAttendee = asyncWrapper(async (req, res): Promise<void> => {
    const response: GenericResponse = await GuestService.syncUserTopAttendee();
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getTopUsersAttendees = asyncWrapper(async (req, res): Promise<void> => {
    const response: UserAttendee[] = await GuestService.getTopUsersAttendees();
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static bulkUploadGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: BulkUploadGuestsRequestDto = {
      hostId: (req as any).user,
      ...req.body,
    };
    const response: BulkUserData = await GuestService.bulkUploadGuests(payload);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static fetchBulkGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: FetchBulkGuestsRequestDto = {
      count: req.params.count,
      query: req.query as string,
      ...req.body,
    };
    const response: FetchBulkGuestsData = await GuestService.fetchBulkGuests(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static cancelEventInvitation = asyncWrapper(async (req, res): Promise<void> => {
    const payload: CancelEventInvitationRequestDto = {
      id: req.params.id,
      eventId: req.params.eventId,
      ...req.body,
    };
    const response: string = await GuestService.cancelEventInvitation(payload);
    const successResponse = new UpdateResponse(response, 'Invitation cancelled');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static declineEventInvitation = asyncWrapper(async (req, res): Promise<void> => {
    const payload: DeclineEventInvitationRequestDto = {
      userId: req.params.id,
      eventId: req.params.eventId,
      ...req.body,
    };
    const response: string = await GuestService.declineEventInvitation(payload);
    const successResponse = new UpdateResponse(response, 'Invitation declined');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static acceptEventInvitation = asyncWrapper(async (req, res): Promise<void> => {
    const payload: AcceptEventInvitationRequestDto = {
      userId: req.params.id,
      eventId: req.params.eventId,
      ...req.body,
    };
    const response: string = await GuestService.acceptEventInvitation(payload);
    const successResponse = new UpdateResponse(response, 'Invitation accepted');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static inviteGuest = asyncWrapper(async (req, res): Promise<void> => {
    const payload: InvitedGuestRequestDto = {
      userId: req.params.id,
      eventId: req.params.eventId,
      ...req.body,
    };
    const response: GuestDataSimple[] = await GuestService.inviteGuest(payload);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static inviteGuests = asyncWrapper(async (req, res): Promise<void> => {
    const { id: userId, eventId } = req.params;
    const payload: InvitedGuestsRequestDto = {
      guests: req.body.guests.map(guest => ({
        ...guest,
        userId,
        eventId,
      })),
    };
    const response: GuestDataSimple[] = await GuestService.inviteGuests(payload);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static inviteNewUser = asyncWrapper(async (req, res): Promise<void> => {
    const payload: InviteNewUserRequestDto = {
      eventId: req.params.id,
      userId: (req as any).user,
      ...req.body,
    };
    const token = (req as any).token;
    const response: GuestDataSimple = await GuestService.inviteNewUser(payload, token);
    const successResponse = new CreateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listUserRequests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: GuestsQueryRequestDto = {
      eventId: req.params.id,
      query: req.query as string,
      ...req.body,
    };
    const response: Guests = await GuestService.listUserRequests(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getUserRequests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: RequestByUserAndEventDto = {
      userId: req.params.userId,
      eventId: req.params.eventId,
      ...req.body,
    };
    const response: GetUserRequestsResponse = await GuestService.getUserRequests(payload);
    const successResponse = new GetResponse(response.data);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getGuestDetails = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UserAndIdRequestDto = {
      id: req.params.id,
      userId: (req as any).user,
      ...req.body,
    };
    const response: GuestDetails = await GuestService.getGuestDetails(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static manageBulkGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: ManageBulkGuestsRequestDto = req.body;
    const response: GenericResponse = await GuestService.manageBulkGuests(payload);
    const successResponse = new UpdateResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static listInvitedGuests = asyncWrapper(async (req, res): Promise<void> => {
    const payload: ListUsersEventInviteesRequestDto = {
      userId: req.params.id,
      eventId: req.params.eventId,
      ...req.body,
    };
    const response: GuestDataSimple[] = await GuestService.listInvitedGuests(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static deleteInvitedGuest = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = {
      id: req.params.id,
      eventId: req.params.eventId,
      userId: req.params.userId,
      ...req.body,
    };
    const response: GenericResponse = await GuestService.deleteInvitedGuest(payload);
    const successResponse = new DeleteResponse(response, 'Plus one deleted succesfully');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getEventAttendeeCountByTicketType = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: GetAttendeeCountRequest = {
        ticketTypeId: req.params.ticketTypeId,
        eventId: req.params.eventId,
        ...req.body,
      };
      const response: Attendees = await GuestService.getEventAttendeeCountByTicketType(payload);
      const successResponse = new GetResponse(response);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static exportCsv = asyncWrapper(async (req, res): Promise<void> => {
    const { id } = req.params;
    const hostId = (req as any).user;
    const query = req.query as string;
    const payload: GuestsQueryRequestDto = {
      hostId: hostId,
      eventId: id,
      query,
    };

    try {
      // Call the service to generate the CSV
      const csvData = await GuestService.exportCsv(payload);

      // Set the headers to indicate the content type and prompt a download
      res.header('Content-Type', 'text/csv');
      res.attachment('guests_export.csv');

      // Send the generated CSV data to the client
      res.send(csvData);
    } catch (error) {
      // If any error occurs, return a 500 status code
      res.status(500).send('Error generating CSV');
    }
  });
}
