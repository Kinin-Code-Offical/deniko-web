import { describe, it, expect } from "vitest";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
} from "../lib/json-ld";
import type { Organization, WebSite, BreadcrumbList } from "schema-dts";

describe("JSON-LD Helpers", () => {
  it("should generate valid Organization schema", () => {
    const schema = generateOrganizationSchema();

    expect(schema["@context"]).toBe("https://schema.org");

    // Narrowing for test
    const org = schema as Extract<Organization, { "@type": "Organization" }>;
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("Deniko");
    expect(org.url).toBeDefined();

    // Verify it can be stringified without error
    expect(() => JSON.stringify(schema)).not.toThrow();
  });

  it("should generate valid WebSite schema", () => {
    const schema = generateWebSiteSchema();

    expect(schema["@context"]).toBe("https://schema.org");

    const website = schema as Extract<WebSite, { "@type": "WebSite" }>;
    expect(website["@type"]).toBe("WebSite");
    expect(website.potentialAction).toBeDefined();
  });

  it("should generate valid BreadcrumbList schema", () => {
    const items = [
      { name: "Home", item: "https://deniko.net" },
      { name: "Products", item: "https://deniko.net/products" },
    ];

    const schema = generateBreadcrumbSchema(items);

    expect(schema["@context"]).toBe("https://schema.org");

    const breadcrumb = schema as Extract<
      BreadcrumbList,
      { "@type": "BreadcrumbList" }
    >;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(2);

    // Check first item
    const firstItem = (
      Array.isArray(breadcrumb.itemListElement)
        ? breadcrumb.itemListElement[0]
        : null
    ) as unknown;

    expect(firstItem).toBeDefined();
    if (firstItem) {
      const item = firstItem as {
        "@type": string;
        position: number;
        name: string;
      };
      expect(item["@type"]).toBe("ListItem");
      expect(item.position).toBe(1);
      expect(item.name).toBe("Home");
    }
  });
});
