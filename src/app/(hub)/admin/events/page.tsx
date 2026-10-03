import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import CalendarManager from "./calendar-manager";
import EventForm from "./event-form";

export default async function AdminEventsPage() {
  const user = await requireStaff();
  const db = await createServerClient();
  const [{ data: events, error }, calendarResult, clubResult] = await Promise.all([
    db.from("events").select("*").order("start_at", { ascending: false }).limit(150),
    db.from("calendar_sources").select("*").order("name"),
    db.from("clubs").select("id,name").order("name"),
  ]);
  const calendars = calendarResult.data ?? [];
  const clubs = clubResult.data ?? [];
  return <div className="mx-auto max-w-6xl px-6 py-8">
    <PageHeader title="Events & calendars" subtitle="Create events and calendar layers, import dates, or mark holidays and cancelled Club meetings."/>
    {calendarResult.error ? <p role="alert" className="mt-6 rounded-card border border-orange/40 bg-card p-5 text-sm">Custom calendars require <code>announcement_calendar_enhancements.sql</code>.</p> : null}
    {error ? <p role="alert" className="mt-6 rounded-card border border-orange/40 bg-card p-5">Events could not be loaded. Verify the core platform migration and Staff access.</p> : <div className="mt-7 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      {user.role === "admin" && !calendarResult.error ? <CalendarManager calendars={calendars}/> : null}
      <section className="rounded-card border border-line bg-card p-6"><h2 className="text-xl font-bold text-ink">New school event</h2><div className="mt-4"><EventForm calendars={calendars} clubs={clubs} canManageMeetingEffects={user.role === "admin"}/></div></section>
      <section className="rounded-card border border-line bg-card p-6"><h2 className="text-xl font-bold text-ink">Calendar content</h2>{events?.length?<div className="mt-4 space-y-3">{events.map(event=><details key={event.id} className="rounded-control border border-line p-4"><summary className="cursor-pointer"><span className="font-bold text-ink">{event.title}</span><span className="ml-2 text-xs text-muted">{new Date(event.start_at).toLocaleString("en-US")} · {event.published?"published":"draft"}{event.meeting_effect === "all" ? " · No Club meetings" : event.meeting_effect === "club" ? ` · ${clubs.find(club => club.id === event.affected_club_id)?.name ?? "Club"} cancelled` : ""}{event.club_id?" · Club managed":""}{event.calendar_id ? ` · ${calendars.find(item=>item.id===event.calendar_id)?.name ?? "Custom calendar"}` : ""}</span></summary><div className="mt-4"><EventForm event={event} calendars={calendars} clubs={clubs} canManageMeetingEffects={user.role === "admin"}/>{event.club_id?<p className="mt-3 text-xs text-muted">This Club event may be edited here by Staff or in its assigned Club workspace.</p>:null}</div></details>)}</div>:<p className="mt-4 text-sm text-muted">No events yet.</p>}</section>
    </div>}
  </div>;
}
