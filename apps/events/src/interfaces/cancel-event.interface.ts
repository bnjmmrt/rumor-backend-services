export interface CancelEventInterface {
  ownerId: string;
  eventId: string;
  customMessage?: string | undefined;
  fromAdmin?: string | undefined;
}
