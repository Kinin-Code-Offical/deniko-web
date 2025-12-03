import { PrismaClient } from "@prisma/client";

// Global definition for Prisma to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * The shared Prisma Client instance.
 * Uses a global variable in development to prevent exhausting database connections.
 */
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
