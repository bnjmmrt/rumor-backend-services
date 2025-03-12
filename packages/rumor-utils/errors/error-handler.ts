import { Request, Response, NextFunction } from "express";
import { BaseError } from "./base.error";
import { InternalServerError } from "./internal-server.error";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  // If it's already one of our custom errors, return it directly
  if (error instanceof BaseError) {
    res.status(error.statusCode).json(error.toJSON());
  } else {
    // Handle unknown errors
    const internalError = new InternalServerError(error);
    res.status(internalError.statusCode).json(internalError.toJSON());
  }
};
