import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";

describe("ESLint i18n Rules", () => {
  const eslint = new ESLint({
    overrideConfigFile: "eslint.config.mjs",
  });

  it("should flag hardcoded text in JSX", async () => {
    const code = `
      export default function Hardcoded() {
        return (
          <div>
            <h1>Hello World</h1>
            <p>This is hardcoded text.</p>
            <input placeholder="Enter name" />
          </div>
        );
      }
    `;

    // We need to lint a file path that matches the rule config (app/ or components/)
    // Since we can't easily mock file paths in ESLint API without creating files,
    // we will rely on the rule definition we just added.
    // However, running ESLint programmatically on a string usually requires a filePath
    // to match "files" glob patterns in flat config.

    const results = await eslint.lintText(code, {
      filePath: "app/test-hardcoded.tsx",
    });
    const { messages } = results[0];

    const hardcodedErrors = messages.filter(
      (m) => m.ruleId === "no-restricted-syntax"
    );

    // Expect errors for <h1> text, <p> text, and placeholder
    expect(hardcodedErrors.length).toBeGreaterThanOrEqual(3);
    expect(
      hardcodedErrors.some((m) => m.message.includes("Avoid hardcoded text"))
    ).toBe(true);
    expect(
      hardcodedErrors.some((m) =>
        m.message.includes("Avoid hardcoded placeholder")
      )
    ).toBe(true);
  }, 60000);

  it("should pass for i18n usage", async () => {
    const code = `
      import type { Dictionary } from "@/types/i18n";

export default function I18n({ dict }: { dict: Dictionary }) {
        return (
          <div>
            <h1>{dict.home.title}</h1>
            <p>{dict.home.description}</p>
            <input placeholder={dict.form.placeholder} />
          </div>
        );
      }
    `;

    const results = await eslint.lintText(code, {
      filePath: "app/test-i18n.tsx",
    });
    const { messages } = results[0];

    const hardcodedErrors = messages.filter(
      (m) => m.ruleId === "no-restricted-syntax"
    );

    expect(hardcodedErrors.length).toBe(0);
  });
});
