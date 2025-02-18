import { SuccessResponse } from "./base.success.response";

export class DeleteResponse implements SuccessResponse<void> {
  statusCode: number = 204; // Or 200, depending on your preference
  message?: string;
  data: void = undefined; // Explicitly set data to undefined

  constructor(message?: string) {
    this.message = message;
  }
}