import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import type { ClubApplicationRow } from "@/lib/supabase/types";

type ProfileClub = { id: string; slug: string; name: string; status?: string };

export const metadata: Metadata = {
  title: "Profile",
};

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const applicationBadge: Record<string, string> = {
  pending: "bg-peach text-black",
  approved: "bg-navy text-cream",
  rejected: "bg-orange/25 text-orange",
};

async function getMyApplications(userId: string): Promise<ClubApplicationRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("club_applications")
    .select("id, club_name, category, description, meeting_days, contact_email, submitted_by, status, created_at, reviewed_at, reviewed_by")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getMyClubs(userId: string): Promise<{ memberships: ProfileClub[]; managed: ProfileClub[] }> {
  if (!isSupabaseConfigured()) return { memberships: [], managed: [] };
  const supabase = await createServerClient();
  const [membershipResult, advisorResult] = await Promise.all([
    supabase.from("club_memberships").select("club_id, status").eq("profile_id", userId).in("status", ["pending", "active"]),
    supabase.from("club_advisors").select("club_id").eq("profile_id", userId),
  ]);
  const membershipRows = membershipResult.data ?? [];
  const advisorRows = advisorResult.data ?? [];
  const ids = [...new Set([...membershipRows.map((row) => row.club_id), ...advisorRows.map((row) => row.club_id)])];
  if (!ids.length) return { memberships: [], managed: [] };
  const { data: clubRows } = await supabase.from("clubs").select("id, slug, name").in("id", ids);
  const clubsById = new Map((clubRows ?? []).map((club) => [club.id, club]));
  return {
    memberships: membershipRows.flatMap((membership) => {
      const club = clubsById.get(membership.club_id);
      return club ? [{ ...club, status: membership.status }] : [];
    }),
    managed: advisorRows.flatMap((advisor) => {
      const club = clubsById.get(advisor.club_id);
      return club ? [club] : [];
    }),
  };
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Profile</h1>
        <div className="mt-6 rounded-card border border-line bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cream text-2xl font-bold text-navy ring-4 ring-black/20">
            H
          </div>
          <p className="mt-4 text-lg font-semibold text-ink">Your profile starts here</p>
          <p className="text-sm text-muted">Sign in to see your account details.</p>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">
            Your profile card will appear here once you sign in with your
            @nycstudents.net account. Saved clubs and community service hours
            will show up in this space.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const [applications, clubSummary] = await Promise.all([
    getMyApplications(user.id),
    getMyClubs(user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Profile</h1>
      <div className="mt-6 overflow-hidden rounded-card border border-line bg-card shadow-sm">
        <div className="glow-cream flex items-center gap-5 rounded-[24px] bg-steel px-8 py-7">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cream text-2xl font-bold text-navy ring-4 ring-black/20">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-semibold tracking-wide text-cream">{user.name}</p>
            <p className="truncate text-sm font-medium text-black/85">{user.email}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-cream px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-navy">
              {user.role}
            </span>
          </div>
        </div>
        <div className="px-8 py-6">
          <p className="text-sm leading-6 text-muted">
            You&apos;re signed in with your NYC student account. Saved clubs and
            community service hours will show up in this space soon.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/clubs"
              className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              Browse Clubs
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-content-bg px-6 text-sm font-semibold text-ink transition-colors hover:border-powder hover:text-powder focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">My clubs</h2>
          {clubSummary.memberships.length ? (
            <ul className="mt-4 space-y-3">
              {clubSummary.memberships.map((club) => (
                <li key={club.id} className="rounded-card border border-line bg-card px-5 py-4">
                  <Link href={`/clubs/${club.slug}`} className="font-semibold text-ink hover:text-powder">{club.name}</Link>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{club.status}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted">No club memberships yet.</p>}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Managed clubs</h2>
          {clubSummary.managed.length ? (
            <ul className="mt-4 space-y-3">
              {clubSummary.managed.map((club) => (
                <li key={club.id} className="rounded-card border border-line bg-card px-5 py-4">
                  <Link href={`/clubs/${club.slug}`} className="font-semibold text-ink hover:text-powder">{club.name}</Link>
                  <p className="mt-1 text-xs text-muted">Advisor access</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted">No clubs assigned for management.</p>}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">
            My Club Applications
          </h2>
          <Link
            href="/clubs/apply"
            className="text-sm font-semibold text-powder transition-colors hover:text-cream"
          >
            Apply for a new club →
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-line bg-card/60 px-6 py-8 text-center text-sm text-muted">
            You haven&apos;t applied for a club yet. Found one you love? Start an
            application and track its status here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {applications.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-card border border-line bg-card px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{a.club_name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {a.category} · applied{" "}
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                      new Date(a.created_at),
                    )}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${applicationBadge[a.status] ?? "bg-content-bg text-ink"}`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
