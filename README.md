# Bayside Hub

Bayside High School's one-stop platform for announcements, clubs, sports, events,
calendar, and opportunities — built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Google sign-in** via Supabase Auth (NYC student accounts)
- **Announcements** — published by staff, featured on the home page, with archive and version history
- **Activities & Clubs** — browsable club directory with filters, detail pages,
  Club 101 recommendations, membership requests, and a student club-application flow
- **Calendar** — layered month view of school events, sports, and recurring club meetings
- **Student dashboard** — signed-in students see joined clubs, pending requests,
  applications, and open support requests on the home page
- **Mobile calendar** — compact chronological list view with school, club, and sports layers
- **Opportunities** — elections, internships, college prep, service, and student discounts
- **Support** — guides, trackable requests, and a role-based user manual
- **Operations area** — staff review applications, publish announcements, and read reports;
  admins additionally manage user roles

## Tech stack

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, RSC)       |
| Styling   | Tailwind CSS v4 + Figma design tokens         |
| Fonts     | Montserrat (display), Lexend (brand), Geist   |
| Backend   | Supabase (Postgres + Auth + RLS)              |
| Deploy    | Any Node host (Vercel recommended)            |

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a project at [supabase.com](https://supabase.com), then copy the env
   template and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   Set `ALLOWED_EMAIL_DOMAINS` to a comma-separated list containing the student
   and staff domains that may access the Hub.

3. Apply the database migrations in the Supabase SQL Editor, in order:

   - `supabase/profiles.sql` — profiles table, role helper, triggers
   - `supabase/production_compatibility.sql` — only for an existing deployment
     using the original legacy club/application column names; preserves and
     backfills existing rows into the canonical schema
   - `supabase/admin_crud.sql` — announcements + club applications with RLS
   - `supabase/member_actions.sql` — club interests + event RSVPs (optional,
     enables "I'm interested" / "Count me in" buttons)
   - `supabase/security_hardening.sql` — required for existing databases created
     before the protected role-update function was added
   - `supabase/core_platform.sql` — canonical clubs, membership, advisor access,
     announcement history, events, opportunities, support requests, RLS, and starter data
   - `supabase/performance_indexes.sql` — production query indexes for feeds,
     calendar data, applications, meetings, and support queues
   - `supabase/club_governance.sql` — club-specific board permissions, advisor
     assignment controls, public photo storage, annual compliance, and audit history
   - `supabase/release_security_hardening.sql` — removes the obsolete privileged
     view and restricts API execution of internal database functions

4. Enable Google OAuth:

   - Supabase → Auth → Providers → Google (add your OAuth client ID/secret)
   - Google Cloud Console → OAuth client → add
     `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI
   - Supabase → Auth → URL Configuration → add `http://localhost:3000/auth/callback`
     (and your production URL later)

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Roles

| Role    | Access                                              |
| ------- | --------------------------------------------------- |
| student | Browse, join clubs, RSVP, submit applications and support requests |
| advisor | Student access plus management of assigned clubs    |
| staff   | Content, applications, support operations, and reports |
| admin   | Staff access plus user-role management              |

Roles are stored on `profiles.role` and enforced by Postgres RLS policies
(`is_admin()`, `is_staff_or_admin()`, and `can_manage_club()` helpers) plus route guards.
Promote the first admin manually in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Student board membership is intentionally **not** a global profile role. A
student is assigned through `club_officers` and may hold different positions in
multiple clubs. Active officers can edit their assigned clubs, schedules,
announcements, and photos. Advisors and staff control officer appointments;
only staff/admins assign faculty advisors.

## BHS Club Manual support

The platform implements these workflow aids from the BHS Club Manual:

- annual minimum-roster count (10 students) without storing S.O. card numbers;
- constitution and College Alignment Form status;
- annual event, community-service, and fundraiser completion checklist;
- club-specific officer titles and terms;
- faculty-advisor assignments;
- public photo galleries with required alt text;
- append-only club change history for authorized review.

The source manual remains the controlling school policy. Bayside Hub checklists
record progress but do not replace COSA, Principal, Treasurer, Custodian, Dean,
Security, library, trip, building-permit, or parental-consent approvals.

## Scripts

| Command          | Purpose                          |
| ---------------- | -------------------------------- |
| `npm run dev`    | Start the dev server             |
| `npm run build`  | Production build                 |
| `npm run start`  | Serve the production build       |
| `npm run lint`   | ESLint                           |
| `npm run typecheck` | TypeScript validation          |
| `npm test`       | Unit tests                        |

Pull requests and pushes to `main` run all five checks automatically through
`.github/workflows/ci.yml`.

## Project structure

```
src/
  app/
    page.tsx            # Home (hero + featured content)
    login/              # Google sign-in screen
    auth/               # OAuth callback + sign-out
    (hub)/              # Sidebar layout: announcements, clubs, calendar, …
      admin/            # Admin-only area (light theme)
  components/           # Sidebar, cards, topbar, search, …
  lib/                  # Supabase clients, auth helpers, static data
supabase/               # SQL migrations to apply in the dashboard
```

For request flow, directory responsibilities, data fallbacks, authorization
boundaries, and the commenting convention, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Deployment

See `.env.example` for the environment variables required in production.
Remember to add your production URL to Supabase's redirect allow-list before
going live.

## Product roadmap — not yet implemented

The following improvements were intentionally not presented as finished. Each
item needs additional infrastructure, product policy, or a larger schema and UI
change than the current repository provides.

### Notifications and personalization

- [ ] Add a `notifications` table with read/unread state and RLS.
- [ ] Notify students when membership and club applications are approved or rejected.
- [ ] Notify students when a followed club posts an update or an RSVP event is near.
- [ ] Add optional school-email delivery after sender identity, consent, and opt-out rules are approved.
- [ ] Add interest-based club recommendations to the signed-in dashboard.
- [ ] Show the next meeting for every joined club instead of membership counts alone.

Acceptance criteria: notifications are idempotent, scoped to the correct user,
have a visible read state, and never expose another student's activity.

### Membership and review workflow

- [ ] Store and display reviewer reasons for rejected memberships and charter applications.
- [ ] Add an explicit paused/recruiting state for clubs and prevent joins while paused.
- [ ] Add reversible bulk review actions with a confirmation summary.
- [ ] Add a unified membership history instead of deleting rows when a student leaves.

Acceptance criteria: every status transition is authorized server-side, visible
to the affected student, and recorded in the audit log described below.

### Calendar and recurring schedules

- [ ] Query recurring meetings by requested month rather than generating a bounded window in application memory.
- [ ] Store recurrence rules and exceptions, including holidays and canceled meetings.
- [ ] Preserve the selected month and layer in URL search parameters.
- [ ] Export single events and club schedules as `.ics` files.
- [ ] Add Google Calendar deep links after timezone and school-calendar ownership are confirmed.

Acceptance criteria: month navigation does not load unrelated dates, canceled
meetings disappear without deleting the schedule, and exports use the school's timezone.

### Search and content discovery

- [ ] Add a dedicated `/search?q=` results page with shareable URLs and type filters.
- [ ] Add typo tolerance, stemming, and curated synonyms such as volunteer/community service.
- [ ] Add privacy-safe recent searches and popular searches.
- [ ] Record zero-result terms so content gaps can be reviewed by staff.

Acceptance criteria: search remains keyboard accessible, does not log student
identifiers with query text, and returns results within an agreed latency budget.

### Content lifecycle and governance

- [ ] Add announcement drafts, scheduled publishing, automatic expiration, priority, and audience targeting.
- [ ] Add pinned announcements and per-user read state.
- [ ] Add automatic reminders for stale clubs, old officer rosters, and expired content.
- [ ] Define a school-owned editorial guide for names, capitalization, button language, and emergency messages.
- [ ] Expand club completeness to include meetings, advisors, officers, media, and image alt text.

Acceptance criteria: public content has an owner, effective date, expiration
policy, and recoverable archive path before automatic lifecycle jobs are enabled.

### Administration and auditability

- [ ] Extend the implemented club audit log to global role, support, application, and opportunity changes.
- [ ] Add human-readable actor names and field-level change summaries to investigation views.
- [ ] Add staff queues for incomplete clubs, stale content, and unassigned support requests.
- [ ] Add CSV import with validation preview and row-level error reporting.
- [ ] Add reversible bulk archive, category, academic-year, and advisor operations.
- [ ] Prevent the final administrator from removing their own admin role.

Acceptance criteria: high-risk actions require confirmation, can be traced to an
actor, and do not place private application or support-request text in logs.

### Security, privacy, and abuse protection

- [ ] Add distributed rate limiting for search, applications, support requests, RSVP, and membership actions.
- [ ] Add automated role-matrix tests for students, club officers, advisors, staff, and admins.
- [ ] Review public DTOs so student email addresses and internal UUIDs are returned only when required.
- [ ] Add retention and deletion policies for support requests, applications, and analytics.
- [ ] Add dependency, secret, and migration security scanning to CI.

Acceptance criteria: limits work across serverless instances, authorization is
tested at both UI and action/API boundaries, and retention rules are school-approved.

### Media and accessibility

- [ ] Add Supabase Storage upload, crop, optimization, and deletion flows for club logos and event covers.
- [ ] Require useful alt text for meaningful media and mark decorative media explicitly.
- [ ] Complete WCAG AA contrast testing for all theme tokens and interaction states.
- [ ] Add automated accessibility scans plus manual keyboard and screen-reader test scripts.
- [ ] Add reduced-motion behavior and focus trapping for every future dialog or drawer.

Acceptance criteria: uploaded files have size/type limits, private originals are
not exposed accidentally, and critical journeys pass keyboard and screen-reader review.

### Reliability, observability, and analytics

- [ ] Add production error reporting and source maps with sensitive-data filtering.
- [ ] Measure Core Web Vitals, server-action failures, slow database queries, and authentication failures.
- [ ] Add privacy-preserving funnels for search, club discovery, joining, quizzes, opportunities, and support resolution.
- [ ] Add migration version tracking, staging deployment checks, and documented rollback procedures.
- [ ] Add browser end-to-end tests for the student, advisor, staff, and admin critical paths.

Acceptance criteria: alerts have an owner and threshold, analytics avoid sensitive
form content, and a failed deployment or migration has a tested recovery procedure.
### Manual-based approval workflows

- [ ] Digitize Event Registration Form routing and Principal approval.
- [ ] Add fundraising authorization with the required 30-day lead-time warning.
- [ ] Add final-statement and Treasurer handoff tracking after fundraisers.
- [ ] Add building-permit, room, equipment, Dean/Security, library, and A/V checks for after-school events.
- [ ] Add off-campus Trip Plan and consent-form status without storing unnecessary medical or identity data.
- [ ] Add constitution versioning, election records, impeachment procedure acknowledgment, and amendment votes.
- [ ] Add private roster certification and one-month post-charter roster reminder; do not expose S.O. card numbers.
- [ ] Add budget-year tracking, reimbursement receipt workflow, tax-exempt reminder, and three-bid requirement above $2,000.
- [ ] Add the 24-hour announcement-submission deadline and advisor approval for social-media/TV promotion.

Acceptance criteria: digital statuses clearly distinguish “submitted” from
“approved,” identify the approving office, preserve required records, and follow
school privacy and retention policies.
