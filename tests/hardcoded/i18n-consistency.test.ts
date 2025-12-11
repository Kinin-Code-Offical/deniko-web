import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Helper to flatten object keys
// e.g. { a: { b: 1 } } -> ['a.b']
function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(
        getKeys(obj[key] as Record<string, unknown>, prefix + key + ".")
      );
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

describe("i18n Consistency", () => {
  const dictionariesDir = path.join(process.cwd(), "dictionaries");

  // Load JSON files
  const enPath = path.join(dictionariesDir, "en.json");
  const trPath = path.join(dictionariesDir, "tr.json");

  if (!fs.existsSync(enPath) || !fs.existsSync(trPath)) {
    console.warn("Dictionary files not found, skipping consistency test."); // ignore-console-check
    return;
  }

  const enDict = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const trDict = JSON.parse(fs.readFileSync(trPath, "utf-8"));

  const enKeys = getKeys(enDict).sort();
  const trKeys = getKeys(trDict).sort();

  it("should have all keys from EN in TR", () => {
    const missingInTr = enKeys.filter((key) => !trKeys.includes(key));
    if (missingInTr.length > 0) {
      console.error("Missing keys in TR:", missingInTr); // ignore-console-check
    }
    expect(
      missingInTr,
      `Found ${missingInTr.length} keys missing in TR dictionary`
    ).toEqual([]);
  });

  it("should have all keys from TR in EN", () => {
    const missingInEn = trKeys.filter((key) => !enKeys.includes(key));
    if (missingInEn.length > 0) {
      console.error("Missing keys in EN:", missingInEn); // ignore-console-check
    }
    expect(
      missingInEn,
      `Found ${missingInEn.length} keys missing in EN dictionary`
    ).toEqual([]);
  });
});
