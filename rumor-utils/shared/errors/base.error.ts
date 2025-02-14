export class BaseError extends Error {
    constructor(
      public message: string,
      public statusCode: number = 500,
      public code: string = 'INTERNAL_SERVER_ERROR',
      public data?: any
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  
    toJSON() {
      return {
        error: {
          name: this.name,
          code: this.code,
          message: this.message,
          statusCode: this.statusCode,
          data: this.data,
        },
      };
    }
  }