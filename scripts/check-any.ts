import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Taranacak dosya uzantıları
const EXTENSIONS = [".ts", ".tsx"];
// Taranmayacak klasörler
const IGNORE_DIRS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".git",
  ".vscode",
  "deniko/scripts/check-any.test.ts",
  "deniko/scripts/check-any.ts",
];

/**
 * Bir satırda 'any' kullanımı olup olmadığını kontrol eder.
 * - Yorum satırlarını (//, /*, *) atlar.
 * - 'ignore-any-check' içeren satırları atlar.
 * - Kelime sınırı (\b) kullanarak "company", "many" gibi kelimeleri eşleştirmez.
 * - String içindeki "any" kelimesini ayırt edemez (Regex kısıtı), bunun için ignore kullanın.
 */
export function hasAny(line: string): boolean {
  const trimmed = line.trim();

  // Basit yorum kontrolü
  if (trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/*")) return false;
  if (trimmed.startsWith("*")) return false;

  // Manuel kaçış (escape hatch)
  if (line.includes("ignore-any-check")) return false;

  // 'any' kelimesini tam kelime olarak ara
  // Ancak "sizes: 'any'" veya 'sizes: "any"' gibi geçerli string değerlerini hariç tut
  if (/sizes:\s*["']any["']/.test(line)) return false;

  return /\bany\b/.test(line);
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
      if (hasAny(line)) {
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
  console.log("🔍 Scanning for explicit 'any' usage...");

  const rootDir = process.cwd();
  const files = getAllFiles(rootDir);
  let errorCount = 0;
  let fileCount = 0;

  files.forEach((file) => {
    // Bu scriptin kendisini ve test dosyasını tarama dışı bırak
    if (file.includes("check-any.ts") || file.includes("check-any.test.ts"))
      return;

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
      `❌ Found \x1b[31m${errorCount}\x1b[0m occurrences of 'any' in ${fileCount} files.`
    );
    console.log("💡 Tip: Use // ignore-any-check to bypass specific lines.");
    process.exit(1);
  } else {
    console.log("✅ No explicit 'any' found! Great job.");
    process.exit(0);
  }
}
