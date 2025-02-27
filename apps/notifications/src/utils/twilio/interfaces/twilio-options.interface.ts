// import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
// import { RequestClientOptions } from 'twilio/lib/rest/Twilio';
// export interface TwilioModuleOptions {
//   accountSid: string | undefined;
//   authToken: string | undefined;
//   options?: RequestClientOptions | undefined;
// }

// export interface TwilioOptionsFactory {
//   createTwilioOptions(): Promise<TwilioModuleOptions> | TwilioModuleOptions;
// }

// export interface TwilioModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
//   // eslint-disable-next-line
//   inject?: any[];
//   useClass?: Type<TwilioOptionsFactory>;
//   useExisting?: Type<TwilioOptionsFactory>;
//   useFactory?: (
//     // eslint-disable-next-line
//     ...args: any[]
//   ) => Promise<TwilioModuleOptions> | TwilioModuleOptions;
// }

import { RequestClientOptions } from "twilio/lib/rest/Twilio";

/**
 * Represents Twilio module options
 */
export interface TwilioModuleOptions {
  accountSid: string | undefined;
  authToken: string | undefined;
  options?: RequestClientOptions | undefined;
}

/**
 * Interface for defining a factory that creates Twilio module options
 */
export interface TwilioOptionsFactory {
  createTwilioOptions(): Promise<TwilioModuleOptions> | TwilioModuleOptions;
}

/**
 * Interface for defining async Twilio module options
 */
export interface TwilioModuleAsyncOptions {
  inject?: any[];
  useClass?: new (...args: any[]) => TwilioOptionsFactory;
  useExisting?: new (...args: any[]) => TwilioOptionsFactory;
  useFactory?: (...args: any[]) => Promise<TwilioModuleOptions> | TwilioModuleOptions;
}

