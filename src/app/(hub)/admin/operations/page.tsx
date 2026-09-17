import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";

const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
async function requestTime() { return Date.now(); }

export default async function OperationsPage() {
  await requireAdmin();
  if (!isSupabaseConfigured()) return <main className="p-8"><p role="alert">Operations data is unavailable until Supabase is configured.</p></main>;
  const db = await createServerClient();
  const now = await requestTime();
  const weekAgo = new Date(now - 7 * 86400000).toISOString();
  const monthAgo = new Date(now - 30 * 86400000).toISOString();
  const staleBefore = new Date(now - 120 * 86400000).toISOString();

  const [stale, applications, announcements, support, errors, profiles, memberships, searches, zeroSearches] = await Promise.all([
    db.from("clubs").select("id,name,slug,updated_at", { count: "exact" }).eq("status", "published").lt("updated_at", staleBefore).order("updated_at").limit(8),
    db.from("club_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("school_announcement_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("support_requests").select("id", { count: "exact", head: true }).in("status", ["open", "in_review"]),
    db.from("system_errors").select("id,source,message,created_at", { count: "exact" }).is("resolved_at", null).order("created_at", { ascending: false }).limit(8),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("club_memberships").select("id", { count: "exact", head: true }).eq("status", "active"),
    db.from("search_analytics").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    db.from("search_analytics").select("normalized_query,created_at").eq("result_count", 0).gte("created_at", monthAgo).order("created_at", { ascending: false }).limit(1000),
  ]);

  const zeroCounts = new Map<string, number>();
  for (const row of zeroSearches.data ?? []) zeroCounts.set(row.normalized_query, (zeroCounts.get(row.normalized_query) ?? 0) + 1);
  const topZero = [...zeroCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
  const migrationUnavailable = Boolean(errors.error || searches.error || zeroSearches.error);
  const stats = [
    ["Stale club profiles", stale.error ? null : stale.count, "No update in 120+ days"],
    ["Approval queues", [applications.count, announcements.count, support.count].some(value => value == null) ? null : (applications.count ?? 0) + (announcements.count ?? 0) + (support.count ?? 0), "Clubs, announcements, support"],
    ["Open errors", errors.error ? null : errors.count, "Unresolved operational records"],
    ["Searches · 7 days", searches.error ? null : searches.count, "Executed site searches"],
    ["User accounts", profiles.count, "Current profiles"],
    ["Active memberships", memberships.count, "Current club participation"],
  ] as const;

  return <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
    <PageHeader title="Admin Operations" subtitle="Monitor stale content, work queues, errors, usage, and searches that returned no results." />
    {migrationUnavailable && <div role="alert" className="rounded-card border border-orange-400/40 bg-card p-4 text-sm text-ink">Operational intelligence is not fully available. Run <code>supabase/operational_intelligence.sql</code> in Supabase, then reload.</div>}
    <section aria-label="Operations summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(([label, value, note]) => <article key={label} className="rounded-card border border-line bg-card p-5 shadow-sm"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-ink">{value ?? "—"}</p><p className="mt-1 text-xs text-muted">{value == null ? "Data unavailable" : note}</p></article>)}
    </section>

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-card border border-line bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-muted">Search intelligence</p><h2 className="mt-1 text-xl font-bold text-ink">Top zero-result searches</h2></div><span className="rounded-full bg-content-bg px-3 py-1 text-xs text-muted">30 days</span></div>
        {zeroSearches.error ? <p className="mt-5 text-sm text-muted">Search analytics needs the operational migration.</p> : topZero.length ? <ol className="mt-4 divide-y divide-line">{topZero.map(([query, count], index) => <li key={query} className="flex items-center gap-3 py-3"><span className="w-6 text-sm font-bold text-muted">{index + 1}</span><span className="min-w-0 flex-1 truncate font-semibold text-ink">{query}</span><span className="rounded-full bg-content-bg px-2.5 py-1 text-xs text-muted">{count} searches</span></li>)}</ol> : <p className="mt-5 text-sm text-muted">No zero-result searches recorded in the last 30 days.</p>}
      </section>

      <section className="rounded-card border border-line bg-card p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Content health</p><h2 className="mt-1 text-xl font-bold text-ink">Stale club profiles</h2>
        {stale.error ? <p className="mt-5 text-sm text-muted">Club freshness data is unavailable.</p> : stale.data?.length ? <ul className="mt-4 divide-y divide-line">{stale.data.map(club => <li key={club.id} className="flex items-center justify-between gap-4 py-3"><div><Link href={`/clubs/${club.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">{club.name}</Link><p className="text-xs text-muted">Updated {date.format(new Date(club.updated_at))}</p></div><Link href={`/clubs/manage/${club.id}`} className="text-sm font-semibold text-navy">Review →</Link></li>)}</ul> : <p className="mt-5 text-sm text-muted">All published club profiles have been updated within 120 days.</p>}
      </section>

      <section className="rounded-card border border-line bg-card p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Queues</p><h2 className="mt-1 text-xl font-bold text-ink">Items needing attention</h2>
        <div className="mt-4 space-y-3">{[["Club applications", applications.count, "/admin/clubs"], ["Announcement approvals", announcements.count, "/admin/review"], ["Support conversations", support.count, "/admin/support"]].map(([label, count, href]) => <Link key={String(label)} href={String(href)} className="flex items-center justify-between rounded-xl bg-content-bg px-4 py-3"><span className="font-semibold text-ink">{label}</span><span className="text-sm text-muted">{count ?? "—"} →</span></Link>)}</div>
      </section>

      <section className="rounded-card border border-line bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted">Reliability</p><h2 className="mt-1 text-xl font-bold text-ink">Recent open errors</h2></div><Link href="/admin/audit?kind=changes" className="text-sm font-semibold text-navy">Open audit →</Link></div>
        {errors.error ? <p className="mt-5 text-sm text-muted">Error tracking needs the operational migration.</p> : errors.data?.length ? <ul className="mt-4 divide-y divide-line">{errors.data.map(error => <li key={error.id} className="py-3"><p className="font-semibold text-ink">{error.source}</p><p className="line-clamp-2 text-sm text-muted">{error.message}</p><time className="text-xs text-muted" dateTime={error.created_at}>{new Date(error.created_at).toLocaleString("en-US")}</time></li>)}</ul> : <p className="mt-5 text-sm text-muted">No unresolved operational errors.</p>}
      </section>
    </div>
  </div>;
}
