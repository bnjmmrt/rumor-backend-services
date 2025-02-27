// import * as Twilio from 'twilio';

// // import { TwilioClient, TwilioModuleOptions } from '../interfaces';

// export function createTwilioClient(options: TwilioModuleOptions): TwilioClient {
//   const client = Twilio(options.accountSid, options.authToken, options.options);

//   return client;
// }

import Twilio from "twilio";
import { TwilioClient, TwilioModuleOptions } from '../interfaces';


export function createTwilioClient(options: TwilioModuleOptions) : TwilioClient {
  return Twilio(options.accountSid, options.authToken, options.options);
}
