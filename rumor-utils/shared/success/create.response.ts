import { SuccessResponse } from "./base.success.response";

export class CreateResponse<T> implements SuccessResponse<T> {
    statusCode: number = 201;
    message?: string;
    data: T;
  
    constructor(data: T, message?: string) {
      this.data = data;
      this.message = message;
    }
  }