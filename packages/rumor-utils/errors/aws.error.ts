import { BaseError } from "./base.error";

export class AWSError extends BaseError {
    constructor(message: string = 'AWS service failed') {
      super(message, 504, 'AWS Service Error');
    }
  }