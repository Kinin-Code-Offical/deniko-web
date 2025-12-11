import type { Metadata } from "next";
import { i18n } from "@/i18n-config";

const BASE_URL = "https://deniko.net";

/**
 * Generates the 'alternates' metadata for SEO, including canonical and hreflang tags.
 *
 * @param route - The current route path (e.g., '/about', '/contact'). Should start with '/'.
 * @param currentLocale - The current locale of the page (e.g., 'en', 'tr').
 * @returns Metadata['alternates'] object compatible with Next.js App Router.
 */
export function generateI18nAlternates(
  route: string,
  currentLocale: string
): Metadata["alternates"] {
  // Ensure route starts with /
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  // Handle root path specifically to avoid double slashes if needed, though Next.js handles it well.
  // We'll keep it simple: /tr/about vs /tr

  const languages: Record<string, string> = {};

  i18n.locales.forEach((locale) => {
    // Construct full URL for each locale
    // Example: https://deniko.net/en/about
    languages[locale] =
      `${BASE_URL}/${locale}${cleanRoute === "/" ? "" : cleanRoute}`;
  });

  return {
    // Canonical URL points to the current page's full URL
    canonical: `${BASE_URL}/${currentLocale}${cleanRoute === "/" ? "" : cleanRoute}`,
    languages: {
      ...languages,
      // x-default points to the default locale version
      "x-default": `${BASE_URL}/${i18n.defaultLocale}${cleanRoute === "/" ? "" : cleanRoute}`,
    },
  };
}
