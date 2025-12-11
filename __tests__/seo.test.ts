import { describe, it, expect } from "vitest";
import { generateI18nAlternates } from "../lib/seo";

// Mock i18n config if necessary, but since it's a simple object import,
// we can rely on the real one or mock it if we want strict isolation.
// For this test, we'll assume the real one is { defaultLocale: 'tr', locales: ['tr', 'en'] }
// based on the previous context.

describe("SEO Utilities", () => {
  const BASE_URL = "https://deniko.net";

  it("should generate correct canonical and hreflangs for a subpage", () => {
    const route = "/about";
    const locale = "en";
    const alternates = generateI18nAlternates(route, locale);

    expect(alternates).toBeDefined();

    // Check Canonical
    expect(alternates?.canonical).toBe(`${BASE_URL}/en/about`);

    // Check Hreflangs
    const languages = alternates?.languages as Record<string, string>;
    expect(languages).toBeDefined();
    expect(languages["en"]).toBe(`${BASE_URL}/en/about`);
    expect(languages["tr"]).toBe(`${BASE_URL}/tr/about`);

    // Check x-default
    expect(languages["x-default"]).toBe(`${BASE_URL}/tr/about`);
  });

  it("should handle root path correctly", () => {
    const route = "/";
    const locale = "tr";
    const alternates = generateI18nAlternates(route, locale);

    expect(alternates?.canonical).toBe(`${BASE_URL}/tr`);

    const languages = alternates?.languages as Record<string, string>;
    expect(languages["en"]).toBe(`${BASE_URL}/en`);
    expect(languages["tr"]).toBe(`${BASE_URL}/tr`);
    expect(languages["x-default"]).toBe(`${BASE_URL}/tr`);
  });

  it("should normalize route missing leading slash", () => {
    const route = "contact";
    const locale = "en";
    const alternates = generateI18nAlternates(route, locale);

    expect(alternates?.canonical).toBe(`${BASE_URL}/en/contact`);
  });
});
