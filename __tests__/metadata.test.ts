import { describe, it, expect } from "vitest";
import type { Metadata } from "next";

// Helper function to validate metadata
export function validateMetadata(metadata: Metadata | undefined) {
  expect(metadata, "Metadata should be defined").toBeDefined();
  expect(metadata?.title, "Metadata title is required").toBeDefined();
  expect(
    metadata?.description,
    "Metadata description is required"
  ).toBeDefined();

  // If title is an object (template), check default
  if (typeof metadata?.title === "object" && metadata?.title !== null) {
    const title = metadata.title as { default: string };
    expect(
      title.default,
      "Default title is required when using template"
    ).toBeDefined();
  } else {
    expect(
      typeof metadata?.title,
      "Title should be a string or template object"
    ).toBe("string");
    expect((metadata?.title as string).length).toBeGreaterThan(0);
  }

  expect(typeof metadata?.description, "Description should be a string").toBe(
    "string"
  );
  expect((metadata?.description as string).length).toBeGreaterThan(0);
}

// Import the templates to test them
import * as PageTemplate from "../templates/nextjs-metadata/page-template";
import * as LayoutTemplate from "../templates/nextjs-metadata/layout-template";

describe("Metadata Standards", () => {
  describe("Page Template", () => {
    it("should export valid metadata with title and description", () => {
      validateMetadata(PageTemplate.metadata);
    });
  });

  describe("Layout Template", () => {
    it("should export valid metadata with title and description", () => {
      validateMetadata(LayoutTemplate.metadata);
    });
  });
});
