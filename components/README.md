# 🧩 Components

This directory houses all the reusable React components used across the application.

## 📂 Organization

- **`ui/`**: Low-level, reusable UI primitives (Buttons, Inputs, Dialogs, etc.). These are mostly built with **Shadcn UI** and **Radix UI**.
  - _Example:_ `button.tsx`, `card.tsx`, `dialog.tsx`.

- **`auth/`**: Components specific to authentication flows.
  - _Example:_ `login-form.tsx`, `register-form.tsx`, `user-button.tsx`.

- **`dashboard/`**: Complex widgets and views used in the user dashboard.
  - _Example:_ `sidebar.tsx`, `stats-card.tsx`, `recent-sales.tsx`.

- **`landing/`**: Components used specifically on the marketing landing page.
  - _Example:_ `hero.tsx`, `features.tsx`, `pricing.tsx`.

- **`providers/`**: Context providers that wrap the application.
  - _Example:_ `theme-provider.tsx`, `query-provider.tsx`.

## 🎨 Styling

- We use **Tailwind CSS v4** for styling.
- Components in `ui/` are designed to be headless and accessible, following WAI-ARIA patterns via Radix UI.
- Icons are provided by **Lucide React**.

## 📝 Usage Guidelines

1. **Prefer Server Components:** Keep components as Server Components unless they need interactivity (state, effects, event listeners).
2. **"Use Client":** If a component needs interactivity, add `"use client"` at the top.
3. **Composition:** Build complex UIs by composing smaller `ui/` primitives.
