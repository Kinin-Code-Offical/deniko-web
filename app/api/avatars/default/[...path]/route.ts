import { getObjectStream } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const key = `default/${path.join("/")}`;

    try {
        const stream = await getObjectStream(key);
        // Determine content type based on extension
        const ext = key.split(".").pop()?.toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === "svg") contentType = "image/svg+xml";
        else if (ext === "png") contentType = "image/png";
        else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch {
        return new NextResponse("Not found", { status: 404 });
    }
}
