import { BaseError } from './base.error';

export class MethodNotAllowedError extends BaseError {
  constructor(message: string) {
    super(message, 405, 'METHOD_NOT_ALLOWED_ERROR');
  }
}
