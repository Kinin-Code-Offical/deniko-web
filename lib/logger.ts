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
const logger = pino({
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
    paths: ["password", "token", "secret", "authorization", "cookie"],
    remove: true, // Completely remove sensitive data
  },

  base: {
    env: env.NODE_ENV,
  },

  // ISO timestamp in Production
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
