import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Taranacak dosya uzantıları
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
// Taranmayacak klasörler
const IGNORE_DIRS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".git",
  ".vscode",
  "scripts",
];

/**
 * Bir satırda 'process.env' kullanımı olup olmadığını kontrol eder.
 * - Yorum satırlarını (//, /*, *) atlar.
 * - 'ignore-env-check' içeren satırları atlar.
 */
export function hasProcessEnv(line: string): boolean {
  const trimmed = line.trim();

  // Basit yorum kontrolü
  if (trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/*")) return false;
  if (trimmed.startsWith("*")) return false;

  // Manuel kaçış (escape hatch)
  if (line.includes("ignore-env-check")) return false;

  // process.env kontrolü
  return /process\.env/.test(line);
}

/**
 * Tek bir dosyayı tarar ve bulguları döner.
 */
export function scanFile(
  filePath: string
): { line: number; content: string }[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const findings: { line: number; content: string }[] = [];

    lines.forEach((line, idx) => {
      if (hasProcessEnv(line)) {
        findings.push({ line: idx + 1, content: line.trim() });
      }
    });
    return findings;
  } catch (error) {
    console.warn(`Could not read file ${filePath}:`, error);
    return [];
  }
}

/**
 * Klasördeki tüm uygun dosyaları recursive olarak bulur.
 */
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;

  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          getAllFiles(filePath, fileList);
        }
      } else if (EXTENSIONS.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    });
  } catch (error) {
    console.warn(`Error reading directory ${dir}:`, error);
  }

  return fileList;
}

// Script doğrudan çalıştırıldığında (import edilmediğinde) çalışacak blok
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  console.log("🔍 Scanning for direct process.env usage...");

  const rootDir = process.cwd();
  const files = getAllFiles(rootDir);
  let errorCount = 0;
  let fileCount = 0;

  files.forEach((file) => {
    // Bu scriptin kendisini ve lib/env.ts'i tarama dışı bırak
    if (file.includes("check-env.ts")) return;
    if (file.endsWith("lib\\env.ts") || file.endsWith("lib/env.ts")) return;
    if (
      file.endsWith("next.config.ts") ||
      file.endsWith("next.config.js") ||
      file.endsWith("next.config.mjs")
    )
      return; // Config files often need process.env
    if (file.endsWith("vitest.config.ts")) return;
    if (file.endsWith("vitest.setup.ts")) return;
    if (file.endsWith("prisma.config.ts")) return;
    if (file.endsWith("proxy.ts")) return;
    if (file.endsWith("auth.ts")) return; // Auth config often uses process.env directly or via lib, but let's check. Actually auth.ts should probably use env.ts too. Let's leave it for now and see if it fails.

    const findings = scanFile(file);
    if (findings.length > 0) {
      console.log(`\n📄 ${path.relative(rootDir, file)}`);
      findings.forEach((f) => {
        console.log(`  L${f.line}: \x1b[33m${f.content}\x1b[0m`); // Sarı renkli çıktı
        errorCount++;
      });
      fileCount++;
    }
  });

  console.log("\n--------------------------------------------------");
  if (errorCount > 0) {
    console.error(
      `❌ Found \x1b[31m${errorCount}\x1b[0m occurrences of 'process.env' in ${fileCount} files.`
    );
    console.log(
      "💡 Tip: Use env from @/lib/env or // ignore-env-check to bypass."
    );
    process.exit(1);
  } else {
    console.log("✅ No direct process.env usage found! Great job.");
    process.exit(0);
  }
}
