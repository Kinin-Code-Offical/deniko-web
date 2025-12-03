# 🧠 Deniko - Master System Instructions & Rules (Final Production Phase)

## 1. Project Identity & Mission
**Deniko** is a high-end, professional SaaS platform for hybrid tutors.
- **Goal:** To provide a "Sophisticated Simplicity" experience. It should feel like a premium tool (e.g., Linear, Raycast), not a generic admin panel.
- **Design Language:** Clean, spacious, mobile-first. Use subtle gradients, soft shadows, and meaningful transitions.
- **Brand Assets:**
  - **Primary:** Deep Blue (`#2062A3`).
  - **Logo:** `<DenikoLogo />` (SVG).

## 2. Tech Stack (Strict Versions)
- **Framework:** Next.js 15+ (App Router) with **i18n** (`app/[lang]/...`).
- **Database:** PostgreSQL via **Prisma ORM v6** (`lib/db.ts` singleton).
- **Auth:** NextAuth.js v5 Beta (Prisma Adapter).
- **UI:** Tailwind CSS v4 + **Shadcn/UI**.
- **Storage:** Google Cloud Storage (Private Bucket) via API Proxy.
- **Logging:** Pino (JSON in Prod, Pretty in Dev).

## 3. "Innovation & Polish" Guidelines (Active Initiatives)
*The AI is expected to proactively improve UX/UI:*
1.  **Micro-Interactions:** Add `hover:scale-[1.02]`, `active:scale-95`, and `transition-all` to clickable cards and buttons.
2.  **Empty States:** Never show a blank table. Create beautiful "Empty State" components with an icon, a text explanation, and a "Create New" button (e.g., "Henüz dersiniz yok. İlk dersinizi planlayın.").
3.  **Loading Skeletons:** Use `Skeleton` components that match the layout structure while data is fetching. Avoid layout shifts.
4.  **Mobile UX:** On mobile, ensure touch targets are large (`h-12`). Use `Drawer/Sheet` for complex forms instead of full-screen modals if possible.

## 4. Critical Architecture & Workflows

### A. Authentication & Onboarding (No-Loop Logic)
- **Account Linking:** `allowDangerousEmailAccountLinking: true` is ENABLED.
- **Resend Cooldown:** Client uses cookie; Server (`login` action) **DELETES** cookie on success.
- **Onboarding Gate:**
  - Check `user.isOnboardingCompleted`. If false -> Redirect `/onboarding`.
  - **Action:** Updates DB (Role/Phone/Pass) -> Sets `isOnboardingCompleted: true` -> Client calls `update()` -> Hard Redirect (`window.location.href`) to Dashboard.

### B. Student Management (Shadow & Claim Logic)
- **Shadow Account:** Teacher creates a profile (`userId: null`).
  - *Data:* `tempFirstName`, `phoneNumber` (saved to Profile).
  - *Avatar:* Uploaded to secure GCS bucket, path saved to DB.
- **Claiming (The Merge):** Student clicks `/join/[token]`.
  - *Logic:* `claimStudentProfile` action updates `userId` to real user, sets `isClaimed: true`.
  - *Preservation:* Copies Shadow Name to `StudentTeacherRelation.customName` so the teacher sees the name they know.
- **Permissions:**
  - Teacher CAN update: `customName`, `privateNotes`, and Shadow Profile data.
  - Teacher CANNOT update: Real User's `email`, `password`.

### C. Secure File Storage
- **Bucket:** Private (No public access).
- **Upload:** Server Action streams file to GCS, saves **path** (not URL) to DB.
- **Serving:** `<Avatar src="/api/files/..." />` calls a Proxy Route that checks `auth()` session before streaming the file from GCS.

### D. Dashboard Logic
- **Teacher View:**
  - **Hides Financials:** Income/Wallet data is strictly for the "Finance" page.
  - **Focus:** Active Students, Schedule, Homework Review.
- **Student View:** Next Lesson, Homework To-Do.

## 5. Internationalization (i18n) Standards
- **Route:** ALL pages must be in `app/[lang]/`.
- **Dictionary:** Use `getDictionary(lang)` for ALL text.
  - *Bad:* `<h1>Welcome</h1>`
  - *Good:* `<h1>{dictionary.dashboard.welcome}</h1>`
- **Persistence:** `proxy.ts` (middleware) reads/writes `NEXT_LOCALE` cookie.

## 6. Directory Structure Reference
```text
app/
  [lang]/
    (auth)/       -> login, register, verify, onboarding
    dashboard/    -> Protected routes
      page.tsx    -> Role dispatcher
      students/   -> List & Create (Shadow)
      files/      -> Secure Proxy Route (API)
    join/         -> Invite acceptance page
components/
  ui/             -> Shadcn primitives
  auth/           -> Auth forms
  dashboard/      -> Shell, Nav, TeacherView, StudentView
  students/       -> AddStudentDialog, StudentTable, StudentHeader
lib/
  db.ts           -> Prisma Singleton
  storage.ts      -> GCS Utility (Private)
  logger.ts       -> Structured Logger