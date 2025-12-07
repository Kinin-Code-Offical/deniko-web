# Deniko - Professional Hybrid Tutoring SaaS

Deniko is a comprehensive SaaS platform designed to digitize and streamline the educational experience for private tutors, coaching centers, and students. It bridges the gap between traditional teaching and digital management by offering tools for scheduling, student tracking, performance analytics, and financial management.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma 7](https://www.prisma.io/)
- **Authentication:** [Auth.js v5](https://authjs.dev/) (NextAuth)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **State & Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Containerization:** [Docker](https://www.docker.com/)
- **Deployment:** Google Cloud Run

> For a detailed list of dependencies and versions, see [TECH_STACK.md](./TECH_STACK.md).

## ✨ Key Features

- **Multi-Language Support (i18n):** Full support for Turkish (TR) and English (EN).
- **Role-Based Access Control:** Secure access for Admins, Tutors, and Students.
- **Dashboard:** Comprehensive analytics and management tools.
- **Scheduling:** Easy lesson planning and calendar integration.
- **Performance Tracking:** Monitor student progress with visual charts.
- **Legal Compliance:** Dedicated pages for Terms, Privacy, Cookies, and KVKK.
- **SEO Optimized:** Built-in metadata, sitemap, and structured data (JSON-LD).
- **Security:** XSS protection, sanitized inputs, and secure dependency management.
- **Code Quality:** Strict TypeScript type-checking, ESLint configuration, and automated scripts for i18n verification.

## 📂 Project Structure

```
deniko/
├── app/                # Next.js App Router pages and layouts
│   ├── [lang]/         # Localized routes (e.g., /en, /tr)
│   ├── api/            # API routes
│   └── ...
├── components/         # Reusable React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard widgets and views
│   ├── ui/             # Shadcn UI primitive components
│   └── ...
├── lib/                # Utility functions, database connection, etc.
├── prisma/             # Database schema and migrations
├── public/             # Static assets (images, robots.txt, etc.)
├── dictionaries/       # Localization JSON files
└── ...
```

## 🛠️ Setup Guide

Follow these steps to set up the project locally for development.

### 1. Clone the Repository

```bash
git clone https://github.com/Kinin-Code-Offical/deniko-web.git
cd deniko-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory. You can copy `.env.example` if it exists. Ensure the following keys are set:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/deniko?schema=public"

# Authentication (Auth.js)
AUTH_SECRET="your-generated-secret" # Generate with: npx auth secret
AUTH_URL="http://localhost:3000"

# OAuth Providers (Google)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Email / SMTP (Resend or similar)
RESEND_API_KEY="re_..."

# Cloud Storage (Google Cloud Storage)
GCS_BUCKET_NAME="your-bucket-name"
GCS_PROJECT_ID="your-project-id"
GCS_CLIENT_EMAIL="your-service-account-email"
GCS_PRIVATE_KEY="your-private-key"
```

#### TLS certificates for managed Postgres

If your Postgres provider (for example Google Cloud SQL) issues a custom TLS certificate, expose it via the following optional variables so the app can establish a secure connection:

```env
# Optional TLS inputs
DATABASE_SSL_CA="-----BEGIN CERTIFICATE-----\n..."
DATABASE_SSL_CERT="-----BEGIN CERTIFICATE-----\n..." # Only needed for mTLS
DATABASE_SSL_KEY="-----BEGIN PRIVATE KEY-----\n..."   # Only needed for mTLS
DATABASE_SSL_SKIP_VERIFY="false"                       # Set to "true" to bypass verification in dev
```

Paste multiline PEM values with `\n` escapes or store them base64-encoded. As an alternative, you can trust the CA globally by exporting `NODE_EXTRA_CA_CERTS="path/to/server-ca.pem"` before running `npm run dev`.

### 4. Database Setup

Push the Prisma schema to your local database:

```bash
npx prisma db push
```

Optionally, seed the database (if a seed script is available):

```bash
npx prisma db seed
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture Overview

The project follows the Next.js App Router structure:

- **`app/[lang]/`**: Contains all routes and pages. The `[lang]` segment handles internationalization (i18n).
  - **`dashboard/`**: Protected routes for authenticated users (Teachers/Students).
  - **`api/`**: Backend API routes (e.g., Auth handlers).
- **`actions/`**: Server Actions for data mutations and business logic. This is the primary way the frontend interacts with the database.
- **`components/`**: Reusable UI components.
  - **`ui/`**: Low-level Shadcn UI components.
  - **`dashboard/`**, **`auth/`**: Feature-specific components.
- **`lib/`**: Utility functions, database clients (`db.ts`), and shared logic.
- **`prisma/`**: Database schema and migrations.
- **`dictionaries/`**: JSON files for i18n translations (`en.json`, `tr.json`).

## ✨ Key Features

- **Authentication Flow:** Secure login/register with Email/Password and Google OAuth. Supports role-based access (Teacher/Student).
- **Shadow Accounts:** Teachers can create "Shadow Students" to manage data for students who haven't signed up yet. These profiles can be claimed by the actual student later via an invitation link.
- **Role-Based Dashboard:**
  - **Teachers:** Manage students, schedule lessons, track payments.
  - **Students:** View schedule, track progress, view assigned tasks.
- **Internationalization (i18n):** Full support for English and Turkish languages.
