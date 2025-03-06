export interface EventLocationInterface {
  id_event: string;
  id_location: string;
  lat: number;
  long: number;
}

export enum EventStatusEnum {
  APPROVED_STATUS = 'APPROVED_STATUS',
  DRAFT_STATUS = 'DRAFT_STATUS',
  PENDING_STATUS = 'PENDING_STATUS',
  DECLINED_STATUS = 'DECLINED_STATUS',
  CANCELLED_STATUS = 'CANCELLED_STATUS',
  ARCHIVED_STATUS = 'ARCHIVED_STATUS',
  NO_EVENT_STATUS = 'NO_EVENT_STATUS',
  SCHEDULED_STATUS = 'SCHEDULED_STATUS',
  UPCOMING_STATUS = 'UPCOMING_STATUS',
  PAST_STATUS = 'PAST_STATUS',
  REJECTED_STATUS = 'REJECTED_STATUS',
}

export enum UploadType {
  EVENT_UPLOAD = 'EVENT_UPLOAD', // CSV uploaded for an event
  USER_UPLOAD = 'USER_UPLOAD', // CSV uploaded to add users to the system
}

export enum TicketStatusEnum {
  TICKET_GENERATED = 'TICKET_GENERATED',
  TICKET_USED = 'TICKET_USED',
  TICKET_CANCELED = 'TICKET_CANCELED',
  TICKET_EXPIRED = 'TICKET_EXPIRED',
}

export enum GuestStatus {
  NO_STATUS = 'NO_STATUS', // Default when no status is selected
  DRAFT = 'DRAFT', // Host has created draft but has not yet sent the invitation
  INVITED = 'INVITED', // Host or member invites a user
  CONFIRMED = 'CONFIRMED', // Host or admin approves a guest
  DECLINED = 'DECLINED', // User declines participation in the event after being invited by another user. If the user had initially requested participation, declining deletes the relationship
  APPLIED = 'APPLIED', // User requests to participate in the event
  REFUSED = 'REFUSED', // When the host rejects a user
  REVIEW = 'REVIEW', // When a plus-one accepts an invitation and must be validated by the host
}

export enum ManageGuestsAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum CollaboratorRoles {
  CO_HOST = 'co_host',
  PROMOTER = 'promoter',
  CONTRIBUTOR = 'contributor',
  CHECK_IN = 'check_in',
}

export interface HostsFollowedByGuestInterface {
  followerId: string;
  hostId: string;
}

export enum QuestionValueType {
  STRING,
  NUMBER,
}
