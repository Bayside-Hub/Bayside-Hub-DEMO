import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import AnnouncementForm from "./announcement-form";
import Pagination from "@/components/pagination";
import DeleteAnnouncementButton from "./delete-announcement-button";

const PAGE_SIZE = 20;

export const metadata: Metadata = {
  title: "Post Announcement — Admin",
};

export default async function AdminAnnouncementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireStaff();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const configured = isSupabaseConfigured();

  const supabase = configured ? await createServerClient() : null;
  const { data: rows, count } = supabase
    ? await supabase
        .from("announcements")
        .select("id, title, tag, created_at, archived_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1)
    : { data: null, count: 0 };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="Post Announcement"
        subtitle="Create announcements for the whole school. Published posts appear on the Announcements page immediately."
      />

      {!configured && (
        <div className="mb-6 rounded-card border border-orange/30 bg-orange/10 p-4 text-sm leading-6 text-ink">
          <strong>Supabase is not configured.</strong> Add{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="font-mono text-xs">.env.local</code>, then apply{" "}
          <code className="font-mono text-xs">supabase/admin_crud.sql</code> in the Supabase
          SQL Editor to publish and manage announcements.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-black/5 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">New announcement</h2>
          <AnnouncementForm disabled={!configured} />
        </section>

        <section className="rounded-card border border-black/5 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Announcements</h2>
          {!configured ? (
            <p className="mt-6 text-center text-sm text-muted">
              Announcements will appear here once Supabase is connected.
            </p>
          ) : !rows || rows.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted">
              No announcements yet. Publish your first one on the left.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{row.title}</p>
                    <p className="text-xs text-muted">
                      {row.tag} ·{" "}
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                        new Date(row.created_at),
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/announcements/${row.id}`}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-navy hover:text-navy"
                    >
                      View
                    </Link>
                    <Link href={`/admin/announcements/${row.id}`} className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-ink">Edit</Link>
                    <DeleteAnnouncementButton id={row.id} archived={Boolean(row.archived_at)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <Pagination basePath="/admin/announcements" page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
    </div>
  );
}
