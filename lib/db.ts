import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

// Global definition for Prisma to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  (() => {
    const connectionString = env.DATABASE_URL;
    const sslModeMatch = /sslmode=([^&]+)/i.exec(connectionString);
    const sslMode = sslModeMatch?.[1]?.toLowerCase()
      .replace(/\s+/g, "") as
      | "disable"
      | "allow"
      | "prefer"
      | "require"
      | "verify-ca"
      | "verify-full"
      | undefined;

    const hasCustomCertificates = Boolean(
      env.DATABASE_SSL_CA || env.DATABASE_SSL_CERT || env.DATABASE_SSL_KEY,
    );

    const shouldUseSSL = Boolean(
      hasCustomCertificates ||
        env.DATABASE_SSL_SKIP_VERIFY ||
        (sslMode && sslMode !== "disable" && sslMode !== "allow" && sslMode !== "prefer"),
    );

    const normalizeCertificate = (value?: string) => value?.replace(/\\n/g, "\n");

    const sslConfiguration = shouldUseSSL
      ? {
          ca: normalizeCertificate(env.DATABASE_SSL_CA),
          cert: normalizeCertificate(env.DATABASE_SSL_CERT),
          key: normalizeCertificate(env.DATABASE_SSL_KEY),
          // Match libpq semantics: `require` skips verification, `verify-*` enforces it.
          rejectUnauthorized: false,
        }
      : undefined;

    if (process.env.NODE_ENV === "development") {
       console.log("[db.ts] SSL Config:", {
         sslMode,
         hasCustomCertificates,
         rejectUnauthorized: sslConfiguration?.rejectUnauthorized,
         caLength: sslConfiguration?.ca?.length,
       });
    }

    // Remove sslmode from connection string to prevent conflicts with ssl config object
    // and ensure pg uses the provided ssl configuration object.
    const urlObj = new URL(connectionString);
    urlObj.searchParams.delete("sslmode");
    const cleanConnectionString = urlObj.toString();

    const pool = new Pool({ connectionString: cleanConnectionString, ssl: sslConfiguration });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  })();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;