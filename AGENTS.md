# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router entry points (`app/layout.tsx`, `app/page.tsx`) and global styles.
- `components/`: UI and feature components (panels, graph, account, and `components/ui/*`).
- `lib/`: Core types, data access, Supabase client/auth helpers, and utilities.
- `supabase/`: SQL schema (`supabase/schema.sql`) for tables and optional RLS policies.
- `public/`: Static assets and icons.
- `styles/`: Additional global CSS.

## Build, Test, and Development Commands
Use `pnpm` for all tasks.

```bash
pnpm dev    # Start local dev server at http://localhost:3000
pnpm build  # Production build
pnpm start  # Run production server
pnpm lint   # ESLint for the codebase
```

## Coding Style & Naming Conventions
- Language: TypeScript + React (client components marked with `'use client'`).
- Indentation: 2 spaces, LF line endings.
- Components use PascalCase filenames (e.g., `components/panels/data-manager-panel.tsx`).
- Reusable utilities live in `lib/` and are imported via the `@/` alias.
- Tailwind is used for styling; prefer utility classes over custom CSS unless shared globally.

## Testing Guidelines
- No automated tests are currently configured.
- If you add tests, also add scripts (e.g., `pnpm test`) and document the runner here.

## Commit & Pull Request Guidelines
- Commit messages follow a Conventional Commit style (example: `docs: refresh README and init repo`).
- Keep commits focused and scoped to a single change.
- PRs should include:
  - A short summary of changes and why.
  - Steps to verify (commands or manual steps).
  - Screenshots for UI changes when applicable.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and set Supabase values if using `DATA_SOURCE=supabase` or auth.
- Supabase writes are client-side using the anon key; enable RLS and define policies when needed.
- Auth modes (`disabled|optional|required`) are controlled by `NEXT_PUBLIC_AUTH_MODE`.
