Deniko - Master System Instructions & Rules

1. Project Context & Identity

Deniko is a high-end, professional SaaS platform for hybrid tutors (freelance & institution-based). It manages academic processes, finances, and communication.

    Design Philosophy: "Sophisticated Simplicity." Use a 50/50 split layout for entry pages. High-end, trustworthy, and clean.

    Brand Assets: Use /public/logo.svg (preferred) or /public/logo.png for branding. The primary color is the Deep Blue found in the logo.

2. Tech Stack (Strict Versions)

    Framework: Next.js 15 (App Router) with Internationalization (i18n) routing ([locale]).

    Language: TypeScript (Strict mode).

    Database: PostgreSQL (Google Cloud SQL) via Prisma ORM v6.

    Auth: NextAuth.js (Auth.js) v5 Beta.

    UI: Tailwind CSS v4 + Shadcn/UI.

    Infrastructure: Google Cloud Run (Docker Standalone).

3. Critical Architecture & Workflows

A. Internationalization (i18n) - MANDATORY

    Structure: All pages must reside under app/[locale]/....

    Config: Use i18n-config.ts to define locales: ['tr', 'en'] (default tr).

    Middleware: Middleware must handle locale detection and redirection strictly.

    Components: Use a LanguageSwitcher component in the top-right of Auth/Public pages.

B. Authentication & Security (Fixed Logic)

    Google & Manual Merge: To fix "OAuthAccountNotLinked" errors, set allowDangerousEmailAccountLinking: true in the Google Provider config within auth.ts. This allows a manual email user to later sign in with Google.

    Registration (Manual):

        Collect: firstName, lastName, email, phone (with country code), password, role.

        Validation: Zod schema must enforce:

            Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.

            Phone: Valid format with country code.

        Verification: Send an email via Nodemailer (lib/email.ts). Redirect to /verify.

    Onboarding Loop Fix:

        In app/[locale]/onboarding/page.tsx, check: if (session.user.role) redirect('/dashboard'). Never show onboarding if the role is already set.

C. UI/UX Standards (The "Premium" Look)

    Auth Layout (Login/Register):

        50/50 Split Screen:

            Left: Deep Blue/Gradient background, Logo, and a contextual Illustration/Tagline.

            Right: Clean white form, centered.

        Back Button: Every auth page must have a "Go Back" (< ChevronLeft) button at the top left.

    Components:

        Use DenikoLogo.tsx (rendering the SVG) for crisp branding.

        Forms must use react-hook-form + zod with proper error messages translated via i18n.

        Buttons: Use Shadcn buttons with loading states (useTransition or useFormStatus).

4. Directory Structure Rules

Plaintext

app/
  [locale]/
    login/page.tsx
    register/page.tsx
    onboarding/page.tsx
    dashboard/page.tsx
    layout.tsx (Root layout with i18n provider)
components/
  ui/ (Shadcn primitives)
  auth/ (LoginForm, RegisterForm, GoogleButton)
  dashboard/ (Shell, Nav, UserNav)
  shared/ (DenikoLogo, LanguageSwitcher, BackButton)
lib/
  db.ts (Prisma Singleton)
  auth.ts (NextAuth Config)
  email.ts (Nodemailer Logic)
  validations/ (Zod schemas)
messages/ (JSON files for tr/en translations)

5. Development Safety Checks

    Before generating code: Always import db from @/lib/db, never instantiate new PrismaClient().

    Docker compatibility: Ensure output: "standalone" is in next.config.ts.

    Environment: Never hardcode secrets. Use process.env.