import { Socket } from 'socket.io';

import { AppError } from './AppError';
import { logError } from './logger';

interface ErrorOptions {
  logToConsole?: boolean;
  socket?: Socket;
  userMessage?: string;
}

export const handleErrors = (
  message: string,
  error: Error | null = null,
  options: ErrorOptions = {},
): void => {
  const { logToConsole = true, socket, userMessage } = options;

  // Determine if the error is operational or unexpected
  const isOperational = error instanceof AppError ? error.isOperational : false;

  // Log error details (include operational status for better tracking)
  logError(message, {
    name: error?.name || 'UnknownError',
    message: error?.message || 'An unexpected error occurred',
    stack: error?.stack,
    operational: isOperational,
  });

  if (logToConsole) {
    console.error(`[Error Handler] ${message}`, error);
  }

  // Send a user-friendly error message to the client
  if (socket && userMessage) {
    socket.emit('error', userMessage);
  }
};
