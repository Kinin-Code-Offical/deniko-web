import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";

/**
 * Validates that a page component follows the required semantic structure:
 * - Contains <header>
 * - Contains <main>
 * - Contains <footer>
 * - Contains exactly one <h1>
 */
export const validatePageStructure = (UiComponent: React.ReactElement) => {
  const { container } = render(UiComponent);

  // Check for semantic tags
  const header = container.querySelector("header");
  const main = container.querySelector("main");
  const footer = container.querySelector("footer");

  expect(header, "Page must contain a <header> tag").toBeInTheDocument();
  expect(main, "Page must contain a <main> tag").toBeInTheDocument();
  expect(footer, "Page must contain a <footer> tag").toBeInTheDocument();

  // Check for exactly one h1
  const h1s = container.querySelectorAll("h1");
  expect(h1s.length, "Page must contain exactly one <h1> tag").toBe(1);
};

// Example of a valid page structure
const ValidPage = () => (
  <div>
    <header>
      <nav>Navigation</nav>
    </header>
    <main>
      <h1>Page Title</h1>
      <p>Main content goes here.</p>
    </main>
    <footer>
      <p>Copyright 2025</p>
    </footer>
  </div>
);

// Example of an invalid page structure (missing semantic tags, multiple h1s)
const InvalidPage = () => (
  <div>
    <div className="header">Header</div>
    <div className="content">
      <h1>Title 1</h1>
      <h1>Title 2</h1>
    </div>
    <div className="footer">Footer</div>
  </div>
);

describe("Page Structure Standards", () => {
  it("passes for a valid page structure", () => {
    validatePageStructure(<ValidPage />);
  });

  it("fails for missing semantic tags", () => {
    const { container } = render(<InvalidPage />);
    const header = container.querySelector("header");
    expect(header).not.toBeInTheDocument();
  });

  it("fails for multiple h1 tags", () => {
    const { container } = render(<InvalidPage />);
    const h1s = container.querySelectorAll("h1");
    expect(h1s.length).not.toBe(1);
  });
});
