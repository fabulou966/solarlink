import "server-only";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>, traceId?: string): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    traceId,
  };
}

function writeLog(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  if (entry.level === "error" || entry.level === "warn") {
    console.error(output);
  } else {
    console.log(output);
  }
}

function getTraceId(): string {
  return `trc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("debug")) return;
    writeLog(formatEntry("debug", message, context, getTraceId()));
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("info")) return;
    writeLog(formatEntry("info", message, context, getTraceId()));
  },

  warn(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("warn")) return;
    writeLog(formatEntry("warn", message, context, getTraceId()));
  },

  error(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("error")) return;
    writeLog(formatEntry("error", message, context, getTraceId()));
  },

  child(context: Record<string, unknown>) {
    return {
      debug: (msg: string, extra?: Record<string, unknown>) => this.debug(msg, { ...context, ...extra }),
      info: (msg: string, extra?: Record<string, unknown>) => this.info(msg, { ...context, ...extra }),
      warn: (msg: string, extra?: Record<string, unknown>) => this.warn(msg, { ...context, ...extra }),
      error: (msg: string, extra?: Record<string, unknown>) => this.error(msg, { ...context, ...extra }),
    };
  },
};

export function createRequestLogger(headers: Headers) {
  const traceId = headers.get("x-trace-id") ?? getTraceId();
  return logger.child({ traceId, ip: headers.get("x-forwarded-for") ?? headers.get("x-real-ip") });
}