import { BaseError } from './base.error';

export class RateLimitError extends BaseError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}
