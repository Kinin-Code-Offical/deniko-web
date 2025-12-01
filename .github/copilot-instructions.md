# 🧠 Deniko - Master System Instructions & Rules (Phase 2: Dashboard & Core Features)

## 1. Project Context & Identity
**Deniko** is a professional SaaS platform for hybrid tutors (freelance & institution-based).
- **Current Phase:** Core Feature Development (Dashboard & Student Management).
- **Design Philosophy:** "Sophisticated Simplicity." High-end, trustworthy, mobile-first.
- **Brand Assets:** Primary Logo: `<DenikoLogo />` (SVG). Primary Color: **Deep Blue** (`#2062A3`).

## 2. Tech Stack (Strict Versions)
- **Framework:** Next.js 15 (App Router) with **i18n routing** (`app/[lang]/...`).
- **Language:** TypeScript (Strict mode).
- **Database:** PostgreSQL (Google Cloud SQL) via **Prisma ORM v6** (`lib/db.ts` singleton).
- **Auth:** NextAuth.js (Auth.js) v5 Beta (Prisma Adapter).
- **UI:** Tailwind CSS v4 + **Shadcn/UI**.
- **Infrastructure:** Google Cloud Run (Docker Standalone).

## 3. Critical Business Logic & Rules

### A. Authentication & User Flow
- **Account Linking:** `allowDangerousEmailAccountLinking: true` is ENABLED in `auth.ts` (Merges Google/Manual accounts).
- **Resend Cooldown:** Client uses `resend_cooldown` cookie. Server Action (`login`) **DELETES** this cookie on successful redirect.
- **Onboarding Gate:** Users cannot access `/dashboard` if `user.isOnboardingCompleted` is `false`.
  - **Flow:** Register/Login -> Middleware Check -> Redirect `/onboarding` (if incomplete) -> Select Role/Phone -> Update DB -> Client `update()` session -> Redirect `/dashboard`.

### B. Student Management (Shadow Accounts)
- **Concept:** Teachers create students who do NOT have a User account yet.
- **Schema Rule:** `StudentProfile` has a nullable `userId`.
  - `userId: null` = **Shadow Account** (Managed by Teacher).
  - `userId: "uuid"` = **Real Account** (Claimed by Student via Invite Token).
- **Relation:** `StudentTeacherRelation` connects Teachers and Students.

### C. Dashboard Logic (Role-Based)
- **Route:** `/[lang]/dashboard` is the main entry point.
- **Teacher View:**
  - **Focus:** Operational efficiency (Schedule, Active Students, Pending Homework).
  - **Privacy Rule:** **Financial data (Income/Wallet) must be HIDDEN** from the main dashboard summary cards. Accessible ONLY via "Finans" sidebar menu.
- **Student View:**
  - **Focus:** Action items (Next Lesson, Homework To-Do).

## 4. UI/UX & Coding Standards

### Internationalization (i18n)
- **Structure:** ALL pages reside in `app/[lang]/`.
- **Content:** NEVER hardcode text. Use `dictionary` props passed from Server Components.
- **Persistence:** `middleware.ts`(proxy.ts) reads/writes `NEXT_LOCALE` cookie.

### Component Architecture
- **Mobile-First Strategy:**
  - **Auth Pages:** Stacked (`flex-col`) on mobile, Split (`flex-row`) on desktop.
  - **Dashboard:** Sticky Header + Hamburger Menu (`Sheet`) on mobile. Fixed Sidebar on desktop.
- **Forms:** Use `react-hook-form` + `zod`.
- **Data Fetching:** Fetch data in Server Components (`page.tsx`) and pass to Client Views (`view.tsx`).

## 5. Directory Structure Reference
```text
app/
  [lang]/
    (auth)/       -> login, register, verify, onboarding
    dashboard/    -> Protected routes
      page.tsx    -> Role dispatcher (TeacherView vs StudentView)
      students/   -> Student management (Shadow Accounts)
    layout.tsx    -> Root layout with Providers
components/
  ui/             -> Shadcn primitives
  auth/           -> Auth forms
  dashboard/      -> Shell, Nav, UserNav, TeacherView, StudentView
  students/       -> AddStudentDialog, StudentTable
lib/
  db.ts           -> Prisma singleton
  auth.ts         -> NextAuth config