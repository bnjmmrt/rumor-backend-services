import { BaseError } from "./base.error";

export class InternalServerError extends BaseError {
  constructor(error: Error) {
    const message = error.message;
    super(message, 500, "INTERNAL_SERVER_ERROR");
    this.name = "InternalServerError";
  }
}
