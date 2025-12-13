import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getObjectStream } from "@/lib/storage";
import { NextResponse } from "next/server";
import { i18n } from "@/i18n-config";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isHtmlRequest(req: Request): boolean {
    const accept = req.headers.get("accept") || "";
    return accept.includes("text/html");
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const session = await auth();

    let sessionUser: { id: string; role?: string | null } | null = null;
    if (session?.user?.id) {
        sessionUser = {
            id: session.user.id,
            role: session.user.role ? String(session.user.role) : null,
        };
    }

    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            image: true,
            settings: {
                select: {
                    profileVisibility: true,
                    showAvatar: true,
                }
            }
        },
    });

    if (!user || !user.image) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // Defaults
    const profileVisibility = user.settings?.profileVisibility ?? "public";
    const showAvatar = user.settings?.showAvatar ?? true;

    // Permission Logic
    let hasAccess = false;

    // 1. Owner always has access
    if (sessionUser?.id === user.id) {
        hasAccess = true;
    }
    // 2. If avatar is hidden explicitly (and not owner)
    else if (!showAvatar) {
        hasAccess = false;
    }
    // 3. If profile is private (and not owner)
    else if (profileVisibility === "private") {
        hasAccess = false;
    }
    // 4. Public profile & Avatar is on
    else {
        hasAccess = true;
    }

    if (!hasAccess) {
        if (isHtmlRequest(req)) {
            const defaultLang = i18n.defaultLocale;
            return NextResponse.redirect(new URL(`/${defaultLang}/forbidden`, req.url), 302);
        }

        const status = sessionUser ? 403 : 401;
        return new NextResponse("Forbidden", {
            status,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Surrogate-Control": "no-store",
            },
        });
    }

    // Check if external URL
    if (user.image.startsWith("http")) {
        return NextResponse.redirect(user.image);
    }

    // Internal GCS Key
    try {
        const stream = await getObjectStream(user.image);

        // Determine content type
        const contentType = user.image.endsWith(".png") ? "image/png" : "image/jpeg";

        // Cache control
        const isPubliclyVisible = profileVisibility === "public" && showAvatar;

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": isPubliclyVisible
                    ? "public, max-age=3600, stale-while-revalidate=86400"
                    : "private, max-age=300",
            },
        });
    } catch {
        return new NextResponse("Avatar not found", { status: 404 });
    }
}
