# Archmod — Industrial EA Modeler

A client-side enterprise architecture modeler focused on industrial/OT/IT landscapes. It renders a graph of entities and relationships, supports filtering and editing, and can persist data locally or in Supabase with optional Google OAuth.

## Features
- Interactive graph with semantic filtering by dimension, type, status, search, and zone crossings.
- Create/edit/delete entities and relationships.
- Auto-layout (dagre) and PNG export.
- Import/export JSON and CSV.
- Local storage or Supabase persistence.
- Optional or required auth modes via Supabase Google OAuth.

## Tech Stack
- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (optional)

## Quick Start
```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`.

## Environment Configuration
Copy `.env.example` to `.env` and set values as needed:

- `NEXT_PUBLIC_AUTH_MODE`: `disabled` | `optional` | `required`
- `NEXT_PUBLIC_DATA_SOURCE`: `local` | `supabase`
- `NEXT_PUBLIC_ENABLE_SAMPLE_DATA`: `true` | `false`
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_DB_URL`: Optional, only needed for external tooling

Behavior notes:
- If `DATA_SOURCE=supabase` and Supabase is not configured, the app falls back to local data and shows an error banner.
- If `AUTH_MODE=required` and no session is present, the UI is gated until sign-in completes.
- Local mode stores data under the browser key `archmod-data-v1`.

## Supabase Setup
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` via the SQL editor.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`.
4. If you want auth, enable Google provider in Supabase Auth.
5. If you want to protect data, enable RLS and add policies (examples are included in the SQL file as comments).

## Auth Modes
- `disabled`: No auth UI, no session tracking.
- `optional`: Auth UI is available but not required to use the app. Best for demos.
- `required`: App is gated until a session is present.

## Import / Export
- JSON import replaces **both** entities and relationships.
- Entities CSV import replaces entities and **clears relationships**.
- Relationships CSV import replaces relationships only.
- PNG export captures the current graph view.

## Scripts
```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Notes for Production
- Supabase writes are performed client-side with the anon key. Enable RLS and policies to protect data.
- If `AUTH_MODE=optional` and RLS requires authentication, unauthenticated users will see errors and the app will fall back to local data.

