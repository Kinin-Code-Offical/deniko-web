import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

// Best-effort CSS stub (ignored by Vitest if not matching)
vi.mock("*.css", () => ({ default: {} }));

// Mock next/font/google
vi.mock("next/font/google", () => {
  const createMockFont =
    (name: string) =>
      (options?: Record<string, unknown>) => ({
        variable: options?.variable ?? `--font-${name.toLowerCase()}`,
        className: `mock-${name.toLowerCase()}`,
        style: { fontFamily: name },
      });

  return {
    Inter: createMockFont("Inter"),
    Roboto: createMockFont("Roboto"),
    Poppins: createMockFont("Poppins"),
    Lato: createMockFont("Lato"),
    Open_Sans: createMockFont("Open_Sans"),
    Montserrat: createMockFont("Montserrat"),
    Nunito: createMockFont("Nunito"),
    Source_Sans_3: createMockFont("Source_Sans_3"),
    Geist: createMockFont("Geist"),
    Geist_Mono: createMockFont("Geist_Mono"),
  };
});

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  draftMode: vi.fn(() => ({ isEnabled: false })),
}));

// Mock components
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/components/providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/ui/cookie-consent", () => ({
  CookieConsent: () => null,
}));
vi.mock("@/components/GoogleAnalytics", () => ({ default: () => null }));

// Helpers
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");

// Define a type for the metadata module to avoid implicit any and property access errors
type MetadataModule = {
  metadata?: Metadata;
  generateMetadata?: (props: unknown) => Promise<Metadata> | Metadata;
};

function isString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function normalizeImageEntry(entry: unknown): string | undefined {
  if (!entry) return undefined;
  if (isString(entry)) return entry;
  if (typeof entry === "object" && entry !== null) {
    const e = entry as { url?: unknown; src?: unknown };
    if (isString(e.url)) return e.url;
    if (isString(e.src)) return e.src;
  }
  return undefined;
}
function isLocalUrl(u: string): boolean {
  return u.startsWith("/");
}
function localFileExistsForUrl(u: string): boolean {
  if (!isLocalUrl(u)) return true; // external URLs are considered valid here
  const file = path.join(publicDir, u);
  return fs.existsSync(file);
}
function extractTitle(metadata: Metadata): string {
  if (!metadata) return "";
  const t = metadata.title;
  if (isString(t)) return t;
  if (t && typeof t === "object" && t !== null) {
    if ("default" in t && isString(t.default)) return t.default;
    if ("template" in t && isString(t.template)) return t.template;
  }
  return "";
}
function setMockAcceptLanguage(lang: string) {
  return import("next/headers").then(({ headers }) => {
    vi.mocked(headers).mockReturnValue({
      get: (name: string) =>
        name.toLowerCase() === "accept-language" ? lang : undefined,
    } as unknown as ReturnType<typeof headers>);
  });
}
async function getMetadataFromLayout(): Promise<Metadata> {
  const layoutModule = (await import("../../app/layout")) as MetadataModule;
  if (typeof layoutModule.generateMetadata === "function") {
    // Call with minimal args; headers are mocked for i18n
    return await layoutModule.generateMetadata({
      params: {},
      searchParams: {},
    });
  }
  return layoutModule.metadata || {};
}

