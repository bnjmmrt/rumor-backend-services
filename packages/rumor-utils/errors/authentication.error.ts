import { BaseError } from './base.error';

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}
