# 🧠 Deniko - Master System Instructions & Rules (Phase 2)

## 1. Project Context & Identity
**Deniko** is a professional SaaS platform for hybrid tutors (freelance & institution-based). It manages academic processes, finances, and communication.
- **Current Phase:** Core Feature Development (Dashboard & Student Management).
- **Design Philosophy:** "Sophisticated Simplicity." High-end, trustworthy, and clean.
- **Brand Assets:** Primary Logo is `/public/logo.svg` (The Blue 'D' with Graduation Cap). Primary Color: **Deep Blue** (Blue-600).

## 2. Tech Stack (Strict Versions)
- **Framework:** Next.js 15 (App Router) with **i18n routing** (`app/[lang]/...`).
- **Language:** TypeScript (Strict mode).
- **Database:** PostgreSQL (Google Cloud SQL) via **Prisma ORM v6** (`lib/db.ts` singleton).
- **Auth:** NextAuth.js (Auth.js) v5 Beta (Prisma Adapter).
- **UI:** Tailwind CSS v4 + **Shadcn/UI**.
- **Infrastructure:** Google Cloud Run (Docker Standalone).

## 3. Critical Architecture & Workflows

### A. Internationalization (i18n) - **MANDATORY**
- **Structure:** All pages MUST reside under `app/[lang]/...`. Never create a page outside this dynamic route.
- **Dictionaries:** Use `getDictionary(lang)` from `lib/get-dictionary.ts` for all static text.
- **Client Components:** Pass dictionary data as props to Client Components.

### B. Authentication & Onboarding (Fixed Logic)
- **Middleware:** Protected routes redirect unauthenticated users to `/[lang]/login`.
- **Account Linking:** `allowDangerousEmailAccountLinking: true` is ENABLED in `auth.ts` to merge Google/Manual accounts.
- **Onboarding Flow:**
  1. User Register/Login (Google or Manual).
  2. Middleware checks `isOnboardingCompleted` (or role).
  3. If incomplete -> Force redirect to `/[lang]/onboarding`.
  4. **Onboarding Page:** Collects Role, Phone, and Password (if missing).
  5. **Completion:** Server Action updates DB -> Client calls `update()` session -> Redirects to `/dashboard`.
  
### C. Mobile-First UI Standards (CRITICAL)
1.  **Layout Strategy:**
    - **Auth Pages:** On mobile, stack elements vertically (`flex-col`). On desktop, use side-by-side (`md:flex-row`).
    - **Dashboard:**
      - **Desktop:** Fixed Sidebar (Left).
      - **Mobile:** Top Header with a Hamburger Menu that opens a **Shadcn Sheet** (Drawer).
2.  **Tables & Data:**
    - All tables MUST have a wrapper with `overflow-x-auto` to prevent breaking layout on small screens.
    - Consider using "Card View" for data lists on mobile instead of complex tables.
3.  **Touch Targets:** Buttons and inputs must be easily tappable (min height 44px on mobile).
4.  **Navigation:** Use `<Sheet>` component for mobile navigation menus.

### D. Dashboard Architecture (The Next Step)
- **Route:** `/[lang]/dashboard` is the main entry.
- **Role Separation:**
  - **Teacher:** Sees "Students", "Schedule", "Finance".
  - **Student:** Sees "My Lessons", "Homework", "Exams".
- **Layout:** Use `components/dashboard/shell.tsx` (Sidebar + Header).

## 4. Coding Standards

### Server Actions & Mutations
- **Pattern:** Use Server Actions for ALL data mutations (Create/Update/Delete).
- **Validation:** MUST use **Zod** schemas for input validation inside the action.
- **Auth Check:** Always call `const session = await auth()` inside actions. If null, throw "Unauthorized".
- **Error Handling:** Return `{ error: string }` or `{ success: true, data: ... }`. Do not just throw errors if UI needs to handle them gracefully.

### UI/UX Guidelines
- **Components:** Reuse `components/ui/*`. Do not reinvent primitives.
- **Branding:** Use `<DenikoLogo />` component for branding.
- **Responsive:** All tables and layouts must work on mobile (use `Sheet` for menus).
- **Back Button:** Auth pages must have a "Go Back" button.

## 5. Directory Structure Reference
```text
app/
  [lang]/
    (auth)/       -> login, register, verify, onboarding
    dashboard/    -> Protected routes
      page.tsx    -> Role dispatcher (TeacherView vs StudentView)
      students/   -> Student management module
      finance/    -> Finance module
    layout.tsx    -> Root layout with Providers
components/
  ui/             -> Shadcn primitives (button, card, etc.)
  auth/           -> Auth forms (LoginForm, RegisterForm, ResendAlert)
  dashboard/      -> Shell, Nav, UserNav
  shared/         -> DenikoLogo, LanguageSwitcher
lib/
  db.ts           -> Prisma singleton (DO NOT import PrismaClient directly)
  auth.ts         -> NextAuth config
  email.ts        -> Nodemailer utility
```

## 6. Docker & Deployment Safety

 - **Output:** next.config.ts has output: "standalone". Do not break this.

 - **Env Vars:** Use process.env. Do not hardcode.

 - **Images:** External images (Google user content) are allowed in config.