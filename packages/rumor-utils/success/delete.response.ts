import { SuccessResponse } from "./base.success.response";

export class DeleteResponse<T> implements SuccessResponse<T> {
  success: boolean = true;
  statusCode: number = 202;
  message?: string;
  data?: T;

  constructor(data?: T, message?: string) {
    this.data = data;
    this.message = message;
  }
}