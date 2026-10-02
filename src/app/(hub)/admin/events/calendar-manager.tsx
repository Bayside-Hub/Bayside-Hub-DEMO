"use client";

import { useActionState } from "react";
import type { CalendarSourceRow } from "@/lib/supabase/types";
import { createCalendar, importCalendarCsv, setCalendarActive } from "../actions";

const field = "h-10 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";

function CalendarToggle({ calendar }: { calendar: CalendarSourceRow }) {
  const [, action, pending] = useActionState(setCalendarActive, null);
  return <form action={action} className="flex items-center gap-3 rounded-control bg-content-bg p-3"><input type="hidden" name="id" value={calendar.id}/><input type="hidden" name="active" value={calendar.active?"false":"true"}/><span className="size-3 rounded-full" style={{backgroundColor:calendar.color}}/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{calendar.name}</span><span className="text-xs text-muted">{calendar.active?"Visible publicly":"Hidden"}</span></span><button disabled={pending} className="text-xs font-bold text-navy">{pending?"Saving…":calendar.active?"Hide":"Show"}</button></form>;
}

export default function CalendarManager({ calendars }: { calendars: CalendarSourceRow[] }) {
  const [createState, createAction, creating] = useActionState(createCalendar, null);
  const [importState, importAction, importing] = useActionState(importCalendarCsv, null);
  return <section className="rounded-card border border-line bg-card p-6 lg:col-span-2">
    <h2 className="text-xl font-bold text-ink">Custom calendars</h2>
    <p className="mt-1 text-sm text-muted">Create separate calendar layers, then add events manually or import up to 500 events from CSV.</p>
    <div className="mt-5 grid gap-6 lg:grid-cols-2">
      <form action={createAction} className="grid gap-3"><h3 className="font-bold text-ink">Add calendar</h3><input name="name" required minLength={2} maxLength={80} placeholder="Calendar name" className={field}/><textarea name="description" maxLength={500} rows={3} placeholder="Description (optional)" className={`${field} h-auto py-2`}/><label className="flex items-center gap-3 text-sm font-semibold text-ink">Color<input name="color" type="color" defaultValue="#263A99" className="h-10 w-16 rounded border border-line"/></label>{createState?<p role={createState.ok?"status":"alert"} className="text-sm text-muted">{createState.message}</p>:null}<button disabled={creating} className="h-10 rounded-full bg-navy px-5 font-bold text-cream">{creating?"Creating…":"Create calendar"}</button></form>
      <form action={importAction} className="grid gap-3"><h3 className="font-bold text-ink">Import events</h3><select name="calendar_id" required className={field}><option value="">Choose calendar</option>{calendars.map(calendar=><option key={calendar.id} value={calendar.id}>{calendar.name}</option>)}</select><input name="csv" type="file" accept=".csv,text/csv" required className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-content-bg file:px-4 file:py-2 file:font-semibold file:text-ink"/><p className="text-xs leading-5 text-muted">Required columns: <code>title,start_at</code>. Optional: <code>end_at,description,event_type,location,price_label,published</code>. Dates must be ISO format with a timezone, such as <code>2026-10-15T15:00:00-04:00</code>.</p>{importState?<p role={importState.ok?"status":"alert"} className="text-sm text-muted">{importState.message}</p>:null}<button disabled={importing||!calendars.length} className="h-10 rounded-full border border-navy px-5 font-bold text-navy disabled:opacity-50">{importing?"Importing…":"Import CSV"}</button></form>
    </div>
    {calendars.length?<div className="mt-6 border-t border-line pt-4"><h3 className="font-bold text-ink">Calendar layers</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{calendars.map(calendar=><CalendarToggle key={calendar.id} calendar={calendar}/>)}</div></div>:null}
  </section>;
}
