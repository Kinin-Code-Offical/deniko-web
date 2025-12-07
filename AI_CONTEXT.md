# 🤖 AI Context & Project Overview

This document is designed to provide high-level context for AI assistants (Copilot, ChatGPT, Claude, etc.) working on the Deniko project.

## 🎯 Project Mission

Deniko is a SaaS platform for private tutors and coaching centers. It aims to digitize the management of students, lessons, and payments.

## 🏗️ Architecture Overview

- **Frontend:** Next.js 16 (App Router). heavily relies on Server Components. Client components are leaf nodes where possible.
- **Backend:** Next.js Route Handlers (`app/api`) + Server Actions.
- **Database:** PostgreSQL managed via Prisma ORM.
- **Auth:** Auth.js (NextAuth) v5. Uses JWT strategy.
- **Deployment:** Dockerized application running on Google Cloud Run.

## 🧩 Key Patterns

### 1. Internationalization (i18n)

- **Strategy:** Path-based routing (`/[lang]/...`).
- **Implementation:** No external i18n library for components. We fetch a raw JSON dictionary on the server and pass it down.
- **Rule:** Do not hardcode text. Always use `dictionary.section.key`.

### 2. Data Fetching

- **Server Components:** Fetch data directly from the DB using Prisma (`db.user.find...`).
- **Client Components:** Use Server Actions or API routes via React Query (if installed) or `fetch`.
- **Caching:** Utilize Next.js Request Memoization and Data Cache where appropriate.

### 3. Styling

- **Tailwind CSS v4:** Use utility classes.
- **Shadcn UI:** We use a copy-paste component library. Components are in `components/ui`.
- **Dark Mode:** Supported via `next-themes`.

### 4. Type Safety

- **Strict Mode:** TypeScript strict mode is enabled.
- **No `any`:** Avoid `any`. Define interfaces for props and data models.
- **Zod:** Use Zod for form validation and API input parsing.

## 📂 Critical Directories

- `app/[lang]`: All page routes.
- `lib/db.ts`: Database client.
- `prisma/schema.prisma`: Data models.
- `dictionaries/`: Translation files.

## 🚀 Current Status

- **Phase:** Active Development / Beta.
- **Focus:** SEO optimization, Legal compliance pages, Mobile responsiveness.

## 📝 Note to AI

When generating code:

1. Check `package.json` for versions (Next.js 16, Prisma 7).
2. Prefer Server Actions over API routes for form submissions.
3. Always consider the `lang` parameter for i18n.
4. Use `lucide-react` for icons.
