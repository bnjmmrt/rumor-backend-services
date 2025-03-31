import { EventStatusEnum } from 'packages/rumor-utils/shared/events/interfaces/event.interface';
import { Event } from 'rumor-utils/shared/entities';
import { extractDate } from 'src/utils/event.utils';
import schedule from 'node-schedule';

export class SchedulerService {
  public static async scheduleEventOnServerRestart() {
    const events: Event[] = await Event.find();
    const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    /**
     * 1. Event with publishDate greater than current date, status is approved and isPublished to false. -> scheduleEventPublishDate
     * 2. Event with endDate greadter than current date. -> scheduleEventPastDate
     */
    events.forEach((e: Event) => {
      if (e.status === EventStatusEnum.APPROVED_STATUS) {
        const serverEndDate = extractDate(e.endDate, serverTimeZone);
        if (!e.isPublished) {
          this.scheduleEventPublishDate({ id: e.id } as Event);
        } else if (serverEndDate < extractDate(new Date(), serverTimeZone)) {
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
        const eventTimeByTimeZone = extractDate(savedEvent.publishDate, serverTimeZone);
        schedule.scheduleJob(eventTimeByTimeZone, async () => {
          try {
            savedEvent.isPublished = true;
            await savedEvent.save();
            console.log(`Event ${savedEvent?.id} updated to 'past' at ${new Date()}.`);
          } catch (error) {
            console.error(`Error updating event status to PAST`, error);
          }
        });
        await this.scheduleEventPastAndCancelledDate(savedEvent);
      }
    }
  }

  public static async scheduleEventPastAndCancelledDate(e: Event) {
    const savedEvent = await Event.findOne({ where: { id: e.id } });
    if (savedEvent) {
      const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const eventTimeByTimeZone = extractDate(savedEvent.endDate, serverTimeZone);

      const st =
        savedEvent.status === EventStatusEnum.APPROVED_STATUS
          ? EventStatusEnum.PAST_STATUS
          : EventStatusEnum.CANCELLED_STATUS;

      schedule.scheduleJob(eventTimeByTimeZone, async () => {
        try {
          savedEvent.status = st;
          await savedEvent.save();
          console.log(`Event ${savedEvent?.id} updated to 'past' at ${new Date()}.`);
        } catch (error) {
          console.error(`Error updating event status to PAST`, error);
        }
      });
    }
  }

  public static async scheduleUserHardDelete() {}
}
