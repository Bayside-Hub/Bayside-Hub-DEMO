import Link from "next/link";
import { AnnouncementCard } from "@/components/cards";
import { getAnnouncementTags, getAnnouncementsPage } from "@/lib/announcements";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag, page: rawPage } = await searchParams;
  const page = Number.parseInt(rawPage ?? "1", 10);
  const tagsFromDb = await getAnnouncementTags();
  const tags = ["All", ...tagsFromDb];
  const active = tag && tags.includes(tag) ? tag : "All";
  const result = await getAnnouncementsPage(Number.isFinite(page) ? page : 1, active === "All" ? undefined : active);
  const announcements = result.announcements;
  const categories = [
    { label: "Club", description: "Browse club meetings, dates, times, and locations.", href: "/clubs" },
    { label: "Sport", description: "Find tryouts, practices, seasons, and team information.", href: "/sports" },
    { label: "Event", description: "Explore school events, dates, locations, and prices.", href: "/events" },
    { label: "Spirit Week", description: "See each themed day and show your school spirit.", href: "/spirit-week" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-10 lg:px-12 lg:py-16">
      <header className="page-title-card max-w-[1100px]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-powder">Daily updates</p>
        <h1 className="font-display text-[clamp(2.15rem,8.5vw,5.8rem)] font-semibold uppercase leading-none tracking-[-0.04em] text-cream">Announcements</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-cream/75 sm:text-lg">School news, Club updates, events, and opportunities—all in one place.</p>
        <Link href="/announcements/archive" className="mt-6 inline-flex h-11 items-center rounded-full border border-line px-6 text-sm font-bold text-cream transition-colors hover:bg-cream/10">View archive →</Link>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Announcement categories">
        {categories.map((category) => (
          <Link key={category.label} href={category.href} className="card-gradient group rounded-[18px] border border-line p-5 transition-colors hover:border-cream/30">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold uppercase text-cream">{category.label}</h2>
              <span className="text-lg text-powder transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-cream/65">{category.description}</p>
          </Link>
        ))}
      </section>

      <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-powder">Latest</p>
          <h2 className="mt-1 font-display text-3xl font-bold uppercase text-cream">Recent updates</h2>
        </div>
        <nav aria-label="Filter by tag" className="flex flex-wrap gap-2">
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
      </div>

      <section aria-label="Announcements">
        {announcements.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-14 text-center text-sm text-muted">
            No announcements in this category yet.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
      {result.pageCount > 1 && (
        <nav aria-label="Announcement pages" className="mt-8 flex items-center justify-center gap-3">
          {result.page > 1 && (
            <Link href={`/announcements?${new URLSearchParams({ ...(active !== "All" ? { tag: active } : {}), page: String(result.page - 1) })}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted" aria-live="polite">Page {result.page} of {result.pageCount}</span>
          {result.page < result.pageCount && (
            <Link href={`/announcements?${new URLSearchParams({ ...(active !== "All" ? { tag: active } : {}), page: String(result.page + 1) })}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
