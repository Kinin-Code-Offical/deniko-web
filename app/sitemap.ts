import type { MetadataRoute } from "next";

const baseUrl = "https://deniko.net";
const locales = ["tr", "en"];

// Public routes that should be indexed.
// We explicitly exclude authenticated routes (e.g., /dashboard, /admin, /onboarding)
// to prevent 401/404 errors in search console.
const routes = [
  "", // Home
  "/login",
  "/register",
  "/join",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/kvkk",
];

export default function sitemap(): MetadataRoute.Sitemap {
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

  return sitemapEntries;
}
