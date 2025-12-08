# 📱 App Router Structure

This directory contains the main application logic, routing, and page definitions for the Deniko project, built with **Next.js 16 App Router**.

## 📂 Directory Structure

- **`[lang]/`**: The root of the localized application. All pages are wrapped in this dynamic route to handle internationalization (e.g., `/en/dashboard`, `/tr/dashboard`).
  - **`page.tsx`**: The landing page.
  - **`layout.tsx`**: The main layout wrapping the application.
  - **`dashboard/`**: Protected dashboard routes for authenticated users.
  - **`legal/`**: Static legal pages (Terms, Privacy, etc.).
  - **`auth/`**: Authentication pages (Login, Register).

- **`api/`**: Backend API routes (Next.js Route Handlers).
  - **`auth/`**: NextAuth.js endpoints.
  - **`webhooks/`**: Stripe or other webhook handlers.

- **`globals.css`**: Global Tailwind CSS styles and theme definitions.
- **`layout.tsx`**: The root layout (server-side) that applies global providers and fonts.
- **`not-found.tsx`**: Custom 404 page.

## 🔑 Key Concepts

- **Server Components:** By default, all components in `app/` are React Server Components (RSC). Use `"use client"` directive for interactive components.
- **Localization:** We use a path-based strategy (`/[lang]/...`). The `lang` parameter is passed to all pages and layouts to fetch the correct dictionary.
- **Metadata:** SEO metadata is generated dynamically in `page.tsx` or `layout.tsx` files using `generateMetadata`.

## TODO

- Generate metadata, JSON-LD, and canonical URLs from the locale dictionaries so `/[lang]` routes emit localized SEO texts.
- Expand the sitemap (or implement `generateSitemaps`) to cover new public routes automatically.
- Extract heavy middleware logic (rate limiting, CSP, locale sync) into composable helpers to simplify future changes.
