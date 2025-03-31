import { EventStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import { Event } from 'rumor-utils/shared/entities';
import { convertToEpoch } from '../utils/event.utils';
import * as schedule from 'node-schedule';

export class SchedulerService {
  public static async scheduleEventOnServerRestart() {
    try {
      const events: Event[] = await Event.find();

      events.forEach((e: Event) => {
        if (e.status === EventStatusEnum.APPROVED_STATUS) {
          const eventEndDate = convertToEpoch(e.endDate);
          if (!e.isPublished) {
            this.scheduleEventPublishDate({ id: e.id } as Event);
          } else if (eventEndDate > convertToEpoch(new Date())) {
            this.scheduleEventPastAndCancelledDate({ id: e.id } as Event);
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
        const eventTimeByTimeZone = convertToEpoch(e.publishDate);
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
      const eventTimeByTimeZone = convertToEpoch(e.endDate);
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
}
