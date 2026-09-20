"use client";

import { useActionState } from "react";
import type { EventRow } from "@/lib/supabase/types";
import { deleteEvent, saveEvent } from "../actions";

const field = "h-10 w-full rounded-control border border-black/10 bg-content-bg px-3 text-sm text-ink";

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function EventForm({ event }: { event?: EventRow }) {
  const [state, action, pending] = useActionState(saveEvent, null);
  const [deleteState, deleteAction, deleting] = useActionState(deleteEvent, null);
  return <div><form action={action} className="grid gap-3"><input type="hidden" name="id" value={event?.id ?? ""}/><input name="title" required minLength={3} maxLength={160} defaultValue={event?.title} placeholder="Event title" className={field}/><select name="event_type" defaultValue={event?.event_type ?? "school"} className={field}><option value="school">School</option><option value="sports">Sports</option><option value="festival">Festival</option><option value="spirit_week">Spirit week</option><option value="other">Other</option></select><textarea name="description" required minLength={3} maxLength={5000} rows={4} defaultValue={event?.description} placeholder="Description" className={`${field} h-auto py-2`}/><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-muted">Starts<input type="datetime-local" name="start_at" required defaultValue={localDateTime(event?.start_at ?? null)} className={`${field} mt-1`}/></label><label className="text-xs font-semibold text-muted">Ends<input type="datetime-local" name="end_at" defaultValue={localDateTime(event?.end_at ?? null)} className={`${field} mt-1`}/></label></div><div className="grid gap-3 sm:grid-cols-2"><input name="location" maxLength={240} defaultValue={event?.location ?? ""} placeholder="Location" className={field}/><input name="price_label" maxLength={80} defaultValue={event?.price_label ?? "Free"} placeholder="Free or price" className={field}/></div><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="published" defaultChecked={event?.published ?? false}/> Published on public calendars</label>{state&&<p role={state.ok?"status":"alert"} className="text-sm text-muted">{state.message}</p>}<button disabled={pending} className="h-10 rounded-full bg-navy px-5 font-bold text-cream">{pending?"Saving…":event?"Save event":"Create event"}</button></form>{event&&!event.club_id?<form action={deleteAction} className="mt-3 flex items-center gap-2 border-t border-line pt-3"><input type="hidden" name="id" value={event.id}/><label className="text-xs text-muted"><input type="checkbox" name="confirm" value="delete" required/> Confirm permanent deletion</label><button disabled={deleting} className="ml-auto text-xs font-bold text-orange">{deleting?"Deleting…":"Delete"}</button>{deleteState&&<span className="text-xs text-muted">{deleteState.message}</span>}</form>:null}</div>;
}
