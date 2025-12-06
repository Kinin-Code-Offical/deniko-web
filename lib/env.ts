import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
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
  EMAIL_USER: z.string().email({ message: "EMAIL_USER must be a valid email" }),
  EMAIL_PASS: z.string().min(1, { message: "EMAIL_PASS is required" }),
  GCS_BUCKET_NAME: z.string().min(1, { message: "GCS_BUCKET_NAME is required" }),
  GCS_PROJECT_ID: z.string().min(1, { message: "GCS_PROJECT_ID is required" }),
  GCS_CLIENT_EMAIL: z.string().email({ message: "GCS_CLIENT_EMAIL must be a valid email" }),
  GCS_PRIVATE_KEY: z.string().min(1, { message: "GCS_PRIVATE_KEY is required" }),
  AUTH_SECRET: z.string().min(1, { message: "AUTH_SECRET is required" }),
  AUTH_GOOGLE_ID: z.string().min(1, { message: "AUTH_GOOGLE_ID is required" }),
  AUTH_GOOGLE_SECRET: z.string().min(1, { message: "AUTH_GOOGLE_SECRET is required" }),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
