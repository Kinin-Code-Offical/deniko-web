import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
    const isNoIndex = env.NEXT_PUBLIC_NOINDEX;
    const baseUrl = env.NEXT_PUBLIC_SITE_URL || "https://deniko.net";

    if (isNoIndex) {
        return {
            rules: {
                userAgent: "*",
                disallow: "/",
            },
            sitemap: `${baseUrl}/sitemap.xml`,
        };
    }

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/*/dashboard/",
                "/*/dashboard/*",
                "/*/login",
                "/*/register",
                "/*/forgot-password",
                "/*/reset-password",
                "/*/verify",
                "/*/verify-email-change/*",
                "/*/forbidden",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
