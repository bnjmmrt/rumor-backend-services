// import { DynamicModule, Module } from '@nestjs/common';

// import { TwilioModuleAsyncOptions, TwilioModuleOptions } from './interfaces';
// import { TwilioCoreModule } from './twilio-core.module';

// @Module({})
// export class TwilioModule {
//   public static forRoot(options: TwilioModuleOptions): DynamicModule {
//     return {
//       module: TwilioModule,
//       imports: [TwilioCoreModule.forRoot(options)],
//     };
//   }

//   public static forRootAsync(options: TwilioModuleAsyncOptions): DynamicModule {
//     return {
//       module: TwilioModule,
//       imports: [TwilioCoreModule.forRootAsync(options)],
//     };
//   }
// }

import { createTwilioClient } from './common';
import { TwilioModuleOptions, TwilioModuleAsyncOptions } from './interfaces';

export class TwilioModule {
  static forRoot(options: TwilioModuleOptions) {
    return createTwilioClient(options); // Return Twilio client instance
  }

  static async forRootAsync(options: TwilioModuleAsyncOptions) {
    if (options.useFactory) {
      const resolvedOptions = await options.useFactory(...(options.inject || []));
      return createTwilioClient(resolvedOptions);
    }
    throw new Error('TwilioModuleAsyncOptions must include a useFactory function');
  }
}
