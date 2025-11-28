import { PrismaClient } from "@prisma/client";

// Global değişken tanımı (TypeScript için)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Prisma istemcisini oluştur
export const db = globalForPrisma.prisma ?? new PrismaClient();

// Development ortamında sürekli yeni bağlantı açmasın diye global değişkene atıyoruz
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;