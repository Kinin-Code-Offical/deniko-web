import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const baseUrl = "https://deniko.net";
const locales = ["tr", "en"];

// Public routes that should be indexed.
// We explicitly exclude authenticated routes (e.g., /dashboard, /admin, /onboarding)
// to prevent 401/404 errors in search console.
const routes = [
  "", // Home
  "/join",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/kvkk",
  "/faq",
  "/support",
  "/support/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add localized routes
  routes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
      });
    });
  });

  // Add public user profiles
  try {
    if (!process.env.DISABLE_DB_FOR_SITEMAP) { // ignore-env-check
      const users = await db.user.findMany({
        where: {
          settings: {
            profileVisibility: "public",
          },
          username: { not: null },
        },
        select: {
          username: true,
          updatedAt: true,
        },
      });

      users.forEach((user) => {
        if (user.username) {
          locales.forEach((locale) => {
            sitemapEntries.push({
              url: `${baseUrl}/${locale}/users/${user.username}`,
              lastModified: user.updatedAt,
              changeFrequency: "weekly",
              priority: 0.6,
            });
          });
        }
      });
    }
  } catch (error) {
    logger.warn({
      event: "sitemap_db_error",
      errorMessage: (error as Error).message,
    });
  }

  return sitemapEntries;
}
