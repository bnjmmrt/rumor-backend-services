// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientGrpc } from '@nestjs/microservices';
// import { AvailableClients } from '../grpc-clients';
// import { NOTIFICATION_SERVICE_NAME, NotificationServiceClient } from 'apps/notification/src/grpc/notification/notification.pb';

// @Injectable()
// export class CommunicationClient {
//   constructor(
//     @Inject(AvailableClients.COMMUNICATION_PACKAGE.packageName)
//     private client: ClientGrpc,
//   ) {}

//   private service: NotificationServiceClient;
//   private readonly logger = new Logger(CommunicationClient.name);

//   onModuleInit() {
//     this.service = this.client.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME);
//   }
// }
