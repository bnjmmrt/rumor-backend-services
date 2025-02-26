// import { Module } from '@nestjs/common';
// import { AvailableClients, registerClientModule } from './grpc-clients';

// import { AuthClient } from './clients/auth.client';
// import { CommunicationClient } from './clients/communication.client';
// import { PlatformClient } from './clients/platform.client';
// import { EventsClient } from './clients/events.client';
// import { SocialClient } from './clients/social.client';

// @Module({
//   providers: [AuthClient, CommunicationClient, PlatformClient, EventsClient, SocialClient],
//   exports: [AuthClient, CommunicationClient, PlatformClient, EventsClient, SocialClient],
//   imports: [
//     registerClientModule([
//       AvailableClients.AUTH_PACKAGE,
//       AvailableClients.COMMUNICATION_PACKAGE,
//       AvailableClients.PLATFORM_PACKAGE,
//       AvailableClients.EVENTS_PACKAGE,
//       AvailableClients.NOTIFICATION_PACKAGE,
//     ]),
//   ],
// })
// export class SharedModule {}
