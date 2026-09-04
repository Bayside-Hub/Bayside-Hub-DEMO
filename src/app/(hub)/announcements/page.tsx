import Link from "next/link";
import { AnnouncementCard } from "@/components/cards";
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
  const categories = [
    { label: "Club", description: "Browse club meetings, dates, times, and locations.", href: "/clubs" },
    { label: "Sport", description: "Find tryouts, practices, seasons, and team information.", href: "/sports" },
    { label: "Event", description: "Explore school events, dates, locations, and prices.", href: "/events" },
    { label: "Spirit Week", description: "See each themed day and show your school spirit.", href: "/spirit-week" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-10 lg:px-12 lg:py-16">
      <header className="max-w-[1100px]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-powder">Daily updates</p>
        <h1 className="font-display text-[clamp(2.15rem,8.5vw,6.6rem)] font-semibold uppercase leading-none tracking-[-0.04em] text-cream">Announcements</h1>
        <p className="mt-6 max-w-[953px] text-base font-semibold leading-7 text-cream/90 sm:text-2xl sm:leading-[30px]">Browse daily announcements and check for new updates. We keep track of events, dates, activities, and opportunities you may have missed this morning.</p>
        <Link href="/announcements/archive" className="mt-7 inline-flex h-16 items-center rounded-[22px] bg-cream px-10 text-sm font-extrabold text-black sm:h-20 sm:min-w-[280px] sm:justify-center sm:text-xl">FULL ANNOUNCEMENT</Link>
      </header>

      <section className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Announcement categories">
        {categories.map((category) => (
          <Link key={category.label} href={category.href} className="card-gradient group flex min-h-[300px] flex-col rounded-[26px_26px_10px_10px] border border-line p-7">
            <h2 className="text-3xl font-semibold uppercase text-cream">{category.label}</h2>
            <p className="mt-5 max-w-[18rem] text-sm leading-5 text-cream/75">{category.description}</p>
            <span className="mt-auto self-end text-2xl text-cream transition-transform group-hover:rotate-90">⊕</span>
          </Link>
        ))}
      </section>

      <nav aria-label="Filter by tag" className="mb-8 mt-12 flex flex-wrap gap-2">
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

      <section aria-label="Announcements">
        {filtered.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-14 text-center text-sm text-muted">
            No announcements in this category yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
