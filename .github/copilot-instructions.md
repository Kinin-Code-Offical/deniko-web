# 🧠 Deniko - Master System Instructions & Rules

## Tech Stack
- **Framework:** Next.js 16+ (App Router)
- **Database:** Prisma ORM v6
- **Storage:** Google Cloud Storage (Private)

## CRITICAL: Build & Configuration Rules
1. **Server External Packages:** Always add heavy server libraries (bcrypt, storage, nodemailer) to `serverExternalPackages` in `next.config.ts`.
2. **Imports:** ALWAYS use `import * as bcrypt from "bcryptjs"`.
3. **Lazy Loading:** NEVER initialize `new Storage()` globally in `lib/storage.ts`. Use a lazy getter.

## Architecture
- **Middleware:** The middleware file must be named `middleware.ts`.
- **Avatars:** Use `getSignedUrl` for fetching profile pictures (Performance).
- **Docs:** Use Proxy Route only for sensitive files.
