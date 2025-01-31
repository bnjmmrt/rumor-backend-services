// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientGrpc } from '@nestjs/microservices';
// import { AvailableClients } from '../grpc-clients';
// import { unpackResponse } from '../utils/utils';
// import { PLATFORM_SERVICE_NAME, PlatformServiceClient } from 'apps/platform/src/grpc/platform/platform.pb';

// @Injectable()
// export class PlatformClient {
//   constructor(
//     @Inject(AvailableClients.PLATFORM_PACKAGE.packageName)
//     private client: ClientGrpc,
//   ) {}

//   private service: PlatformServiceClient;
//   private readonly logger = new Logger(PlatformClient.name);

//   onModuleInit() {
//     this.service = this.client.getService<PlatformServiceClient>(PLATFORM_SERVICE_NAME);
//   }

//   async getUserFocuses(id: string, injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.getUserFocuses({
//         id,
//       }),
//       'getting user focuses',
//       injectedLogger ?? this.logger,
//     );
//   }

//   async saveFocusesForUser(userId: string, focusIds: string[], injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.saveFocusesForUser({
//         userId,
//         focusIds,
//       }),
//       'saving focuses for user',
//       injectedLogger ?? this.logger,
//     );
//   }

//   async getUserInterests(id: string, injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.getUserInterests({
//         id,
//       }),
//       'getting user interests',
//       injectedLogger ?? this.logger,
//     );
//   }

//   async getVouchRequests(id: string, injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.getVouchRequests({
//         id,
//       }),
//       'get vouch requests',
//       injectedLogger ?? this.logger,
//     );
//   }

//   async getUserVouches(id: string, injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.getUserVouches({
//         id,
//       }),
//       'get user vouches',
//       injectedLogger ?? this.logger,
//     );
//   }

//   async getFeaturedEventSection(id: string, injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.getFeaturedEventSection({
//         id,
//       }),
//       'getting featued event section',
//       injectedLogger ?? this.logger,
//     );
//   }
// }
