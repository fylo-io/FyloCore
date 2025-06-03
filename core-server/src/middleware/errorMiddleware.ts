import { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError';
import { logError } from '../utils/logger';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction,
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof AppError ? error.message : 'Internal Server Error';

  // Log the error
  logError('Express Error', error);

  // Respond with a structured error response
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};
