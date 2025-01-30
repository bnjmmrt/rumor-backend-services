// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientGrpc } from '@nestjs/microservices';
// import { SOCIAL_SERVICE_NAME, SocialServiceClient } from 'apps/auth/src/grpc/auth/social.pb';
// import { AvailableClients } from '../grpc-clients';
// import { unpackResponse } from '../utils/utils';

// @Injectable()
// export class SocialClient {
//   constructor(
//     @Inject(AvailableClients.AUTH_PACKAGE.packageName)
//     private client: ClientGrpc,
//   ) {}

//   private service: SocialServiceClient;
//   private readonly logger = new Logger(SocialClient.name);

//   onModuleInit() {
//     this.service = this.client.getService<SocialServiceClient>(SOCIAL_SERVICE_NAME);
//   }

//   async syncSocialStats(userId: string, injectedLogger?: Logger) {
//     return unpackResponse(
//       this.service.syncSocialStats({
//         userId: userId,
//       }),
//       'get user members or non members by event id',
//       injectedLogger ?? this.logger,
//     );
//   }
// }
