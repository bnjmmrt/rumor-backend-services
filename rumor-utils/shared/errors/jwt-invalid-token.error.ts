import { BaseError } from './base.error';

export class JwtInvalidTokenError extends BaseError {
  constructor(message: string = 'Invalid token provided') {
    super(message, 401, 'INVALID_TOKEN');
    this.name = 'AuthenticationError';
  }
}