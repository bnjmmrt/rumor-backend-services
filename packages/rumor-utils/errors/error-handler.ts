import { Request, Response, NextFunction } from 'express';
import { BaseError } from './base.error';
import { JwtInvalidTokenError } from './jwt-invalid-token.error';
import { JwtExpiredTokenError } from './jwt-expired-token.error';
import { InternalServerError } from './internal-server.error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // If it's already one of our custom errors, return it directly
  if (error instanceof BaseError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Convert known JWT errors to our custom error classes
  if (error.name === 'JsonWebTokenError') {
    const customError = new JwtInvalidTokenError();
    return res.status(customError.statusCode).json(customError.toJSON());
  }

  if (error.name === 'TokenExpiredError') {
    const customError = new JwtExpiredTokenError();
    return res.status(customError.statusCode).json(customError.toJSON());
  }

  // Handle unknown errors
  const internalError = new InternalServerError(error);
  return res.status(internalError.statusCode).json(internalError.toJSON());
};