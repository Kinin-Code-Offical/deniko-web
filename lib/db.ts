import { PrismaClient } from "@prisma/client";
import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";
import logger from "@/lib/logger";

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

    if (env.INSTANCE_CONNECTION_NAME && env.NODE_ENV === "production") {
      dbConfig.host = `/cloudsql/${env.INSTANCE_CONNECTION_NAME}`;
      logger.info(`[DB] Connecting via Unix Socket: ${dbConfig.host}`);
    } else {
      dbConfig.host = "127.0.0.1";
      dbConfig.port = 5432;
      logger.info("[DB] Connecting via Localhost (Auth Proxy)");
    }

    const pool = new Pool(dbConfig);
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
  })();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
