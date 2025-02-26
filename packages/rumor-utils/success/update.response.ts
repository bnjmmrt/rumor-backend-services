import { SuccessResponse } from "./base.success.response";

export class UpdateResponse implements SuccessResponse<void> {
    statusCode: number = 204;
    message?: string;
    data: void = undefined; // Explicitly set data to undefined
  
    constructor(message?: string) {
      this.message = message;
    }
  }