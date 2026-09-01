"use client";

import { useActionState } from "react";
import { updateAnnouncement } from "../../actions";

export default function EditAnnouncementForm({ announcement }: { announcement: { id: string; title: string; tag: string; body: string } }) {
  const [state, action, pending] = useActionState(updateAnnouncement, null);
  const input = "w-full rounded-control border border-black/10 bg-content-bg px-4 text-sm text-ink";
  return <form action={action} className="grid gap-4"><input type="hidden" name="id" value={announcement.id} /><label className="grid gap-1 text-sm font-semibold text-ink">Title<input name="title" required minLength={3} maxLength={120} defaultValue={announcement.title} className={`${input} h-10`} /></label><label className="grid gap-1 text-sm font-semibold text-ink">Tag<select name="tag" defaultValue={announcement.tag} className={`${input} h-10`}><option>Announcements</option><option>Events</option><option>Clubs</option><option>Sports</option><option>Opportunities</option></select></label><label className="grid gap-1 text-sm font-semibold text-ink">Body<textarea name="body" required minLength={3} maxLength={10000} rows={10} defaultValue={announcement.body} className={`${input} py-3`} /></label><label className="grid gap-1 text-sm font-semibold text-ink">What changed?<input name="version_note" required maxLength={240} placeholder="Corrected the event time" className={`${input} h-10`} /></label>{state && <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-navy" : "text-sm text-orange"}>{state.message}</p>}<button disabled={pending} className="h-10 rounded-full bg-navy px-6 font-semibold text-cream disabled:opacity-50">{pending ? "Saving…" : "Save new version"}</button></form>;
}
