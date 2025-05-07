export enum SchedulerJobType {
  PUBLISH_EVENT = 'PUBLISH_EVENT',
  REMINDER_EVENT = 'REMINDER_EVENT',
  PAST_OR_CANCEL_EVENT = 'PAST_OR_CANCEL_EVENT',
  DELETE_USER = 'DELETE_USER',
  CANCEL_AND_REMOVE_SCHEDULED_JOB = 'CANCEL_AND_REMOVE_SCHEDULED_JOB',
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
};
export type DeleteUserData = {
  id: string;
  deactivatedAt: Date;
};

export type CancelANDRemoveScheduledJobData = {
  jobKey: string;
};

export type SchedulerTriggerPayload =
  | { type: SchedulerJobType.PUBLISH_EVENT; data: PublishEventData }
  | { type: SchedulerJobType.REMINDER_EVENT; data: ReminderEventData }
  | { type: SchedulerJobType.PAST_OR_CANCEL_EVENT; data: EndOrCancelEventData }
  | {
      type: SchedulerJobType.DELETE_USER;
      data: DeleteUserData;
    }
  | {
      type: SchedulerJobType.CANCEL_AND_REMOVE_SCHEDULED_JOB;
      data: CancelANDRemoveScheduledJobData;
    };
