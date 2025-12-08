# 📜 Utility Scripts

This directory contains standalone scripts for maintenance, testing, and automation tasks.

## 📂 Files

- **`check-links.ts`**: Crawls the site (or a list of URLs) to check for broken links (404s).
- **`check-hardcoded.ts`**: Scans the codebase for hardcoded text strings to ensure full i18n compliance.
- **`check-any.ts`**: Checks for usage of the `any` type in TypeScript files to maintain type safety.
- **`check-user.js`**: A utility to verify user data or roles directly in the database (bypassing the UI).
- **`dev-exit-test.js`**: Used to test graceful shutdown procedures or specific dev-mode behaviors.
- **`analyze_issues.py`**: A Python script for analyzing project issues or logs (if applicable).

## 🚀 Running Scripts

Most scripts can be run using `ts-node` (for TypeScript) or `node` (for JavaScript).

```bash
# Run a TypeScript script
npx tsx scripts/check-links.ts

# Run a JavaScript script
node scripts/check-user.js
```

## ⚠️ Caution

These scripts often interact directly with the database or file system. **Use with caution**, especially in production environments.

## TODO

- Expose the most common scripts as npm scripts (e.g., `pnpm run check:i18n`).
- Document required environment variables/flags for each script.
- Wire the lint/check scripts into CI so regressions are caught automatically.

