import { EventStatusEnum } from 'rumor-utils/shared/events/interfaces/event.interface';
import { Event } from 'rumor-utils/shared/entities';
import { convertToEpoch } from '../utils/event.utils';
// import schedule from 'node-schedule';
import * as schedule from 'node-schedule';


export class SchedulerService {
  public static async scheduleEventOnServerRestart() {
    const events: Event[] = await Event.find();
    // console.log("🚀 ~ SchedulerService ~ scheduleEventOnServerRestart ~ events:", events.length)
    const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    /**
     * 1. Event with status is approved and isPublished to false. -> scheduleEventPublishDate
     * 2. Event with endDate greater than current date. -> scheduleEventPastAndCancelledDate
     */
    events.forEach((e: Event) => {
      if (e.status === EventStatusEnum.APPROVED_STATUS) {
        const serverEndDate = convertToEpoch(e.endDate, serverTimeZone);
        if (!e.isPublished) {
          console.log("🚀 ~ SchedulerService ~ events.forEach ~ serverEndDate:", serverEndDate)
          console.log('convertToEpoch(new Date(), serverTimeZone)', convertToEpoch(new Date(), serverTimeZone))
          this.scheduleEventPublishDate({ id: e.id } as Event);
        } else if (serverEndDate < convertToEpoch(new Date(), serverTimeZone)) {
          this.scheduleEventPastAndCancelledDate({ id: e.id } as Event);
        }
      }
    });
  }

  public static async scheduleEventPublishDate(e: Event) {
    const savedEvent = await Event.findOne({ where: { id: e.id } });
    if (savedEvent) {
      const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (savedEvent?.publishDate) {
        const eventTimeByTimeZone = convertToEpoch(savedEvent.publishDate, serverTimeZone);
        schedule.scheduleJob(eventTimeByTimeZone, async () => {
          try {
            savedEvent.isPublished = true;
            await savedEvent.save();
            console.log(`Event ${savedEvent?.id} is 'Published' at ${new Date()}.`);
          } catch (error) {
            console.error(`Error publishing event `, error);
          }
        });
        await this.scheduleEventPastAndCancelledDate(savedEvent);
      }
    }
  }

  public static async scheduleEventPastAndCancelledDate(e: Event) {
    const savedEvent = await Event.findOne({ where: { id: e.id } });
    
    // console.log("🚀 ~ SchedulerService ~ scheduleEventPastAndCancelledDate ~ savedEvent:", savedEvent?.name)
    if (savedEvent) {
      const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const eventTimeByTimeZone = convertToEpoch(savedEvent.endDate, serverTimeZone);
      // console.log("🚀 ~ SchedulerService ~ scheduleEventPastAndCancelledDate ~ eventTimeByTimeZone:", eventTimeByTimeZone)

      const st =
        savedEvent.status === EventStatusEnum.APPROVED_STATUS
          ? EventStatusEnum.PAST_STATUS
          : EventStatusEnum.CANCELLED_STATUS;

      schedule.scheduleJob(eventTimeByTimeZone, async () => {
        try {
          console.log('inside past')
          savedEvent.status = st;
          await savedEvent.save();
          console.log(`Event ${savedEvent?.id} updated to ${st} at ${new Date()}.`);
        } catch (error) {
          console.error(`Error updating event status to ${st}`, error);
        }
      });
    }
  }

  public static async scheduleUserHardDelete() {}
}
