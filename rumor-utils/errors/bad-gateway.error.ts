import { BaseError } from "./base.error";

export class BadGatewayError extends BaseError {
    constructor(message: string) {
      super(message, 502, 'BAD_GATEWAY_ERROR');
    }
  }