// import { Provider } from '@nestjs/common';

// import { TWILIO_CONFIG_TOKEN, createTwilioClient } from '../common';
// import { TwilioModuleOptions } from '../interfaces';

// export function createTwilioProviders(options: TwilioModuleOptions): Provider {
//   return {
//     provide: TWILIO_CONFIG_TOKEN,
//     useValue: createTwilioClient(options),
//   };
// }

import { createTwilioClient } from '../common';
import { TwilioModuleOptions } from '../interfaces';

export function createTwilioProvider(options: TwilioModuleOptions) {
  return createTwilioClient(options); // Just return the Twilio client
}
