import { getObjectStream } from "@/lib/storage";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET() {
    try {
        const stream = await getObjectStream("default/avatar.png");
        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch (error) {
        logger.error({ error }, "Default avatar not found in GCS");
        return new NextResponse("Default avatar not found", { status: 404 });
    }
}
