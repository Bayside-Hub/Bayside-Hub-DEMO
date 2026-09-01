import { notFound } from "next/navigation";
import Link from "next/link";
import { getAnnouncement, getAnnouncementVersions } from "@/lib/announcements";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  return announcement ? { title: announcement.title, description: announcement.excerpt.slice(0, 160) } : { title: "Announcement not found" };
}

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getAnnouncement(id);
  if (!a) notFound();
  const versions = await getAnnouncementVersions(id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <article className="rounded-panel border border-line bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-navy px-3 py-1 font-semibold text-cream">{a.tag}</span>
          <time className="text-muted">{a.date}</time>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-ink">{a.title}</h1>
        <p className="mt-4 leading-8 text-muted">{a.excerpt}</p>
        <p className="mt-4 leading-8 text-muted">
          Full details are shared by the SO office each morning. This
          announcement was published through Bayside Hub so nothing slips past
          you — check back daily for updates.
        </p>
      </article>

      {versions.length > 0 && (
        <details className="mt-6 rounded-card border border-line bg-card p-6 shadow-sm">
          <summary className="cursor-pointer text-lg font-bold text-ink">
            Version history ({versions.length})
          </summary>
          <ol className="mt-4 space-y-3">
            {versions.map((version) => (
              <li key={version.id} className="rounded-control border border-line bg-content-bg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <strong className="text-ink">Version {version.version_number}</strong>
                  <time dateTime={version.changed_at}>
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.changed_at))}
                  </time>
                </div>
                {version.version_note && <p className="mt-2 text-sm font-medium text-powder">{version.version_note}</p>}
                <p className="mt-2 text-sm leading-6 text-muted">{version.snapshot_content}</p>
              </li>
            ))}
          </ol>
        </details>
      )}

      <section className="mt-6 rounded-card border border-line bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Stay in the loop</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Announcements are updated by the SO office throughout the day.
          Check the <Link href="/announcements/archive" className="font-semibold text-powder hover:text-cream">archive</Link> for
          past posts, or browse what&apos;s happening this week on the{" "}
          <Link href="/calendar" className="font-semibold text-powder hover:text-cream">calendar</Link>.
        </p>
      </section>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          href="/announcements"
          className="font-semibold text-powder hover:text-cream"
        >
          ← Back to Announcements
        </Link>
        <Link
          href="/announcements/archive"
          className="font-semibold text-powder hover:text-cream"
        >
          View Archive →
        </Link>
      </div>
    </div>
  );
}
