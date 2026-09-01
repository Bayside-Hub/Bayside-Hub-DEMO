import { EventCard } from "@/components/cards";
import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports",
};

export default async function SportsPage() {
  const events = await getEvents();
  const items = events.filter((e) => e.category === "sports" && isEventUpcoming(e));
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-8">
        <h1 className="font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream sm:text-7xl lg:text-[84px]">
          Sports
        </h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-cream lg:text-2xl lg:leading-[30px]">
          View all sport tryout and meeting dates.
        </p>
      </header>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-10 text-center text-sm text-muted">
          No upcoming tryouts or meetings have been published yet.
        </p>
      )}
    </div>
  );
}
