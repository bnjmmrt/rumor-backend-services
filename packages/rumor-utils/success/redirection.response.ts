import { SuccessResponse } from './base.success.response';

export class RedirectionResponse<T> implements SuccessResponse<T> {
  success: boolean = true;
  statusCode: number = 206;
  message?: string;
  data?: T;

  constructor(data?: T, message?: string) {
    this.data = data;
    this.message = message;
  }
}
