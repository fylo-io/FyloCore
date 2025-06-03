import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path from 'path';

import { format } from 'date-fns';

// Define log levels type for type safety
type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

// Get the logs directory and log file path
const logsDir = path.join(__dirname, '../../logs');
const logFilePath = path.join(logsDir, 'server.log');

// Check if the logs directory exists, and create it if it doesn't
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true }); // Create the directory (and any missing parent directories)
}

// Set up a write stream for logging to the file
const logFile = createWriteStream(logFilePath, { flags: 'a' });

/**
 * Returns the current timestamp formatted as YYYY-MM-DD HH:MM:SS
 */
const getTimeStamp = (): string => format(new Date(), 'yyyy-MM-dd HH:mm:ss');

/**
 * Logs a message with the specified level and optional details
 * @param level - The log level (INFO, ERROR, WARN, DEBUG)
 * @param message - The main log message
 * @param details - Optional additional details
 */
const logMessage = (level: LogLevel, message: string, details?: string): void => {
  const logEntry = `[${level}] ${getTimeStamp()} - ${message}${details ? ` - ${details}` : ''}`;

  // Use the appropriate console method based on log level
  if (level === 'ERROR') {
    console.error(logEntry);
  } else if (level === 'WARN') {
    console.warn(logEntry);
  } else {
    console.log(logEntry);
  }

  // Write to the log file
  logFile.write(`${logEntry}\n`);
};

/**
 * Logs an informational message
 * @param message - The message to log
 */
export const logInfo = (message: string): void => {
  logMessage('INFO', message);
};

/**
 * Logs an error message with error details
 * @param message - The error message
 * @param error - The error object or details
 */
export const logError = (message: string, error: unknown): void => {
  const errorDetails = formatErrorDetails(error);
  logMessage('ERROR', message, errorDetails);
};

/**
 * Logs a warning message
 * @param message - The warning message to log
 */
export const logWarn = (message: string): void => {
  logMessage('WARN', message);
};

/**
 * Logs a debug message
 * @param message - The debug message to log
 */
export const logDebug = (message: string): void => {
  logMessage('DEBUG', message);
};

/**
 * Formats error details for logging
 * @param error - The error to format
 * @returns Formatted error details as string
 */
const formatErrorDetails = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};
