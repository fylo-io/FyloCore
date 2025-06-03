export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Ensure the name of the error is the same as the class name
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture the stack trace
    Error.captureStackTrace(this);
  }
}
