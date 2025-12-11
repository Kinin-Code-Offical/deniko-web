import { describe, it, expect, afterEach } from "vitest";
import { hasAny, scanFile } from "../../scripts/check-any";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("check-any script", () => {
  describe("hasAny function", () => {
    it('should detect explicit "any" usage', () => {
      expect(hasAny("const x: any = 1;")).toBe(true);
      expect(hasAny("function foo(bar: any) {}")).toBe(true);
      expect(hasAny("const arr: any[] = [];")).toBe(true);
      expect(hasAny("const map = new Map<string, any>();")).toBe(true);
      expect(hasAny("const x = y as any;")).toBe(true);
    });

    it('should ignore words containing "any"', () => {
      expect(hasAny('const company = "Acme";')).toBe(false);
      expect(hasAny("const many = 5;")).toBe(false);
      expect(hasAny("const anyone = true;")).toBe(false);
      expect(hasAny('const tiffany = "name";')).toBe(false);
    });

    it("should ignore comments", () => {
      expect(hasAny("// This can be any value")).toBe(false);
      expect(hasAny("/* any value */")).toBe(false);
      expect(hasAny(" * any value")).toBe(false);
    });

    it("should respect the ignore flag", () => {
      expect(hasAny("const x: any = 1; // ignore-any-check")).toBe(false);
    });
  });

  describe("scanFile function", () => {
    const testFilePath = path.join(__dirname, "temp-test-file.ts");

    afterEach(() => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it("should return line numbers and content for matches", () => {
      const content = `
                const a = 1;
                const b: any = 2;
                // ignore any here
                const c = "company";
                const d = data as any;
                const e: any = 5; // ignore-any-check
            `;
      fs.writeFileSync(testFilePath, content);

      const results = scanFile(testFilePath);

      // Beklenen: satır 3 (b: any) ve satır 6 (as any).
      // Satır 4 yorum, satır 5 "company", satır 7 ignore flag.
      expect(results).toHaveLength(2);

      expect(results[0].line).toBe(3);
      expect(results[0].content).toContain("const b: any = 2;");

      expect(results[1].line).toBe(6);
      expect(results[1].content).toContain("const d = data as any;");
    });
  });
});
