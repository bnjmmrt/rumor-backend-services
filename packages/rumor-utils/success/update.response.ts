import { SuccessResponse } from "./base.success.response";

export class UpdateResponse<T> implements SuccessResponse<T> {
    statusCode: number = 201;
    data: T;
    message?: string;
  
    constructor(data?: any, message?: string) {
      this.message = message;
      this.data = data
    }
  }