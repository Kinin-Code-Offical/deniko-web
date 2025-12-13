import pino from "pino";
import { env } from "@/lib/env";

// Edge Runtime check (for Next.js middleware etc.)
const isEdge = env.NEXT_RUNTIME === "edge";
// Use pino-pretty only in Development
const isDev = env.NODE_ENV === "development";

/**
 * Structured logger instance using Pino.
 * Configured for pretty printing in development and JSON in production.
 * Redacts sensitive fields like passwords and tokens.
 */
const baseLogger = pino({
  // 'info' level in Production, 'trace' in Development
  level: isDev ? "trace" : "info",

  // Transport setting: Use pino-pretty only in Development and not Edge
  transport:
    isDev && !isEdge
      ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
      : undefined,

  redact: {
    paths: [
      "password",
      "token",
      "secret",
      "authorization",
      "cookie",
      "email",
      "phoneNumber",
      "creditCard",
      "cvv",
      "access_token",
      "refresh_token",
      "id_token",
    ],
    remove: true, // Completely remove sensitive data
  },

  base: {
    env: env.NODE_ENV,
  },

  // ISO timestamp in Production
  timestamp: pino.stdTimeFunctions.isoTime,
});

type LogEventPayload = {
  event: string;      // "login_success", "password_reset_token_created" etc.
  userId?: string;
  email?: string | null;
  ip?: string | null;
  errorCode?: string;
  errorMessage?: string;
  [key: string]: unknown;
};

// Check if event string is machine-readable (snake_case, no spaces)
function assertMachineReadableEvent(event: string) {
  if (env.NODE_ENV !== "production" && (/\s/.test(event) || /[ğüşöçıİĞÜŞÖÇ]/.test(event))) {
    console.warn( // ignore-console-check
      `[logger] "event" field should be machine-readable (snake_case, no spaces). Received: "${event}"`
    );
  }
}

export const logger = {
  debug(arg: unknown, ...args: unknown[]) {
    if (typeof arg === "object" && arg !== null && "event" in arg) {
      assertMachineReadableEvent((arg as LogEventPayload).event);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseLogger.debug(arg as any, ...(args as any[]));// ignore-any-check
  },
  info(arg: unknown, ...args: unknown[]) {
    if (typeof arg === "object" && arg !== null && "event" in arg) {
      assertMachineReadableEvent((arg as LogEventPayload).event);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseLogger.info(arg as any, ...(args as any[]));// ignore-any-check
  },
  warn(arg: unknown, ...args: unknown[]) {
    if (typeof arg === "object" && arg !== null && "event" in arg) {
      assertMachineReadableEvent((arg as LogEventPayload).event);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseLogger.warn(arg as any, ...(args as any[]));// ignore-any-check
  },
  error(arg: unknown, ...args: unknown[]) {
    if (typeof arg === "object" && arg !== null && "event" in arg) {

      assertMachineReadableEvent((arg as LogEventPayload).event);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseLogger.error(arg as any, ...(args as any[]));// ignore-any-check
  },
};

export default logger;
