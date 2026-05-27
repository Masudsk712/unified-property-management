// ============================================================================
// Structured Logging System — Production-Grade Logging
// Supports: JSON logging in production, pretty-print in development,
// log levels, request context, and optional external service integration.
// ============================================================================

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: string;
  stack?: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
}

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    // Structured JSON for log aggregators (Datadog, Logtail, etc.)
    return JSON.stringify(entry);
  }

  // Pretty-print for development
  const colorMap: Record<LogLevel, string> = {
    debug: "\x1b[90m", // gray
    info: "\x1b[36m", // cyan
    warn: "\x1b[33m", // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const color = colorMap[entry.level];

  let output = `${color}[${entry.timestamp}] [${entry.level.toUpperCase()}]${reset}`;

  if (entry.method && entry.path) {
    output += ` ${entry.method} ${entry.path}`;
  }
  if (entry.statusCode) {
    const statusColor =
      entry.statusCode < 400 ? "\x1b[32m" : entry.statusCode < 500 ? "\x1b[33m" : "\x1b[31m";
    output += ` ${statusColor}${entry.statusCode}${reset}`;
  }
  if (entry.duration !== undefined) {
    output += ` ${entry.duration}ms`;
  }
  if (entry.requestId) {
    output += ` [${entry.requestId.slice(0, 8)}]`;
  }

  output += ` — ${entry.message}`;

  if (entry.error) {
    output += `\n  ${color}Error:${reset} ${entry.error}`;
  }
  if (entry.stack) {
    output += `\n${color}${entry.stack}${reset}`;
  }
  if (entry.context && Object.keys(entry.context).length > 0) {
    output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
  }

  return output;
}

function createEntry(
  level: LogLevel,
  message: string,
  meta?: Partial<LogEntry>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
}

function log(
  level: LogLevel,
  message: string,
  meta?: Partial<LogEntry>
): void {
  if (!shouldLog(level)) return;
  const entry = createEntry(level, message, meta);
  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export const logger = {
  debug(message: string, meta?: Partial<LogEntry>) {
    log("debug", message, meta);
  },
  info(message: string, meta?: Partial<LogEntry>) {
    log("info", message, meta);
  },
  warn(message: string, meta?: Partial<LogEntry>) {
    log("warn", message, meta);
  },
  error(message: string, errorOrMeta?: Error | string | Partial<LogEntry>) {
    if (errorOrMeta instanceof Error) {
      log("error", message, {
        error: errorOrMeta.message,
        stack: errorOrMeta.stack,
      });
    } else if (typeof errorOrMeta === "string") {
      log("error", message, { error: errorOrMeta });
    } else {
      log("error", message, errorOrMeta);
    }
  },
};

/**
 * Create a child logger pre-populated with request context.
 * Use this in API routes and middleware for request-scoped logging.
 */
export function createRequestLogger(ctx: {
  requestId?: string;
  path?: string;
  method?: string;
}) {
  return {
    debug(message: string, meta?: Partial<LogEntry>) {
      log("debug", message, { ...meta, ...ctx });
    },
    info(message: string, meta?: Partial<LogEntry>) {
      log("info", message, { ...meta, ...ctx });
    },
    warn(message: string, meta?: Partial<LogEntry>) {
      log("warn", message, { ...meta, ...ctx });
    },
    error(
      message: string,
      errorOrMeta?: Error | string | Partial<LogEntry>
    ) {
      const extra = { ...ctx };
      if (errorOrMeta instanceof Error) {
        Object.assign(extra, { error: errorOrMeta.message, stack: errorOrMeta.stack });
      } else if (typeof errorOrMeta === "string") {
        Object.assign(extra, { error: errorOrMeta });
      } else if (errorOrMeta) {
        Object.assign(extra, errorOrMeta);
      }
      log("error", message, extra);
    },
    /**
     * Log after a request completes — includes status and duration.
     */
    request(statusCode: number, duration: number) {
      const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
      log(level, "Request completed", {
        ...ctx,
        statusCode,
        duration,
      });
    },
  };
}

export default logger;