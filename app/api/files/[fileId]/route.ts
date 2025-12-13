import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getObjectStream } from "@/lib/storage";
import { NextResponse } from "next/server";
import { i18n } from "@/i18n-config";

function isHtmlRequest(req: Request): boolean {
    const accept = req.headers.get("accept") || "";
    return accept.includes("text/html");
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await params;
    const session = await auth();

    if (!session?.user) {
        if (isHtmlRequest(req)) {
            const defaultLang = i18n.defaultLocale;
            return NextResponse.redirect(new URL(`/${defaultLang}/forbidden`, req.url), 302);
        }
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const file = await db.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        return new NextResponse("File not found", { status: 404 });
    }

    // Permission Check
    // Owner can access
    if (file.ownerId !== session.user.id) {
        // TODO: Add logic for shared files (e.g. if user is in the same class/lesson)
        // For now, strict owner check
        if (isHtmlRequest(req)) {
            const defaultLang = i18n.defaultLocale;
            return NextResponse.redirect(new URL(`/${defaultLang}/forbidden`, req.url), 302);
        }
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const stream = await getObjectStream(file.key);

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": file.mimeType,
                "Content-Length": file.sizeBytes.toString(),
                "Content-Disposition": `attachment; filename="${file.filename}"`,
                "Cache-Control": "private, max-age=300",
            },
        });
    } catch {
        return new NextResponse("File content not found", { status: 404 });
    }
}
