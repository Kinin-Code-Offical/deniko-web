import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageComponent } from "../templates/nextjs-image/image-component";

describe("Image Component Standards", () => {
  it("renders next/image with the required alt attribute", () => {
    const testAlt = "A descriptive alternative text";

    render(<ImageComponent src="/test-image.jpg" alt={testAlt} />);

    // Find the image by its alt text
    const image = screen.getByAltText(testAlt);

    // Verify it exists and has the correct src (Next.js modifies src, so we check if it contains the original)
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("alt", testAlt);

    // Optional: Check if it's actually an img tag (Next.js Image renders an img tag)
    expect(image.tagName).toBe("IMG");
  });

  it("fails if alt text is missing (conceptual check for developers)", () => {
    // This test serves as documentation:
    // Developers should ensure their components require 'alt' in props
    // and pass it to the Image component.

    const testAlt = "Another image";
    render(<ImageComponent src="/img.jpg" alt={testAlt} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", testAlt);
    expect(img).not.toHaveAttribute("alt", "");
  });
});
