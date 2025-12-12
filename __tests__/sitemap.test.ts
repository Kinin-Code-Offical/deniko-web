import { describe, it, expect, vi } from "vitest";
import sitemap from "../app/sitemap";

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findMany: vi.fn().mockResolvedValue([
        { username: "testuser1", isProfilePublic: true },
        { username: "testuser2", isProfilePublic: true },
      ]),
    },
  },
}));

describe("Sitemap Generation", () => {
  it("should generate valid sitemap entries", async () => {
    const entries = await sitemap();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);

    // Check structure of the first entry
    const firstEntry = entries[0];
    expect(firstEntry).toHaveProperty("url");
    expect(firstEntry).toHaveProperty("lastModified");
    expect(firstEntry).toHaveProperty("changeFrequency");
    expect(firstEntry).toHaveProperty("priority");

    // Verify URL format
    expect(firstEntry.url).toMatch(/^https:\/\/deniko\.net/);
  });

  it("should include all locales", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    // Check for presence of locales in URLs
    const hasTr = urls.some((url) => url.includes("/tr"));
    const hasEn = urls.some((url) => url.includes("/en"));

    expect(hasTr).toBe(true);
    expect(hasEn).toBe(true);
  });
});
