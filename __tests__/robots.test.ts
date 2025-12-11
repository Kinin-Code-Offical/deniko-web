import { describe, it, expect, vi, afterEach } from "vitest";

// We need to mock the env module before importing the function under test
// because the function reads env at import time or execution time.
// Since our generateRobotsMetadata reads env inside the function, we can mock it.

describe("Robots Metadata Logic", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("returns noindex when NEXT_PUBLIC_NOINDEX is true", async () => {
    // Mock env to return true
    vi.doMock("../lib/env", () => ({
      env: {
        NEXT_PUBLIC_NOINDEX: true,
      },
    }));

    const { generateRobotsMetadata } = await import("../lib/robots-config");
    const robots = generateRobotsMetadata();

    expect(robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("returns index, follow when NEXT_PUBLIC_NOINDEX is false", async () => {
    // Mock env to return false
    vi.doMock("../lib/env", () => ({
      env: {
        NEXT_PUBLIC_NOINDEX: false,
      },
    }));

    const { generateRobotsMetadata } = await import("../lib/robots-config");
    const robots = generateRobotsMetadata();

    expect(robots).toEqual({
      index: true,
      follow: true,
    });
  });

  it("respects default robots if provided and NOINDEX is false", async () => {
    vi.doMock("../lib/env", () => ({
      env: {
        NEXT_PUBLIC_NOINDEX: false,
      },
    }));

    const { generateRobotsMetadata } = await import("../lib/robots-config");
    const customRobots = {
      index: true,
      follow: false,
      googleBot: {
        index: true,
        follow: false,
      },
    };

    const robots = generateRobotsMetadata(customRobots);

    expect(robots).toEqual(customRobots);
  });
});
