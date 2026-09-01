import { notFound } from "next/navigation";
import Link from "next/link";
import { events } from "@/lib/data";
import { getEvent } from "@/lib/events";
import { getCurrentUser } from "@/lib/auth";
import { getEventRsvpInfo, toggleEventRsvp } from "../actions";
import PendingSubmitButton from "@/components/pending-submit-button";
import type { Metadata } from "next";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  return event ? { title: event.title, description: event.description } : { title: "Event not found" };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const user = await getCurrentUser();
  const rsvp = await getEventRsvpInfo(event.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <article className="rounded-panel border border-line bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-navy px-3 py-1 font-semibold capitalize text-cream">
            {event.category === "spirit-week" ? "Spirit Week" : event.category}
          </span>
          <span className="rounded-full bg-peach/60 px-3 py-1 font-semibold text-black">
            {event.price}
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-ink">{event.title}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Date</dt>
            <dd className="mt-0.5 font-medium text-ink">{event.date}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Time</dt>
            <dd className="mt-0.5 font-medium text-ink">{event.time}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Location</dt>
            <dd className="mt-0.5 font-medium text-ink">{event.location}</dd>
          </div>
        </dl>
        <p className="mt-6 leading-8 text-muted">{event.description}</p>

        {rsvp.available && (
          <div className="mt-6 border-t border-line pt-6">
            {user ? (
              <form action={toggleEventRsvp}>
                <input type="hidden" name="event_id" value={event.id} />
                <PendingSubmitButton
                  pendingLabel="Saving RSVP…"
                  className={`inline-flex h-10 items-center gap-2 rounded-[22px] border px-6 text-sm font-semibold transition-colors ${
                    rsvp.joined
                      ? "border-cream bg-cream/15 text-cream"
                      : "border-line text-cream/85 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  {rsvp.joined ? "✓ I'm going" : "Count me in"}
                  <span className="text-xs text-muted">({rsvp.count} going)</span>
                </PendingSubmitButton>
              </form>
            ) : (
              <p className="text-sm text-muted">
                <Link href={`/login?next=/events/${event.id}`} className="font-semibold text-powder hover:text-cream">
                  Sign in
                </Link>{" "}
                to let organizers know you&apos;re coming ({rsvp.count} going).
              </p>
            )}
          </div>
        )}
      </article>

      <div className="mt-6 text-sm">
        <Link href="/events" className="font-semibold text-powder hover:text-cream">
          ← Back to Events
        </Link>
      </div>
    </div>
  );
}
