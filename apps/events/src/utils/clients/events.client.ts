import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { EVENTS_SERVICE_NAME, EventsServiceClient } from 'apps/events/src/grpc/events/events.pb';
import { AvailableClients } from '../grpc-clients';
import { unpackResponse } from '../utils/utils';

@Injectable()
export class EventsClient {
  constructor(
    @Inject(AvailableClients.EVENTS_PACKAGE.packageName)
    private client: ClientGrpc,
  ) {}

  private service: EventsServiceClient;
  private readonly logger = new Logger(EventsClient.name);

  onModuleInit() {
    this.service = this.client.getService<EventsServiceClient>(EVENTS_SERVICE_NAME);
  }

  async validatePublishEvents(injectedLogger?: Logger) {
    return unpackResponse(this.service.publishPendingEvents({}), 'publish pending events', injectedLogger ?? this.logger);
  }

  async syncUserTopAttendee(injectedLogger?: Logger) {
    return unpackResponse(this.service.syncUserTopAttendee({}), 'sync user top attendee', injectedLogger ?? this.logger);
  }
}
