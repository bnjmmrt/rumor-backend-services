// import { Inject } from '@nestjs/common';

// import { TwilioDecorator } from '../interfaces/twilio-decorator.interface';
// import { TWILIO_CONFIG_TOKEN } from './twilio.constants';

// export function InjectTwilio(): TwilioDecorator {
//   return Inject(TWILIO_CONFIG_TOKEN);
// }


import { TWILIO_CONFIG_TOKEN } from "./twilio.constants";

// Function to get Twilio configuration
export function getTwilioConfig() {
  return TWILIO_CONFIG_TOKEN;
}
