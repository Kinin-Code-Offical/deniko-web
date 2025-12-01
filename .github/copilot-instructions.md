# 🧠 Deniko - Master System Instructions & Rules (Fix & Polish Phase)

## 1. Project Status & Context
**Deniko** is a live SaaS platform. We are in the **"Strict Polish & Core Logic"** phase.
- **Goal:** Eliminate all bugs, standardize UI, and enforce security rules.
- **Current State:** Auth is working, Dashboard is scaffolded but needs logic fixes.

## 2. Tech Stack (Immutable Rules)
- **Framework:** Next.js 15 (App Router) with **i18n** (`app/[lang]/...`).
- **Database:** PostgreSQL via **Prisma ORM v6** (`lib/db.ts`).
- **Auth:** NextAuth.js v5 Beta (`auth.ts`).
- **UI:** Tailwind CSS v4 + **Shadcn/UI**.
- **Logging:** Pino (Structured Logging).

## 3. CRITICAL BUG FIXING RULES (Must Follow)

### A. Dashboard & Onboarding Logic
1.  **No Dead Ends:** In `dashboard/page.tsx`, if `user.role` is missing or `isOnboardingCompleted` is false, **IMMEDIATELY redirect** to `/[lang]/onboarding`. Never return `null` or empty fragments.
2.  **Loop Prevention:** In `onboarding/page.tsx`, if `user.isOnboardingCompleted` is true, **IMMEDIATELY redirect** to `/[lang]/dashboard`.
3.  **Session Sync:** After `completeOnboarding` action success, the Client Component MUST call `await update()` and then force a hard navigation (`window.location.href`) to refresh cookies.

### B. Authentication Security
1.  **Resend Cookie:** The `login` Server Action MUST explicitly delete the `resend_cooldown` cookie upon a successful redirect (catch the `NEXT_REDIRECT` error).
2.  **Safe Links:** `auth.ts` MUST have `allowDangerousEmailAccountLinking: true`.
3.  **Session Validation:** The `session` callback must return `null` if the user is deleted from the DB.

### C. Logging Standards (STRICT)
- **FORBIDDEN:** `console.log`, `console.error`, `console.warn`.
- **REQUIRED:** Import `logger` from `@/lib/logger`.
- **Usage:** `logger.info({ userId: session.user.id, context: "onboarding" }, "User completed onboarding")`.

## 4. UI/UX & Design System

### Layouts & Responsiveness
- **Auth Pages:** - **Mobile:** Vertical Stack (Header Top, Form Bottom).
  - **Desktop:** 50/50 Split (Brand Left, Form Right).
- **Dashboard:**
  - **Mobile:** Sticky Header + Hamburger Menu (Sheet).
  - **Desktop:** Fixed Sidebar (w-64).
- **Tables:** ALWAYS wrap tables in `<div className="overflow-x-auto">` to prevent mobile overflow.

### Branding Assets
- **Logo:** Use `<DenikoLogo />` (SVG). 
  - **Blue Background:** Use `text-white`.
  - **White Background:** Use `text-[#2062A3]`.
- **Colors:** Primary Brand Color is **Deep Blue** (`#2062A3`).

## 5. Code Quality & i18n
- **No Hardcoded Text:** EVERY visible string must come from `dictionary` (e.g., `dictionary.auth.login.title`).
- **Server Actions:**
  - Must use **Zod** for validation.
  - Must check `await auth()` at the start.
  - Must return standardized objects: `{ success: boolean, message?: string, error?: string }`.
- **Imports:** Use absolute paths (`@/components/...`, `@/lib/...`).

## 6. Directory Structure Reference
```text
app/
  [lang]/
    (auth)/       -> login, register, verify, onboarding
    dashboard/    -> page.tsx (Router), students/, finance/
    legal/        -> terms, privacy
components/
  ui/             -> Shadcn primitives (Button, Card, Input...)
  auth/           -> LoginForm, RegisterForm, OnboardingForm
  dashboard/      -> Shell, Nav, UserNav, TeacherView, StudentView
  students/       -> AddStudentDialog, StudentTable
  shared/         -> DenikoLogo, LanguageSwitcher
lib/
  db.ts           -> Prisma Singleton
  auth.ts         -> NextAuth Config
  logger.ts       -> Pino Logger
  get-dictionary.ts -> i18n Loader