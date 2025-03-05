import { SuccessResponse } from "./base.success.response";
export class UpdateResponse<T> implements SuccessResponse<T> {
  statusCode: number = 204;
  message?: string;
  data: T;

  constructor(data: T, message?: string) {
    this.data = data;
    this.message = message;
  }
}