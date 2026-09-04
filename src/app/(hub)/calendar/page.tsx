import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import CalendarBoard from "./calendar-board";
import LiveDateTile from "./live-date-tile";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function CalendarPage() {
  const events = await getEvents();
  const upcoming = [...events]
    .filter((e) => e.dateISO && isEventUpcoming(e))
    .sort((a, b) => a.dateISO!.localeCompare(b.dateISO!));
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-12">
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-cream sm:text-5xl">My Calendar</h1>
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.9fr)]">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-[1.5fr_.9fr]">
            <section className="rounded-[22px] bg-[#f0e7d7] p-6 text-black"><h2 className="text-xl font-bold">UPCOMING EVENTS</h2><div className="mt-4 space-y-2">{upcoming.slice(0, 2).map((event) => <a key={event.id} href={`/events/${event.id}`} className="flex items-center overflow-hidden rounded-xl border border-black bg-[#95a1b1] text-sm font-semibold text-cream"><span className="bg-[#f0e7d7] px-3 py-3 text-xl text-[#95a1b1]">{event.dateISO?.slice(-2)}</span><span className="px-3">{event.title}</span></a>)}</div></section>
            <section className="rounded-[22px] bg-[#f0e7d7] p-6 text-black"><h2 className="text-xl font-bold">QUICK LINKS</h2><div className="mt-4 space-y-2"><Link href="/clubs" className="block rounded-xl border border-black bg-[#95a1b1] px-4 py-3 text-sm font-semibold text-cream hover:bg-[#82909f]">Browse club schedules →</Link><Link href="/announcements" className="block rounded-xl border border-black bg-[#95a1b1] px-4 py-3 text-sm font-semibold text-cream hover:bg-[#82909f]">Read announcements →</Link></div></section>
          </div>
          <div className="rounded-[22px] bg-[#f0e7d7] p-5"><CalendarBoard events={events} /></div>
        </div>
        <LiveDateTile />
      </div>
    </div>
  );
}
