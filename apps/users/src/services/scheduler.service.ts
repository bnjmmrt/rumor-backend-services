// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { EventsClient } from '@rumor/shared/clients/events.client';

// @Injectable()
// export class SchedulerService {
//   private readonly logger = new Logger(SchedulerService.name);

//   constructor(
//     @Inject(EventsClient)
//     private readonly eventClient: EventsClient,
//   ) {}

//   @Cron(CronExpression.EVERY_MINUTE)
//   public async validatePublishEvents(): Promise<void> {
//     this.logger.log('Executing validatePublishEvents');
//     await this.eventClient.validatePublishEvents();
//   }

//   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
//   public async syncUserTopAttendee(): Promise<void> {
//     this.logger.log('Executing syncUserTopAttendee');
//     await this.eventClient.syncUserTopAttendee();
//   }
// }
