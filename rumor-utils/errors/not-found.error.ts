import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
    constructor(resource: string = 'Resource') {
      super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    }
  }