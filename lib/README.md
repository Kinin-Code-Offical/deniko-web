# 🛠️ Library & Utilities

This directory contains utility functions, shared logic, and configuration files that power the application.

## 📂 Key Files

- **`db.ts`**: The global Prisma Client instance. Use this to interact with the database. It handles connection pooling in development to prevent "too many connections" errors.
- **`utils.ts`**: General helper functions, including the `cn` utility for merging Tailwind classes.
- **`auth.ts`**: NextAuth.js configuration, including providers, callbacks, and session logic.
- **`get-dictionary.ts`**: The server-side utility for loading i18n dictionaries based on the requested locale.
- **`email.ts`**: Configuration and helpers for sending emails (via Nodemailer or Resend).
- **`storage.ts`**: Helpers for interacting with Google Cloud Storage or local file storage.

## 🔍 Best Practices

- **Statelessness:** Functions here should generally be pure and stateless.
- **Type Safety:** All utilities should be strictly typed with TypeScript.
- **Server-Only:** Files that access the database or secret keys (like `db.ts`) should be kept out of the client-side bundle. Next.js usually handles this, but be mindful of imports.
