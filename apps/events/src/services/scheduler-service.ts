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
        const eventEndDate = convertToEpoch(e.endDate);
        if (e.status === EventStatusEnum.APPROVED_STATUS) {
          if (!e.isPublished) {
            this.scheduleEventPublishDate({ id: e.id, publishDate: e.publishDate } as Event);
          }
          if (e.startDate) {
            SchedulerService.prepareEventReminderDataAndSchedule({ id: e.id, startDate: e.startDate, name: e.name } as Event)
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

  public static async scheduleEventPublishDate(e: Event) {
    try {
      if (e.publishDate) {
        schedule.scheduleJob(e.publishDate, async () => {
          if (e.id) {
            const savedEvent = await Event.findOne({ where: { id: e.id } });
            if (!savedEvent) {
              return; // Stop execution if the event is deleted
            }
            //TODO:only approved event should be publish
            savedEvent.isPublished = true;
            await savedEvent.save();
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
          if (!savedEvent) {
            return; // Stop execution if the event is deleted
          }
          if (savedEvent.status === EventStatusEnum.APPROVED_STATUS || savedEvent.status === EventStatusEnum.PENDING_STATUS) {
            const st =
              savedEvent.status === EventStatusEnum.APPROVED_STATUS
                ? EventStatusEnum.PAST_STATUS
                : EventStatusEnum.CANCELLED_STATUS;

            savedEvent.status = st;
            await savedEvent.save();
          }
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
      schedule.scheduleJob(reminderTime, async () => {
        const savedEvent = await Event.findOne({ where: { id: e.id }, relations: { location: true } });
        if (!savedEvent) {
          return; // Stop execution if the event is deleted
        }
        if (savedEvent.status === EventStatusEnum.APPROVED_STATUS) {
          console.log(`Executing event reminder for event: ${savedEvent?.name}`);
          await EventsService.sendEventRemindersToAllGuests(savedEvent);
        }
      });
    } catch (err) {
      console.log(`Error in sending event reminder ::`, err);
    }
  }
}
