# Deniko - Professional Hybrid Tutoring SaaS

Deniko is a comprehensive SaaS platform designed to digitize and streamline the educational experience for private tutors, coaching centers, and students. It bridges the gap between traditional teaching and digital management by offering tools for scheduling, student tracking, performance analytics, and financial management.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Auth.js v5](https://authjs.dev/) (NextAuth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Containerization:** [Docker](https://www.docker.com/)
- **Deployment:** Google Cloud Run

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