describe("Metadata validation", () => {
  it("provides metadata via metadata or generateMetadata", async () => {
    const layoutModule = (await import("../../app/layout")) as MetadataModule;
    const hasMetadata = "metadata" in layoutModule && !!layoutModule.metadata;
    const hasGenerate =
      "generateMetadata" in layoutModule &&
      typeof layoutModule.generateMetadata === "function";
    expect(hasMetadata || hasGenerate).toBe(true);
  });

  it("i18n compliance: no known hardcoded TR strings", async () => {
    await setMockAcceptLanguage("tr,tr-TR;q=0.9,en;q=0.8");
    const metadata = await getMetadataFromLayout();
    expect(metadata).toBeDefined();

    const hardcodedTitle = "Deniko | Özel Ders Yönetim Platformu";
    const hardcodedDesc =
      "Deniko ile özel derslerinizi kolayca yönetin. Öğrenci takibi, ders programı ve veli bilgilendirme özellikleriyle eğitiminizi dijitalleştirin.";

    const title = extractTitle(metadata);
    const description = metadata?.description;

    expect(title).not.toBe(hardcodedTitle);
    expect(description).not.toBe(hardcodedDesc);
  });

  it("has essential SEO fields (title, description, openGraph, twitter, icons)", async () => {
    const metadata = await getMetadataFromLayout();
    const title = extractTitle(metadata);
    expect(isString(title)).toBe(true);
    expect(isString(metadata?.description)).toBe(true);

    // openGraph
    const og = metadata?.openGraph ?? {};
    expect(og).toBeDefined();
    const ogImages = toArray(og.images)
      .map(normalizeImageEntry)
      .filter(Boolean);
    expect(ogImages.length).toBeGreaterThan(0);

    // twitter
    const tw = metadata?.twitter ?? {};
    expect(tw).toBeDefined();
    const twImages = toArray(tw.images)
      .map(normalizeImageEntry)
      .filter(Boolean);
    expect(twImages.length).toBeGreaterThan(0);

    // icons
    const icons = metadata?.icons;
    expect(icons).toBeDefined();
    const iconUrls: string[] = [];
    if (isString(icons)) iconUrls.push(icons);
    else if (Array.isArray(icons)) {
      iconUrls.push(...icons.filter(isString));
    } else if (icons && typeof icons === "object") {
      for (const key of Object.keys(icons)) {
        const v = (icons as Record<string, unknown>)[key];
        const arr = toArray(v);
        for (const e of arr) {
          const url = normalizeImageEntry(e);
          if (url) iconUrls.push(url);
        }
      }
    }
    expect(iconUrls.length).toBeGreaterThan(0);
  });

  it("alternates/canonical and manifest are present if configured", async () => {
    const metadata = await getMetadataFromLayout();

    const canonical = metadata?.alternates?.canonical;
    if (canonical !== undefined) {
      expect(isString(canonical) || typeof canonical === "object").toBe(true);
    }

    const manifest = metadata?.manifest;
    if (manifest !== undefined) {
      expect(isString(manifest)).toBe(true);
      if (isString(manifest) && isLocalUrl(manifest)) {
        expect(localFileExistsForUrl(manifest)).toBe(true);
      }
    }
  });

  it("robots/viewport/themeColor are sane when present", async () => {
    const metadata = await getMetadataFromLayout();

    const robots = metadata?.robots;
    if (robots !== undefined) {
      if (isString(robots)) {
        expect(["index,follow", "noindex,nofollow"].includes(robots.toLowerCase())).toBe(true);
      } else if (typeof robots === "object") {
        expect(robots).toHaveProperty("index");
        expect(robots).toHaveProperty("follow");
      }
    }

    const viewport = metadata?.viewport;
    if (viewport !== undefined) {
      expect(isString(viewport) || typeof viewport === "object").toBe(true);
    }

    const themeColor = metadata?.themeColor;
    if (themeColor !== undefined) {
      if (Array.isArray(themeColor)) {
        expect(themeColor.length).toBeGreaterThan(0);
      } else {
        expect(isString(themeColor) || typeof themeColor === "object").toBe(true);
      }
    }
  });

  it("local logos/icons referenced in metadata exist in public/", async () => {
    const metadata = await getMetadataFromLayout();

    const urls: string[] = [];

    const ogImages = toArray(metadata?.openGraph?.images)
      .map(normalizeImageEntry)
      .filter(Boolean) as string[];
    urls.push(...ogImages);

    const twImages = toArray(metadata?.twitter?.images)
      .map(normalizeImageEntry)
      .filter(Boolean) as string[];
    urls.push(...twImages);

    const icons = metadata?.icons;
    if (isString(icons)) urls.push(icons);
    else if (Array.isArray(icons)) urls.push(...icons.filter(isString));
    else if (icons && typeof icons === "object") {
      for (const key of Object.keys(icons)) {
        const v = (icons as Record<string, unknown>)[key];
        const arr = toArray(v);
        for (const e of arr) {
          const url = normalizeImageEntry(e);
          if (url) urls.push(url);
        }
      }
    }

    const localUrls = urls.filter(isLocalUrl);
    // If there are local assets, they must exist
    if (localUrls.length > 0) {
      for (const u of localUrls) {
        expect(localFileExistsForUrl(u)).toBe(true);
      }
    } else {
      // If everything is remote, at least ensure URLs look valid
      for (const u of urls) {
        expect(/^https?:\/\//.test(u)).toBe(true);
      }
    }
  });

  it("i18n changes with Accept-Language when using generateMetadata", async () => {
    const layoutModule = (await import("../../app/layout")) as MetadataModule;
    if (typeof layoutModule.generateMetadata !== "function") {
      // Skip if static metadata
      expect(true).toBe(true);
      return;
    }

    await setMockAcceptLanguage("tr");
    const trMetadata = await getMetadataFromLayout();

    await setMockAcceptLanguage("en");
    const enMetadata = await getMetadataFromLayout();

    const trTitle = extractTitle(trMetadata);
    const enTitle = extractTitle(enMetadata);

    if (isString(trTitle) && isString(enTitle)) {
      // Titles should differ across locales in a proper i18n setup
      expect(trTitle === enTitle).toBe(false);
    }
  }, 20000);
});
