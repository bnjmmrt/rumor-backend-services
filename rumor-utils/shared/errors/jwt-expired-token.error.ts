import { BaseError } from './base.error';

export class JwtExpiredTokenError extends BaseError {
  constructor(message: string = 'Token has expired') {
    super(message, 401, 'TOKEN_EXPIRED');
    this.name = 'AuthenticationError';
  }
}
