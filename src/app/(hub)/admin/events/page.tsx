import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import EventForm from "./event-form";

export default async function AdminEventsPage() {
  await requireStaff();
  const db = await createServerClient();
  const { data: events, error } = await db.from("events").select("*").order("start_at", { ascending: false }).limit(150);
  return <div className="mx-auto max-w-6xl px-6 py-8"><PageHeader title="Events" subtitle="Create and maintain school-wide calendar content. Club-submitted events continue through the approval workflow."/>{error?<p role="alert" className="mt-6 rounded-card border border-orange/40 bg-card p-5">Events could not be loaded. Verify the core platform migration and Staff access.</p>:<div className="mt-7 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]"><section className="rounded-card border border-line bg-card p-6"><h2 className="text-xl font-bold text-ink">New school event</h2><div className="mt-4"><EventForm/></div></section><section className="rounded-card border border-line bg-card p-6"><h2 className="text-xl font-bold text-ink">Calendar content</h2>{events?.length?<div className="mt-4 space-y-3">{events.map(event=><details key={event.id} className="rounded-control border border-line p-4"><summary className="cursor-pointer"><span className="font-bold text-ink">{event.title}</span><span className="ml-2 text-xs text-muted">{new Date(event.start_at).toLocaleString("en-US")} · {event.published?"published":"draft"}{event.club_id?" · Club managed":""}</span></summary><div className="mt-4"><EventForm event={event}/>{event.club_id?<p className="mt-3 text-xs text-muted">This Club event may be edited here by Staff or in its assigned Club workspace.</p>:null}</div></details>)}</div>:<p className="mt-4 text-sm text-muted">No events yet.</p>}</section></div>}</div>;
}
