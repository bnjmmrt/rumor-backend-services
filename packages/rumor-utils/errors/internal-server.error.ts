
import { BaseError } from './base.error';

export class InternalServerError extends BaseError {
    constructor(error: Error) {
      const message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : error.message;
        
      super(message, 500, 'INTERNAL_SERVER_ERROR');
      this.name = 'InternalServerError';
    }
  }