import { EventCard, SectionHeader } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import CalendarBoard from "./calendar-board";
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
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="Calendar"
        subtitle="View all club meeting dates and special events. Find out when the next season is available & the sport's meeting dates, time, and location."
      />

      <CalendarBoard events={events} />

      <section className="mt-10">
        <SectionHeader
          title="Upcoming Events"
          subtitle="View all upcoming events."
          href="/events"
          linkLabel="VIEW ALL"
        />
        {upcoming.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 12).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-10 text-center text-sm text-muted">
            No upcoming events have been published yet. Past events remain available in the calendar.
          </p>
        )}
        {upcoming.length > 12 ? (
          <p className="mt-5 text-center text-sm text-muted">
            Showing the next 12 events. Use the calendar or View All to browse more.
          </p>
        ) : null}
      </section>
    </div>
  );
}
