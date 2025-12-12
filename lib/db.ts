import { PrismaClient } from "@prisma/client";
import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  (() => {
    const url = new URL(env.DATABASE_URL);

    const dbConfig: PoolConfig = {
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      max: 10,
    };

    type DbConnectionMode = "socket" | "tcp";
    const explicitMode = process.env.DB_CONNECTION_MODE as // ignore-env-check
      | DbConnectionMode
      | undefined;
    const isCloudRun =
      !!process.env.K_SERVICE || !!process.env.GOOGLE_CLOUD_PROJECT; // ignore-env-check
    const hasUnixSocketEnv = !!env.INSTANCE_CONNECTION_NAME;

    const dbConnectionMode: DbConnectionMode =
      explicitMode ??
      (isCloudRun && hasUnixSocketEnv && process.platform !== "win32"
        ? "socket"
        : "tcp");

    if (dbConnectionMode === "socket" && env.INSTANCE_CONNECTION_NAME) {
      dbConfig.host = `/cloudsql/${env.INSTANCE_CONNECTION_NAME}`;
      logger.info({
        event: "db_connect_unix_socket",
        socket: dbConfig.host,
        dbConnectionMode,
      });
    } else {
      dbConfig.host = url.hostname || "127.0.0.1";
      dbConfig.port = parseInt(url.port || "5432");
      logger.info({
        event: "db_connect_tcp",
        host: dbConfig.host,
        port: dbConfig.port,
        dbConnectionMode,
      });
    }

    const pool = new Pool(dbConfig);
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
  })();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
