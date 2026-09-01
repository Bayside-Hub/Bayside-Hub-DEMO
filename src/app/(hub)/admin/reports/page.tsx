import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { weeklyReport } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reports — Admin",
};

const statCards = [
  { title: "Approved Clubs", key: "approved" },
  { title: "Pending Reviews", key: "pending" },
  { title: "Rejected", key: "rejected" },
] as const;

export default async function AdminReportsPage() {
  await requireStaff();
  const configured = isSupabaseConfigured();

  const supabase = configured ? await createServerClient() : null;
  const [approved, pending, rejected, apps, anns] = supabase
    ? await Promise.all([
        supabase.from("club_applications").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("club_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("club_applications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("club_applications").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }).eq("published", true),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }];

  const counts = {
    approved: approved.count ?? 0,
    pending: pending.count ?? 0,
    rejected: rejected.count ?? 0,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="Reports"
        subtitle="Platform activity and activity snapshots for the student organization office."
      />

      {!configured && (
        <div className="mb-6 rounded-card border border-orange/30 bg-orange/10 p-4 text-sm leading-6 text-ink">
          <strong>Supabase is not configured.</strong> Configure Supabase to show live
          counts from club applications and announcements.
        </div>
      )}

      <section aria-label="Summary stats" className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.key} className="rounded-card border border-black/5 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{s.title}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{counts[s.key]}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-black/5 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Report Summaries</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-navy">Weekly Reports</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {weeklyReport.weekly.map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-navy" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#8a6a10]">Monthly Insights</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {weeklyReport.monthly.map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#C2410C]">Quarterly Analysis</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {weeklyReport.quarterly.map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-peach" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center rounded-card border border-black/5 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Live activity</h2>
          <p className="mt-1 text-sm text-muted">
            {anns.count ?? 0} published announcements and {apps.count ?? 0} club
            applications on file.
          </p>
          <Link
            href="/admin/clubs"
            className="mt-6 w-fit rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark"
          >
            Review club applications →
          </Link>
        </div>
      </div>
    </div>
  );
}
