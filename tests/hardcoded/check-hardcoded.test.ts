import { describe, it, expect } from "vitest";
import { scanFile } from "../../scripts/check-hardcoded";

describe("check-hardcoded script", () => {
  it("should detect hardcoded JSX text", () => {
    const code = `
      export default function Test() {
        return <div>Hello World</div>;
      }
    `;
    // Create a temp file or just pass code if scanFile supports it (I modified scanFile to support sourceCode)
    const issues = scanFile("test.tsx", code);

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("JsxText");
    expect(issues[0].text).toBe("Hello World");
  });

  it("should detect hardcoded string literals in attributes", () => {
    const code = `
      export default function Test() {
        return <input placeholder="Enter name" />;
      }
    `;
    const issues = scanFile("test.tsx", code);

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("StringLiteral");
    expect(issues[0].text).toBe("Enter name");
  });

  it("should ignore i18n calls", () => {
    const code = `
      export default function Test() {
        return <div>{t("hello")}</div>;
      }
    `;
    const issues = scanFile("test.tsx", code);
    expect(issues).toHaveLength(0);
  });

  it("should ignore non-text attributes", () => {
    const code = `
      export default function Test() {
        return <div className="container" id="main"></div>;
      }
    `;
    const issues = scanFile("test.tsx", code);
    expect(issues).toHaveLength(0);
  });

  it("should ignore imports", () => {
    const code = `
      import React from "react";
    `;
    const issues = scanFile("test.tsx", code);
    expect(issues).toHaveLength(0);
  });
});
