import Link from "next/link";
import type { Announcement, Club, EventItem } from "@/lib/data";
import { ArrowRightIcon } from "./icons";

export function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[22px] bg-cream px-7 font-display text-sm font-extrabold tracking-wide text-black shadow-sm transition-all hover:bg-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${className}`}
    >
      {children}
    </Link>
  );
}

export function tagClasses(tag: string) {
  switch (tag) {
    case "Events":
      return "bg-orange/90 text-black";
    case "Clubs":
      return "bg-cream text-navy";
    default:
      return "bg-sky/90 text-black";
  }
}

export function AnnouncementCard({ a }: { a: Announcement }) {
  return (
    <article className="card-gradient flex flex-col rounded-[10px] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tagClasses(a.tag)}`}>{a.tag}</span>
        <time className="text-xs text-cream/60">{a.date}</time>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-cream">{a.title}</h3>
      <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-cream/70">{a.excerpt}</p>
      <div className="mt-4">
        <PrimaryButton href="/announcements" className="h-9 px-5 text-xs">
          Full Announcement
        </PrimaryButton>
      </div>
    </article>
  );
}

export function ClubCard({ club }: { club: Club }) {
  const initials = club.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="card-gradient group flex flex-col items-center rounded-t-[48px] rounded-b-[10px] p-6 text-center transition-transform duration-200 hover:-translate-y-1"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-powder">{club.category}</p>
      <h3 className="mt-2 font-display text-xl font-bold uppercase leading-snug text-cream">{club.name}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-cream/70">{club.description}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-cream/80">
        <span className="rounded-full border border-line px-2.5 py-1">{club.meetingDays.join(", ")}</span>
        <span className="rounded-full border border-line px-2.5 py-1">{club.meetingTime}</span>
        {club.communityService && (
          <span className="rounded-full bg-orange/90 px-2.5 py-1 font-semibold text-black">Community Service</span>
        )}
      </div>
      <div className="mt-5 flex h-32 w-32 items-center justify-center rounded-full bg-cream shadow-[0_4px_39px_-10px_rgba(252,241,221,0.7)]">
        <span className="font-display text-4xl font-extrabold text-navy">{initials}</span>
      </div>
      <span className="mt-5 inline-flex h-10 items-center justify-center rounded-[22px] bg-cream px-6 font-display text-xs font-extrabold tracking-wide text-black transition-colors group-hover:bg-white">
        View Club
      </span>
    </Link>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const chip =
    event.category === "sports"
      ? "bg-orange/90 text-black"
      : event.category === "spirit-week"
        ? "bg-peach text-black"
        : "bg-sky/90 text-black";
  return (
    <Link
      href={`/events/${event.id}`}
      className="card-gradient flex flex-col rounded-[10px] p-5 transition-transform duration-200 hover:-translate-y-1"
    >
      <div className={`mb-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${chip}`}>
        {event.category === "sports" ? "Sports" : event.category === "spirit-week" ? "Spirit Week" : "Events"}
      </div>
      <h3 className="font-display text-lg font-bold uppercase leading-snug text-cream">{event.title}</h3>
      <dl className="mt-3 space-y-1.5 text-sm text-cream/70">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-semibold text-cream">Date:</dt>
          <dd>{event.date}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-semibold text-cream">Time:</dt>
          <dd>{event.time}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-semibold text-cream">Location:</dt>
          <dd>{event.location}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-semibold text-cream">Price:</dt>
          <dd>{event.price}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-semibold text-cream">Description:</dt>
          <dd className="line-clamp-2">{event.description}</dd>
        </div>
      </dl>
      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-powder">
        View details
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export function ViewAllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-powder transition-colors hover:text-cream"
    >
      {children}
      <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && linkLabel && <ViewAllLink href={href}>{linkLabel}</ViewAllLink>}
    </div>
  );
}
