import type { NextRequest } from "next/server";

export function getClientIp(
    req: NextRequest | Request | undefined | null
): string | null {
    if (!req) return null;

    const { headers } = req;

    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    const realIp = headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    if ("ip" in req && typeof (req as { ip?: unknown }).ip === "string") {
        return (req as { ip: string }).ip;
    }

    return null;
}
