import { EventCard, SectionHeader } from "@/components/cards";
import { isEventUpcoming, type EventItem } from "@/lib/data";
import { getEvents } from "@/lib/events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
};

function EventSection({ title, subtitle, items }: { title: string; subtitle: string; items: EventItem[] }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <SectionHeader title={title} subtitle={subtitle} />
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-10 text-center text-sm text-muted">
          No upcoming events have been published yet.
        </p>
      )}
    </div>
  );
}

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events
    .filter((event) => event.category === "events" && isEventUpcoming(event))
    .sort((a, b) => (a.dateISO ?? "").localeCompare(b.dateISO ?? ""));
  return (
    <EventSection
      title="Events"
      subtitle="View all upcoming events."
      items={upcoming.slice(0, 30)}
    />
  );
}
