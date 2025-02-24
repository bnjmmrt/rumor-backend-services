import { BaseError } from "./base.error";

export class TimeoutError extends BaseError {
    constructor(message: string = 'Request timeout') {
      super(message, 504, 'TIMEOUT_ERROR');
    }
  }