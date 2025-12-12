import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_RUNTIME: z.enum(["edge", "nodejs"]).optional(),
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),
  INSTANCE_CONNECTION_NAME: z.string().optional(),
  DIRECT_URL: z.string().url().optional(),
  DATABASE_SSL_CA: z.string().optional(),
  DATABASE_SSL_CERT: z.string().optional(),
  DATABASE_SSL_KEY: z.string().optional(),
  DATABASE_SSL_SKIP_VERIFY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  NEXTAUTH_URL: z.string().url({ message: "NEXTAUTH_URL must be a valid URL" }),

  // Storage
  GCS_BUCKET_NAME: z
    .string()
    .min(1, { message: "GCS_BUCKET_NAME is required" }),
  GCS_PROJECT_ID: z.string().min(1, { message: "GCS_PROJECT_ID is required" }),
  GCS_CLIENT_EMAIL: z
    .string()
    .email({ message: "GCS_CLIENT_EMAIL must be a valid email" }),
  GCS_PRIVATE_KEY: z
    .string()
    .min(1, { message: "GCS_PRIVATE_KEY is required" }),

  // Auth
  AUTH_SECRET: z.string().min(1, { message: "AUTH_SECRET is required" }),
  AUTH_GOOGLE_ID: z.string().min(1, { message: "AUTH_GOOGLE_ID is required" }),
  AUTH_GOOGLE_SECRET: z
    .string()
    .min(1, { message: "AUTH_GOOGLE_SECRET is required" }),

  // Rate Limiting (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url({ message: "UPSTASH_REDIS_REST_URL is required" }),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, { message: "UPSTASH_REDIS_REST_TOKEN is required" }),

  // Public
  NEXT_PUBLIC_NOINDEX: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .optional()
    .default("https://deniko.net"),
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Email - No-Reply (System Notifications)
  SMTP_NOREPLY_HOST: z
    .string()
    .min(1, { message: "SMTP_NOREPLY_HOST is required" }),
  SMTP_NOREPLY_PORT: z.string().default("465"),
  SMTP_NOREPLY_USER: z
    .string()
    .email({ message: "SMTP_NOREPLY_USER must be a valid email" }),
  SMTP_NOREPLY_PASSWORD: z
    .string()
    .min(1, { message: "SMTP_NOREPLY_PASSWORD is required" }),
  SMTP_NOREPLY_FROM: z
    .string()
    .email({ message: "SMTP_NOREPLY_FROM must be a valid email" }),

  // Email - Support (Tickets & Inquiries)
  SMTP_SUPPORT_HOST: z
    .string()
    .min(1, { message: "SMTP_SUPPORT_HOST is required" }),
  SMTP_SUPPORT_PORT: z.string().default("465"),
  SMTP_SUPPORT_USER: z
    .string()
    .email({ message: "SMTP_SUPPORT_USER must be a valid email" }),
  SMTP_SUPPORT_PASSWORD: z
    .string()
    .min(1, { message: "SMTP_SUPPORT_PASSWORD is required" }),
  SMTP_SUPPORT_FROM: z
    .string()
    .email({ message: "SMTP_SUPPORT_FROM must be a valid email" }),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
