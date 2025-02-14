import { BaseError } from "./base.error";

export class AuthorizationError extends BaseError {
    constructor(message: string = 'You do not have permission to perform this action') {
      super(message, 403, 'AUTHORIZATION_ERROR');
    }
  }