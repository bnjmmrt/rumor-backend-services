import { EventStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import { Event } from 'rumor-utils/shared/entities';
import { convertToEpoch } from '../utils/event.utils';
import * as schedule from 'node-schedule';
import { EventsService } from './events.service';

export class SchedulerService {
  public static async scheduleEventOnServerRestart() {
    try {
      const events: Event[] = await Event.find();

      events.forEach((e: Event) => {
        if (e.status === EventStatusEnum.APPROVED_STATUS) {
          const eventEndDate = convertToEpoch(e.endDate);
          if (!e.isPublished) {
            this.scheduleEventPublishDate({ id: e.id, publishDate: e.publishDate } as Event);
          } else if (eventEndDate > convertToEpoch(new Date())) {
            this.scheduleEventPastAndCancelledDate({ id: e.id, endDate: e.endDate } as Event);
          }
        }
      });
    } catch (err) {
      console.log(`Error in scheduling events :: ${err?.message}`);
    }
  }

  public static async scheduleEventPublishDate(e: Event) {
    try {
      if (e.publishDate) {
        schedule.scheduleJob(e.publishDate, async () => {
          if (e.id) {
            const savedEvent = await Event.findOne({ where: { id: e.id } });
            savedEvent.isPublished = true;
            await savedEvent.save();
            this.scheduleEventPastAndCancelledDate({
              id: savedEvent.id,
              endDate: savedEvent.endDate,
            } as Event);
          }
        });
      }
    } catch (err) {
      console.log(`Error in publishing events ::`, err);
    }
  }

  public static async scheduleEventPastAndCancelledDate(e: Event) {
    try {
      if (e.endDate) {
        schedule.scheduleJob(e.endDate, async () => {
          const savedEvent = await Event.findOne({ where: { id: e.id } });
          const st =
            savedEvent.status === EventStatusEnum.APPROVED_STATUS
              ? EventStatusEnum.PAST_STATUS
              : EventStatusEnum.CANCELLED_STATUS;

          savedEvent.status = st;
          await savedEvent.save();
        });
      }
    } catch (err) {
      console.log(`Error in setting status to cancel or past event ::`, err);
    }
  }

  public static async scheduleUserHardDelete() {}

  /**
   * Schedules an event reminder 24 hours before the event's start time.
   *
   * This function calculates the reminder time (24 hours before `event.startDate` in UTC)
   * and schedules a job using `node-schedule`. When the job executes, it triggers
   * the `sendEventRemindersToAllGuests` function to notify all guests.
   *
   * @param {Object} params - Function parameters.
   * @param {Event} params.event - The event for which the reminder needs to be scheduled.
   * @returns {Promise<void>} - A promise that resolves when the scheduling is complete.
   */
  public static async prepareEventReminderDataAndSchedule({
    event,
  }: {
    event: Event;
  }): Promise<void> {
    const reminderTime = new Date(event.startDate);
    reminderTime.setUTCHours(reminderTime.getUTCHours() - 24); // 24 hours before event
    schedule.scheduleJob(reminderTime, async () => {
      console.log(`Executing event reminder for event: ${event.id}`);
      await EventsService.sendEventRemindersToAllGuests(event);
    });
  }
}
