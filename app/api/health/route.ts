import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import logger from "@/lib/logger";

export async function GET() {
  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, "Health check failed");
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
