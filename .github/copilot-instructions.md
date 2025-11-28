# 🧠 Deniko - AI System Instructions & Rules

## 1. Project Context & Identity
**Deniko** is a professional SaaS platform designed for hybrid tutors (freelance & institution based). It manages academic processes, finances, and communication.
- **Core Philosophy:** "The Teacher's Assistant." The system supports "Shadow Accounts" (students without real accounts managed by teachers).
- **Target Audience:** Private Tutors, Coaching Centers, Students, Parents.

## 2. Tech Stack (Strict Versions)
- **Framework:** Next.js 15 (App Router). **Strictly avoid Pages Router.**
- **Language:** TypeScript (Strict mode).
- **Database:** PostgreSQL (Google Cloud SQL) via **Prisma ORM v6**.
- **Auth:** NextAuth.js (Auth.js) v5.
- **UI:** Tailwind CSS v4 + **Shadcn/UI**.
- **Infrastructure:** Google Cloud Run (Docker Standalone) + Cloud Build.

## 3. Architecture & Coding Conventions

### A. Next.js & Server Actions
- **Data Fetching:** Fetch data directly in **Server Components** using `db` (Prisma). Do NOT use `useEffect` for data fetching unless absolutely necessary.
- **Mutations:** Use **Server Actions** for all create/update/delete operations.
- **Client Components:** Add `"use client"` only to leaf nodes (buttons, forms, interactive UI). Keep page layouts as Server Components.

### B. Database & Prisma (Crucial)
- **Singleton Pattern:** Always import the Prisma client from `@/lib/db`. Do not instantiate `new PrismaClient()`.
- **Shadow Accounts Logic:** - A `StudentProfile` does NOT always have a `userId`. If `userId` is null, it is a "Shadow Student".
  - When querying students, handle both cases (Real vs. Shadow).
- **Schema Awareness:** Always check `prisma/schema.prisma`.
  - **Exams:** Distinguish between `SchoolExam` (Grade only) and `TrialExam` (TYT/AYT net calculation).
  - **Payments:** Default `isVisibleToStudent` is `false`.

### C. Styling (Shadcn/Tailwind)
- **Utils:** Always use `cn()` from `@/lib/utils` for class merging.
- **Colors:** Primary brand color is Blue (`bg-blue-600`), neutral is Slate/Zinc.
- **Components:** Reuse components from `@/components/ui`. DO NOT reinvent the wheel. If you need a card, import `Card`.

### D. Docker & Deployment Rules
- **Output:** `next.config.ts` must have `output: "standalone"`.
- **Binary Targets:** Prisma schema must include `linux-musl-openssl-3.0.x` for Alpine Linux compatibility.
- **Environment:** Never hardcode secrets. Use `process.env`.
- **Image Optimization:** Remember to allow `storage.googleapis.com` in `next.config.ts`.

## 4. Critical Business Logic (Do Not Hallucinate)

1.  **Teacher-Student Relation:** It is Many-to-Many. A student can have multiple teachers.
2.  **Lesson Types:**
    - `PRIVATE`: Paid lessons (Included in financial calc).
    - `INSTITUTION`: Salary-based (Excluded from wallet/balance, price is usually 0).
3.  **Notifications:** We use "Deep Linking". Notifications must have a `route` field pointing to the relevant page (e.g., `/student/homework/123`).

## 5. Directory Structure
- `app/` -> App Router pages and layouts.
- `components/ui/` -> Shadcn primitive components.
- `components/` -> Feature-specific components (e.g., `components/auth/login-form.tsx`).
- `lib/` -> Utilities, database client, auth config.
- `prisma/` -> Schema and migrations.