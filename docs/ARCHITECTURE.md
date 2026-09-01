# Bayside Hub architecture

This document explains the responsibility of each part of the application. Keep
implementation details in code comments only when a future maintainer needs to
understand a security boundary, business rule, or non-obvious tradeoff.

## Request flow

1. `src/proxy.ts` refreshes the Supabase session and redirects unauthenticated
   users away from account and administration routes.
2. App Router pages in `src/app` render the public or signed-in experience.
3. Server Components load data through `src/lib`; Client Components are used
   only where browser state or interactive forms are required.
4. Server Actions validate untrusted form input, check authorization again, and
   write through the server-side Supabase client.
5. Supabase Row Level Security is the final authorization boundary. UI checks
   improve usability but are never treated as security controls.

## Source directories

| Path | Responsibility |
| --- | --- |
| `src/app/(hub)` | Main product routes sharing the navigation shell. |
| `src/app/(hub)/admin` | Staff/admin operations; server actions enforce roles. |
| `src/app/(hub)/clubs/manage` | Club content, board, advisor, media, and compliance management. |
| `src/app/api` | Read-only HTTP endpoints such as search. |
| `src/app/auth` | OAuth callback and sign-out endpoints. |
| `src/components` | Reusable navigation, cards, forms, and UI primitives. |
| `src/lib` | Data access, authentication, validation, and domain transformations. |
| `src/lib/supabase` | Browser/server clients, session middleware, and database types. |
| `supabase` | Ordered, repeatable database migrations and RLS policies. |

## Data strategy

The app prefers published Supabase records. Curated static records in
`src/lib/data.ts` are an intentional fallback for local development and for a
temporary backend outage; they are not duplicate production storage. Mapping
functions convert database rows into small public view models before rendering.

## Authorization model

- `profiles.role` stores the global role: student, advisor, staff, or admin.
- A student board position is scoped through `club_officers`, allowing one
  student to hold positions in multiple clubs without receiving global power.
- Advisors are scoped through `club_advisors`.
- Officers may maintain assigned-club content. Advisors and staff govern member
  reviews and board assignments. Only staff/admins assign faculty advisors.
- `club_audit_log` is append-only from the application perspective and records
  governance/content mutations for investigation.

## Environment and deployment

Only `.env.example` is committed. Real Supabase keys belong in `.env.local` or
the Vercel environment settings. When importing the GitHub repository into
Vercel, set the Root Directory to `bayside-hub`.

## Commenting convention

Prefer names and small functions over narration. Add comments for:

- permission boundaries and defense-in-depth checks;
- school-policy rules that are not obvious from the code;
- fallback behavior and compatibility migrations;
- cleanup/rollback logic around multi-step writes.

Avoid comments that merely repeat the next line, since they become stale without
helping reviewers understand the system.
