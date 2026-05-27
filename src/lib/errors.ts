// ============================================================================
// Production-Grade Error Handling System
// Structured errors, error codes, serialization, and API response helpers.
// ============================================================================

// ── Error Codes ────────────────────────────────────────────────────────────

export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  ACCOUNT_EXISTS: "ACCOUNT_EXISTS",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_FIELDS: "MISSING_FIELDS",
  INVALID_INPUT: "INVALID_INPUT",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Rate Limit
  RATE_LIMITED: "RATE_LIMITED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // File Upload
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ── HTTP Status Map ────────────────────────────────────────────────────────

const STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.ACCOUNT_EXISTS]: 409,

  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.MISSING_FIELDS]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,

  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.ALREADY_EXISTS]: 409,
  [ErrorCodes.CONFLICT]: 409,

  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,

  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,

  [ErrorCodes.FILE_TOO_LARGE]: 413,
  [ErrorCodes.INVALID_FILE_TYPE]: 415,
  [ErrorCodes.UPLOAD_FAILED]: 500,
};

// ── AppError Class ─────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      statusCode?: number;
      context?: Record<string, unknown>;
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = options?.statusCode ?? STATUS_MAP[code] ?? 500;
    this.context = options?.context;
    this.cause = options?.cause;

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// ── Convenience Factory Functions ──────────────────────────────────────────

export function notFound(resource = "Resource"): AppError {
  return new AppError(ErrorCodes.NOT_FOUND, `${resource} not found`);
}

export function unauthorized(message = "Authentication required"): AppError {
  return new AppError(ErrorCodes.UNAUTHORIZED, message);
}

export function forbidden(message = "Access denied"): AppError {
  return new AppError(ErrorCodes.FORBIDDEN, message);
}

export function validationError(
  message: string,
  context?: Record<string, unknown>
): AppError {
  return new AppError(ErrorCodes.VALIDATION_ERROR, message, { context });
}

export function internalError(
  message = "An unexpected error occurred",
  cause?: unknown
): AppError {
  return new AppError(ErrorCodes.INTERNAL_ERROR, message, { cause });
}

export function databaseError(cause?: unknown): AppError {
  const message =
    cause instanceof Error ? cause.message : "Database operation failed";
  return new AppError(ErrorCodes.DATABASE_ERROR, message, { cause });
}

// ── Error Serialization (for API responses) ────────────────────────────────

export interface SerializedError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    context?: Record<string, unknown>;
  };
}

/**
 * Serialize an error for safe API responses.
 * Hides internal details in production.
 */
export function serializeError(error: unknown): SerializedError {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        context: error.context,
      },
    };
  }

  // Handle Prisma errors
  if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
    return {
      success: false,
      error: {
        code: ErrorCodes.DATABASE_ERROR,
        message: isProduction
          ? "A database error occurred"
          : error.message,
      },
    };
  }

  // Handle Zod validation errors
  if (error instanceof Error && error.name === "ZodError") {
    return {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Validation failed",
        context: isProduction ? undefined : { details: error.message },
      },
    };
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: isProduction ? "An unexpected error occurred" : message,
    },
  };
}

/**
 * Get the appropriate HTTP status for an error.
 */
export function getErrorStatus(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
    return 500;
  }

  if (error instanceof Error && error.name === "ZodError") {
    return 400;
  }

  return 500;
}

// ── API Response Helper ────────────────────────────────────────────────────

export function errorResponse(
  error: unknown,
  status?: number
): Response {
  const serialized = serializeError(error);
  const statusCode = status ?? getErrorStatus(error);

  return Response.json(serialized, { status: statusCode });
}

export function successResponse<T>(
  data: T,
  options?: { status?: number; message?: string }
): Response {
  return Response.json(
    {
      success: true,
      data,
      message: options?.message,
    },
    { status: options?.status ?? 200 }
  );
}