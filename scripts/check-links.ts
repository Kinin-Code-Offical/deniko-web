import fs from "fs";
import path from "path";

// Configuration
const APP_DIR = path.join(process.cwd(), "app");
const COMPONENTS_DIR = path.join(process.cwd(), "components");
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

// Known dynamic routes patterns to ignore or handle
const IGNORED_PREFIXES = [
  "http",
  "https",
  "mailto:",
  "tel:",
  "#",
  "javascript:",
];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function extractLinks(content: string): string[] {
  const links: string[] = [];
  // Match Link href="..." or href={'...'} or href={"..."}
  const linkRegex = /<Link[^>]*href=\{?["']([^"'}]+)["']\}?[^>]*>/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  return links;
}

function checkRouteExists(route: string): boolean {
  // Remove query params and hash
  const cleanRoute = route.split("?")[0].split("#")[0];

  // Handle root
  if (cleanRoute === "/" || cleanRoute === "") return true;

  const parts = cleanRoute.split("/").filter(Boolean);

  // Helper to check if a path exists with various extensions
  const exists = (p: string) => {
    return (
      fs.existsSync(path.join(p, "page.tsx")) ||
      fs.existsSync(path.join(p, "page.ts")) ||
      fs.existsSync(path.join(p, "route.ts")) || // API routes
      fs.existsSync(path.join(p, "route.tsx"))
    );
  };

  // 1. Check exact path in app/ (e.g. app/login)
  if (exists(path.join(APP_DIR, ...parts))) return true;

  // 2. Check in app/[lang]/ (e.g. app/[lang]/login)
  if (exists(path.join(APP_DIR, "[lang]", ...parts))) return true;

  // 3. Check if the first part is a locale and strip it (e.g. /tr/login -> app/[lang]/login)
  if (parts.length > 0 && parts[0].length === 2) {
    const partsWithoutLocale = parts.slice(1);
    if (exists(path.join(APP_DIR, "[lang]", ...partsWithoutLocale)))
      return true;
  }

  // 4. Check for dynamic segments (e.g. /dashboard/students/123 -> app/[lang]/dashboard/students/[studentId])
  // This is a simple heuristic: if we can't find the exact path, we look for directories starting with '['
  // This is complex to do perfectly without a full router, but we can try a simple walk.
  // For now, we'll assume if it fails the above, it might be broken, UNLESS it matches a known pattern.

  return false;
}

async function main() {
  console.log("🔍 Scanning for broken internal links...");

  const files = [...getAllFiles(APP_DIR), ...getAllFiles(COMPONENTS_DIR)];

  let brokenLinksCount = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    const links = extractLinks(content);

    links.forEach((link) => {
      if (IGNORED_PREFIXES.some((prefix) => link.startsWith(prefix))) return;

      // Ignore dynamic links for now (containing ${...} or [)
      if (link.includes("${") || link.includes("[") || link.includes("+"))
        return;

      if (!checkRouteExists(link)) {
        // Try one more heuristic: maybe it's a public file?
        const publicPath = path.join(process.cwd(), "public", link);
        if (fs.existsSync(publicPath)) return;

        console.error(
          `❌ Broken link found in ${path.relative(process.cwd(), file)}: ${link}`
        );
        brokenLinksCount++;
      }
    });
  });

  if (brokenLinksCount === 0) {
    console.log("✅ No broken static links found!");
  } else {
    console.log(`⚠️ Found ${brokenLinksCount} potentially broken links.`);
  }
}

main().catch(console.error);
