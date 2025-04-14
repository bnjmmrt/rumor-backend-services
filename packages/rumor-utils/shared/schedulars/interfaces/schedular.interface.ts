export enum SchedulerJobType {
  PUBLISH_EVENT = 'PUBLISH_EVENT',
  REMINDER_EVENT = 'REMINDER_EVENT',
  PAST_OR_CANCEL_EVENT = 'PAST_OR_CANCEL_EVENT',
}

// schedulerPayload.ts
export type PublishEventData = {
  id: string;
  publishDate: Date;
};

export type ReminderEventData = {
  id: string;
  startDate: Date;
  name: string;
};

export type EndOrCancelEventData = {
  id: string;
  endDate: Date;
} ;

export type SchedulerTriggerPayload =
  | { type: SchedulerJobType.PUBLISH_EVENT; data: PublishEventData }
  | { type: SchedulerJobType.REMINDER_EVENT; data: ReminderEventData }
  | { type: SchedulerJobType.PAST_OR_CANCEL_EVENT; data: EndOrCancelEventData };
