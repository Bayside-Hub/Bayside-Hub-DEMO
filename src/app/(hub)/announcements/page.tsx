import Link from "next/link";
import { AnnouncementCard, PrimaryButton } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { getAnnouncements } from "@/lib/announcements";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const announcements = await getAnnouncements();
  const tags = ["All", ...Array.from(new Set(announcements.map((a) => a.tag)))];
  const active = tag && tags.includes(tag) ? tag : "All";
  const filtered = active === "All" ? announcements : announcements.filter((a) => a.tag === active);
  const [featured, ...rest] = filtered;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="Announcements"
        subtitle="Browse daily announcements and check for new updates! We keep track of any events, dates, or activities that you might have missed this morning. View our full announcement or find information using our options below."
      />

      <nav aria-label="Filter by tag" className="mb-8 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t}
            href={t === "All" ? "/announcements" : `/announcements?tag=${encodeURIComponent(t)}`}
            aria-current={active === t ? "true" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === t
                ? "bg-navy text-cream"
                : "border border-line text-cream/80 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            {t}
          </Link>
        ))}
      </nav>

      {featured && (
        <section className="card-gradient relative mb-8 overflow-hidden rounded-[10px] px-8 py-8">
          <div className="relative">
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-navy">
              {featured.tag} · {featured.date}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-cream">
              {featured.title}
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-cream/80">{featured.excerpt}</p>
            <div className="mt-5">
              <PrimaryButton href={`/announcements/${featured.id}`}>
                Full Announcement
              </PrimaryButton>
            </div>
          </div>
        </section>
      )}

      <section aria-label="More announcements">
        {rest.length === 0 && featured ? null : rest.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-14 text-center text-sm text-muted">
            No announcements in this category yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
