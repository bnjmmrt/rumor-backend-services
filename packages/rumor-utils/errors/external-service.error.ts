import { BaseError } from './base.error';

export class ExternalServiceError extends BaseError {
  constructor(service: string, error?: any) {
    super(
      `Error calling external service: ${service}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      process.env.NODE_ENV === 'development' ? error : undefined,
    );
  }
}
