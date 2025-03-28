import { BaseError } from './base.error';

export class SendGridError extends BaseError {
  constructor(message: string = 'Sendgrid service failed') {
    super(message, 504, 'SENDGRID_ERROR');
  }
}
