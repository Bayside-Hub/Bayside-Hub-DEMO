import Image from "next/image";
import Link from "next/link";
import { AnnouncementCard } from "@/components/cards";
import { CalendarIcon, ClubsIcon, MegaphoneIcon, OpportunitiesIcon, SearchIcon } from "@/components/icons";
import { getAnnouncementTags, getAnnouncementsPage } from "@/lib/announcements";

export default async function AnnouncementsPage({ searchParams }: { searchParams: Promise<{ tag?: string; page?: string; q?: string }> }) {
  const { tag, page: rawPage, q = "" } = await searchParams;
  const page = Number.parseInt(rawPage ?? "1", 10);
  const query = q.trim().slice(0, 80);
  const tagsFromDb = await getAnnouncementTags();
  const tags = ["All", ...tagsFromDb];
  const active = tag && tags.includes(tag) ? tag : "All";
  const result = await getAnnouncementsPage(Number.isFinite(page) ? page : 1, active === "All" ? undefined : active, undefined, query);
  const showFeatured = result.page === 1 && active === "All" && !query && result.announcements.length > 0;
  const featured = showFeatured ? result.announcements[0] : null;
  const announcements = featured ? result.announcements.slice(1) : result.announcements;
  const quickLinks = [
    { label: "Clubs", description: "Meetings and member updates", href: "/clubs", icon: ClubsIcon },
    { label: "Events", description: "Dates, locations, and prices", href: "/events", icon: CalendarIcon },
    { label: "Sports", description: "Tryouts and team information", href: "/sports", icon: MegaphoneIcon },
    { label: "Opportunities", description: "Programs, service, and scholarships", href: "/opportunities", icon: OpportunitiesIcon },
  ];
  const filterQuery = (nextTag: string) => {
    const params = new URLSearchParams();
    if (nextTag !== "All") params.set("tag", nextTag);
    if (query) params.set("q", query);
    const value = params.toString();
    return value ? `/announcements?${value}` : "/announcements";
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:py-12">
      <header className="overflow-hidden rounded-[26px] border border-line bg-card shadow-sm">
        <div className="grid lg:grid-cols-[1.2fr_.8fr]">
          <div className="p-6 sm:p-9 lg:p-11">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-powder">Bayside bulletin</p>
            <h1 className="mt-3 font-display text-[clamp(2.7rem,8vw,6.2rem)] font-semibold uppercase leading-[.88] tracking-[-0.05em] text-ink">Announcements</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">The latest school notices, Club news, important dates, and opportunities—organized for quick daily reading.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/announcements/archive" className="inline-flex h-11 items-center rounded-full bg-navy px-5 text-sm font-bold text-cream">Browse archive</Link>
              <Link href="/announcements/feed.xml" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-bold text-ink hover:bg-content-bg">RSS feed</Link>
              <Link href="/announcements/submit" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-bold text-ink hover:bg-content-bg">Submit an announcement</Link>
            </div>
          </div>
          <div className="relative hidden min-h-64 overflow-hidden bg-gradient-to-br from-[#111936] via-[#263a99] to-[#5d83d8] lg:block" aria-hidden>
            <div className="absolute -right-16 -top-14 size-64 rounded-full border-[38px] border-white/10" />
            <div className="absolute bottom-10 left-10 right-10 rounded-[20px] border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Updated daily</p><p className="mt-2 text-2xl font-semibold">One reliable place for what&apos;s happening at Bayside.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Browse school information">
        {quickLinks.map((item) => <Link key={item.label} href={item.href} className="group flex items-center gap-4 rounded-[18px] border border-line bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy"><item.icon className="size-5" /></span><span className="min-w-0"><span className="block font-semibold text-ink">{item.label}</span><span className="block truncate text-xs text-muted">{item.description}</span></span><span className="ml-auto text-powder transition-transform group-hover:translate-x-1">→</span></Link>)}
      </section>

      {featured ? (
        <section className="mt-10" aria-labelledby="featured-announcement">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-powder">Featured notice</p>
          <Link href={`/announcements/${featured.id}`} className="group mt-3 grid overflow-hidden rounded-[24px] border border-line bg-card shadow-sm transition-shadow hover:shadow-xl md:grid-cols-[minmax(0,1fr)_minmax(280px,.7fr)]">
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-black">Important</span><span className="text-xs text-muted">{featured.tag} · {featured.date}</span></div>
              <h2 id="featured-announcement" className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{featured.title}</h2>
              <p className="mt-3 line-clamp-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">{featured.excerpt}</p>
              <span className="mt-6 text-sm font-bold text-navy">Read full notice →</span>
            </div>
            {featured.imageUrl ? <div className="relative min-h-56"><Image src={featured.imageUrl} alt={featured.imageAlt ?? ""} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" /></div> : <div className="relative hidden min-h-64 bg-gradient-to-br from-[#172039] to-[#4772aa] md:block"><MegaphoneIcon className="absolute bottom-8 right-8 size-24 text-white/20" /></div>}
          </Link>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="latest-announcements">
        <div className="flex flex-col gap-5 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-powder">Notice board</p><h2 id="latest-announcements" className="mt-1 font-display text-3xl font-bold uppercase text-ink">{query ? `Results for “${query}”` : active === "All" ? "Latest updates" : active}</h2></div>
          <form role="search" className="flex w-full max-w-xl gap-2">
            {active !== "All" ? <input type="hidden" name="tag" value={active} /> : null}
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search announcements</span><SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input name="q" defaultValue={query} maxLength={80} placeholder="Search notices..." className="h-11 w-full rounded-full border border-line bg-card pl-10 pr-4 text-sm text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/20" /></label>
            <button className="h-11 rounded-full bg-navy px-5 text-sm font-bold text-cream">Search</button>
          </form>
        </div>

        <nav aria-label="Filter announcements by topic" className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {tags.map((item) => <Link key={item} href={filterQuery(item)} aria-current={active === item ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active === item ? "bg-navy text-cream" : "border border-line bg-card text-muted hover:text-ink"}`}>{item}</Link>)}
        </nav>

        {announcements.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{announcements.map((announcement) => <AnnouncementCard key={announcement.id} a={announcement} />)}</div> : <div className="mt-5 rounded-card border border-dashed border-line bg-card/60 px-6 py-14 text-center"><p className="font-semibold text-ink">No matching announcements</p><p className="mt-2 text-sm text-muted">Try another keyword or choose a different topic.</p>{(query || active !== "All") ? <Link href="/announcements" className="mt-4 inline-flex text-sm font-bold text-navy">Clear filters</Link> : null}</div>}
      </section>

      {result.pageCount > 1 ? <nav aria-label="Announcement pages" className="mt-8 flex items-center justify-center gap-3">{result.page > 1 ? <Link href={`/announcements?${new URLSearchParams({ ...(active !== "All" ? { tag: active } : {}), ...(query ? { q: query } : {}), page: String(result.page - 1) })}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink">Previous</Link> : null}<span className="text-sm text-muted" aria-live="polite">Page {result.page} of {result.pageCount}</span>{result.page < result.pageCount ? <Link href={`/announcements?${new URLSearchParams({ ...(active !== "All" ? { tag: active } : {}), ...(query ? { q: query } : {}), page: String(result.page + 1) })}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink">Next</Link> : null}</nav> : null}
    </div>
  );
}
