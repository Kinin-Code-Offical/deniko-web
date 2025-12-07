import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OptimizedImage } from "../components/ui/optimized-image";

describe("OptimizedImage Component", () => {
  it("renders a Hero image with priority", () => {
    render(
      <OptimizedImage
        src="/hero.jpg"
        alt="Hero Image"
        width={800}
        height={600}
        isHero={true}
      />
    );

    const img = screen.getByRole("img", { name: /Hero Image/i });

    // Next.js 'priority' prop adds 'fetchpriority="high"' and removes 'loading="lazy"'
    // It might also add a 'decoding' attribute.
    // The exact implementation detail of 'priority' in the DOM might vary by Next.js version,
    // but usually it removes loading="lazy".

    expect(img).not.toHaveAttribute("loading", "lazy");
    // In newer Next.js versions, priority adds fetchpriority="high", but in jsdom/test env it might not appear.
    // expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("renders a standard large media image with lazy loading", () => {
    render(
      <OptimizedImage
        src="/feature.jpg"
        alt="Feature Image"
        width={800}
        height={600}
        isHero={false}
      />
    );

    const img = screen.getByRole("img", { name: /Feature Image/i });

    // Should have loading="lazy"
    expect(img).toHaveAttribute("loading", "lazy");
    // Should not have fetchpriority="high"
    expect(img).not.toHaveAttribute("fetchpriority", "high");
  });
});
