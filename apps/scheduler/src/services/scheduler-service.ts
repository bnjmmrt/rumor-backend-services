import { EventStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import { Event, User, AdminNotification } from 'rumor-utils/shared/entities';
import { convertToEpoch } from 'rumor-utils/shared/events/utils/event.utils';
import * as schedule from 'node-schedule';
import * as dayjs from 'dayjs';
import { BadRequestError } from 'rumor-utils/errors';
import { SchedulerJobType } from 'rumor-utils/shared/schedulers/interfaces/scheduler.interface';
import { NotificationStatus } from 'rumor-utils/shared/notifications/interfaces/notification.interface';
import serviceMesh from '../server/helpers/serviceMeshHandler';
import { IsNull, Not } from 'typeorm';

export class SchedulerService {
  private static scheduledJobs: { [key: string]: schedule.Job } = {};
  /**
   * Cancel and remove a previously scheduled job if it exists.
   */
  private static cancelAndRemoveScheduledJob(jobKey: string): void {
    this.cancelScheduledJob(jobKey);
    this.removeScheduledJob(jobKey);
  }

  /**
   * Cancel a previously scheduled job if exists.
   */
  private static cancelScheduledJob(jobKey: string): void {
    if (SchedulerService.scheduledJobs[jobKey]) {
      SchedulerService.scheduledJobs[jobKey].cancel();
      delete SchedulerService.scheduledJobs[jobKey]; // Cleanup after cancel
    }
  }

  /**
   * Store a job reference for later cancellation if needed.
   */
  private static storeScheduledJob(jobKey: string, job: schedule.Job): void {
    SchedulerService.scheduledJobs[jobKey] = job;
  }

  /**
   * Remove a completed or cancelled job from the scheduledJobs map.
   */
  private static removeScheduledJob(jobKey: string): void {
    delete SchedulerService.scheduledJobs[jobKey];
  }

  /**
   * Trigger the job based on the payload type and data.
   */
  public static async triggerJob(payload: any): Promise<string> {
    const { type, data } = payload;
    if (!type || !data) {
      throw new BadRequestError('Type and data are required.');
    }
    switch (type) {
      case SchedulerJobType.PUBLISH_EVENT:
        await this.scheduleEventPublishDate(data);
        break;
      case SchedulerJobType.REMINDER_EVENT:
        await this.prepareEventReminderDataAndSchedule(data);
        break;
      case SchedulerJobType.PAST_OR_CANCEL_EVENT:
        await this.scheduleEventPastAndCancelledDate(data);
        break;
      case SchedulerJobType.DELETE_USER:
        await this.scheduleUserHardDelete(data);
        break;
      case SchedulerJobType.CANCEL_AND_REMOVE_SCHEDULED_JOB:
        await this.cancelAndRemoveScheduledJob(data.jobKey);
        break;
      case SchedulerJobType.ADMIN_NOTIFICATION:
        await this.scheduleAdminNotification(data);
        break;
      default:
        throw new BadRequestError(`Invalid scheduler type: ${type}`);
    }
    return '';
  }

  public static async scheduleAdminNotification(payload: any): Promise<void> {
    try {
      const jobKey = `${SchedulerJobType.ADMIN_NOTIFICATION}_${payload.id}`;
      const nextMinute = dayjs().add(1, 'minute').toDate();
      const scheduledDate = payload.scheduledDate || nextMinute;

      this.cancelScheduledJob(jobKey);

      const job = schedule.scheduleJob(scheduledDate, async () => {
        if (payload.id) {
          const adminNotification = await AdminNotification.findOne({
            where: { id: payload.id },
          });

          if (!adminNotification) return; // Stop execution if the notification was deleted

          serviceMesh.notificationService().sendAdminNotification(adminNotification.id);

          if(payload.scheduledDate) {
            adminNotification.status = NotificationStatus.SCHEDULED
            await adminNotification.save();
          }
        }
        this.removeScheduledJob(jobKey);
      });
      this.storeScheduledJob(jobKey, job);
    } catch (err) {
      console.log(`Error in scheduling admin notification ::`, err);
    }
  }

  /**
   * Schedule jobs for events after server restart.
   * It checks events and schedules jobs accordingly.
   */
  public static async scheduleEventOnServerRestart() {
    try {
      const events: Event[] = await Event.find();

      events.forEach((e: Event) => {
        const eventEndDate = convertToEpoch(e.endDate);
        if (e.status === EventStatusEnum.APPROVED_STATUS) {
          if (!e.isPublished) {
            this.scheduleEventPublishDate({ id: e.id, publishDate: e.publishDate } as Event);
          }
          if (e.startDate) {
            SchedulerService.prepareEventReminderDataAndSchedule({
              id: e.id,
              startDate: e.startDate,
              name: e.name,
            } as Event);
          }
        }
        if (eventEndDate > convertToEpoch(new Date())) {
          this.scheduleEventPastAndCancelledDate({ id: e.id, endDate: e.endDate } as Event);
        }
      });
    } catch (err) {
      console.log(`Error in scheduling events :: ${err?.message}`);
    }
  }

  public static async scheduleUserHardDeleteRestart() {
    try {
      const users: User[] = await User.find({
        where: {
          isDeactivated: true,
          deactivatedAt: Not(IsNull()) as any,
        },
      });
      users.forEach((u: User) => {
        this.scheduleUserHardDelete(u);
      });
    } catch (e) {
      console.error('Error during scheduled user deletion:', e);
    }
  }

  /**
   * Schedule the event's publish date.
   * Cancels previous job if it's already scheduled and reschedules.
   */
  public static async scheduleEventPublishDate(e: Event) {
    try {
      const jobKey = `${SchedulerJobType.PUBLISH_EVENT}_${e.id}`;
      // Cancel any previously scheduled job
      this.cancelScheduledJob(jobKey);
      if (e.publishDate) {
        const job = schedule.scheduleJob(e.publishDate, async () => {
          if (e.id) {
            const savedEvent = await Event.findOne({ where: { id: e.id } });
            if (!savedEvent) {
              return; // Stop execution if the event is deleted
            }
            //TODO:only approved event should be publish
            savedEvent.isPublished = true;
            await savedEvent.save();
          }
          this.removeScheduledJob(jobKey);
        });
        this.storeScheduledJob(jobKey, job);
      }
    } catch (err) {
      console.log(`Error in publishing events ::`, err);
    }
  }

  /**
   * Schedule event status change to Past or Cancelled.
   * Cancels previous job if it's already scheduled and reschedules.
   */
  public static async scheduleEventPastAndCancelledDate(e: Event) {
    try {
      const jobKey = `${SchedulerJobType.PAST_OR_CANCEL_EVENT}_${e.id}`;
      // Cancel any previously scheduled job
      this.cancelScheduledJob(jobKey);
      if (e.endDate) {
        const job = schedule.scheduleJob(e.endDate, async () => {
          const savedEvent = await Event.findOne({ where: { id: e.id } });
          if (!savedEvent) {
            return; // Stop execution if the event is deleted
          }
          if (
            savedEvent.status === EventStatusEnum.APPROVED_STATUS ||
            savedEvent.status === EventStatusEnum.PENDING_STATUS
          ) {
            const st =
              savedEvent.status === EventStatusEnum.APPROVED_STATUS
                ? EventStatusEnum.PAST_STATUS
                : EventStatusEnum.CANCELLED_STATUS;

            savedEvent.status = st;
            await savedEvent.save();
          }
          this.removeScheduledJob(jobKey);
        });
        this.storeScheduledJob(jobKey, job);
      }
    } catch (err) {
      console.log(`Error in setting status to cancel or past event ::`, err);
    }
  }

  public static async scheduleUserHardDelete(user: User) {
    // Calculate the deletion time (30 days after deactivation)
    let deactivationDate = new Date(user.deactivatedAt);
    try {
      const deletionTime = new Date(deactivationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      // If the deletion time is in the past, skip scheduling
      const now = new Date();
      if (deletionTime <= now) {
        return;
      }
      const jobKey = `${SchedulerJobType.DELETE_USER}_${user.id}`;
      this.cancelScheduledJob(jobKey); // Cancel if already scheduled
      const job = schedule.scheduleJob(deletionTime, async () => {
        const foundUser = await User.findOne({ where: { id: user.id } });
        await serviceMesh.userService().permanantlyDeleteAccount(foundUser.id);
        this.removeScheduledJob(jobKey);
      });
      this.storeScheduledJob(jobKey, job);
    } catch (err) {
      console.error('Error during scheduled user deletion:', err);
    }
  }

  /**
   * Schedules an event reminder 24 hours before the event's start time.
   *
   * This function calculates the reminder time (24 hours before `event.startDate` in UTC)
   * and schedules a job using `node-schedule`. If the event start time is less than 24 hours
   * from the current time, no reminder will be scheduled. When the job executes, it checks whether
   * the event exists and has an `APPROVED_STATUS`. If so, it triggers the `sendEventRemindersToAllGuests`
   * function to notify all guests.
   *
   * @param {Event} e - The event for which the reminder needs to be scheduled.
   * @returns {Promise<void>} - A promise that resolves when the scheduling is complete, or no action is taken if the event starts in less than 24 hours.
   */
  public static async prepareEventReminderDataAndSchedule(e: Event): Promise<void> {
    try {
      const reminderTime = new Date(e.startDate);
      reminderTime.setUTCHours(reminderTime.getUTCHours() - 24); // 24 hours before event
      const currentTime = new Date();
      // If the event starts in less than 24 hours, not scheduling a reminder
      if (reminderTime <= currentTime) {
        return;
      }
      const jobKey = `${SchedulerJobType.REMINDER_EVENT}_${e.id}`;
      // Cancel any previously scheduled reminder job
      this.cancelScheduledJob(jobKey);
      const job = schedule.scheduleJob(reminderTime, async () => {
        const savedEvent: Event = await Event.findOne({
          where: { id: e.id },
        });
        if (!savedEvent) {
          return; // Stop execution if the event is deleted
        }
        if (savedEvent.status === EventStatusEnum.APPROVED_STATUS) {
          console.log(`Executing event reminder for event: ${savedEvent?.name}`);
          try {
            serviceMesh.eventService().sendEventRemindersToAllGuests(savedEvent.id);
          } catch (err) {
            console.log(`Error in sending event reminder ::`, err);
          }
        }
        this.removeScheduledJob(jobKey);
      });
      this.storeScheduledJob(jobKey, job);
    } catch (err) {
      console.log(`Error in sending event reminder ::`, err);
    }
  }
}
