"use client";

import { useActionState, useState } from "react";
import type { CalendarSourceRow, EventRow } from "@/lib/supabase/types";
import { deleteEvent, saveEvent } from "../actions";

const field = "h-10 w-full rounded-control border border-black/10 bg-content-bg px-3 text-sm text-ink";

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function EventForm({ event, calendars = [], clubs = [], canManageMeetingEffects = false }: {
  event?: EventRow;
  calendars?: CalendarSourceRow[];
  clubs?: Array<{ id: string; name: string }>;
  canManageMeetingEffects?: boolean;
}) {
  const [state, action, pending] = useActionState(saveEvent, null);
  const [deleteState, deleteAction, deleting] = useActionState(deleteEvent, null);
  const [startAt, setStartAt] = useState(localDateTime(event?.start_at ?? null));
  const [endAt, setEndAt] = useState(localDateTime(event?.end_at ?? null));
  const [meetingEffect, setMeetingEffect] = useState(event?.meeting_effect ?? "none");
  return <div><form action={action} className="grid gap-3"><input type="hidden" name="id" value={event?.id ?? ""}/><input name="title" required minLength={3} maxLength={160} defaultValue={event?.title} placeholder="Event title" className={field}/><div className="grid gap-3 sm:grid-cols-2"><select name="event_type" defaultValue={event?.event_type ?? "school"} className={field}><option value="school">School</option><option value="sports">Sports</option><option value="festival">Festival</option><option value="spirit_week">Spirit week</option><option value="other">Other</option></select><select name="calendar_id" defaultValue={event?.calendar_id ?? ""} className={field}><option value="">Main school calendar</option>{calendars.map(calendar=><option key={calendar.id} value={calendar.id}>{calendar.name}</option>)}</select></div><textarea name="description" required minLength={3} maxLength={5000} rows={4} defaultValue={event?.description} placeholder="Description" className={`${field} h-auto py-2`}/><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-muted">Starts<input type="datetime-local" required value={startAt} onChange={e=>setStartAt(e.target.value)} className={`${field} mt-1`}/></label><label className="text-xs font-semibold text-muted">Ends<input type="datetime-local" value={endAt} onChange={e=>setEndAt(e.target.value)} className={`${field} mt-1`}/></label></div><input type="hidden" name="start_at" value={startAt ? new Date(startAt).toISOString() : ""}/><input type="hidden" name="end_at" value={endAt ? new Date(endAt).toISOString() : ""}/>
    {canManageMeetingEffects ? <fieldset className="rounded-control border border-line bg-content-bg p-3"><legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted">Club meeting impact</legend><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-muted">Meeting status<select name="meeting_effect" value={meetingEffect} onChange={event => setMeetingEffect(event.target.value as "none" | "all" | "club")} className={`${field} mt-1`}><option value="none">Regular calendar event</option><option value="all">No Club meetings — all Clubs</option><option value="club">Cancel one Club&apos;s meeting</option></select></label>{meetingEffect === "club" ? <label className="text-xs font-semibold text-muted">Affected Club<select name="affected_club_id" required defaultValue={event?.affected_club_id ?? ""} className={`${field} mt-1`}><option value="">Choose Club</option>{clubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label> : <input type="hidden" name="affected_club_id" value=""/>}</div><p className="mt-2 text-xs leading-5 text-muted">Published events marked “No Club meetings” remove recurring meetings for every covered date. A Club cancellation removes only that Club&apos;s meeting.</p></fieldset> : <><input type="hidden" name="meeting_effect" value={event?.meeting_effect ?? "none"}/><input type="hidden" name="affected_club_id" value={event?.affected_club_id ?? ""}/>{event?.meeting_effect && event.meeting_effect !== "none" ? <p className="text-xs font-semibold text-orange">This meeting cancellation can only be changed by an administrator.</p> : null}</>}
    <div className="grid gap-3 sm:grid-cols-2"><input name="location" maxLength={240} defaultValue={event?.location ?? ""} placeholder="Location" className={field}/><input name="price_label" maxLength={80} defaultValue={event?.price_label ?? "Free"} placeholder="Free or price" className={field}/></div><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="published" defaultChecked={event?.published ?? false}/> Published on public calendars</label>{state&&<p role={state.ok?"status":"alert"} className="text-sm text-muted">{state.message}</p>}<button disabled={pending} className="h-10 rounded-full bg-navy px-5 font-bold text-cream">{pending?"Saving…":event?"Save event":"Create event"}</button></form>{event&&!event.club_id?<form action={deleteAction} className="mt-3 flex items-center gap-2 border-t border-line pt-3"><input type="hidden" name="id" value={event.id}/><label className="text-xs text-muted"><input type="checkbox" name="confirm" value="delete" required/> Confirm permanent deletion</label><button disabled={deleting} className="ml-auto text-xs font-bold text-orange">{deleting?"Deleting…":"Delete"}</button>{deleteState&&<span className="text-xs text-muted">{deleteState.message}</span>}</form>:null}</div>;
}
