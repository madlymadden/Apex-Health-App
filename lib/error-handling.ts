export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }

  public field?: string;
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', 500);
    this.originalError = originalError;
  }

  public originalError?: Error;
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 503);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429);
  }
}

// Error handler utility functions
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

export const createErrorResponse = (error: AppError) => {
  return {
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    }
  };
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Client-side error handling utilities
export const handleClientError = (error: any, context?: string) => {
  console.error(`Client Error${context ? ` in ${context}` : ''}:`, error);
  
  // In development, log full error
  if (__DEV__) {
    console.error('Full error details:', error);
  }

  // Return user-friendly message
  if (error instanceof AppError) {
    return error.message;
  }

  // Handle network errors
  if (error.message?.includes('Network request failed')) {
    return 'Network connection error. Please check your internet connection.';
  }

  // Handle timeout errors
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Default error message
  return 'An unexpected error occurred. Please try again.';
};

// Error logging utility
export const logError = (error: Error, context?: string, userId?: string) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    userId,
    timestamp: new Date().toISOString(),
    isOperational: error instanceof AppError ? error.isOperational : false,
  };

  // In production, send to error tracking service
  if (!__DEV__) {
    // TODO: Integrate with error tracking service (Sentry, etc.)
    console.error('Production Error:', JSON.stringify(errorData));
  } else {
    console.error('Development Error:', errorData);
  }
};

// Error boundary fallback component
export const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return {
    error,
    resetError,
    getUserFriendlyMessage: () => handleClientError(error),
  };
};

// Validation helper
export const validateRequired = (value: any, fieldName: string) => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  return true;
};

// Email validation
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
  return true;
};

// Password validation
export const validatePassword = (password: string) => {
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long', 'password');
  }
  return true;
};

// Numeric validation
export const validateNumeric = (value: any, fieldName: string, min?: number, max?: number) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName);
  }
  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }
  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
  }
  return true;
};

// Date validation
export const validateDate = (value: any, fieldName: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`, fieldName);
  }
  return true;
};

// Array validation
export const validateArray = (value: any, fieldName: string, minLength?: number, maxLength?: number) => {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName);
  }
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(`${fieldName} must have at least ${minLength} items`, fieldName);
  }
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${maxLength} items`, fieldName);
  }
  return true;
};

// UUID validation
export const validateUUID = (value: string, fieldName: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`, fieldName);
  }
  return true;
};
