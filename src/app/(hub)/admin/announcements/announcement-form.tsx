"use client";

import { useActionState, useMemo, useState } from "react";
import AnnouncementBody from "@/components/announcement-body";
import type { AnnouncementDraftRow } from "@/lib/supabase/types";
import { createAnnouncement } from "../actions";
import { localDateTime, useDraftAutosave } from "./use-draft-autosave";

const tags = ["Announcements", "Events", "Clubs", "Sports", "Opportunities"];
const input = "h-10 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";

export default function AnnouncementForm({ disabled, draft }: { disabled?: boolean; draft?: AnnouncementDraftRow | null }) {
  const [state, action, pending] = useActionState(createAnnouncement, null);
  const [title, setTitle] = useState(draft?.title ?? "");
  const [tag, setTag] = useState(draft?.tag ?? "Announcements");
  const [body, setBody] = useState(draft?.body ?? "");
  const [publishAt, setPublishAt] = useState(localDateTime(draft?.publish_at));
  const [preview, setPreview] = useState(false);
  const fields = useMemo(() => ({ title, tag, body, publishAt }), [title, tag, body, publishAt]);
  const autosave = useDraftAutosave("new", fields, disabled || state?.ok === true);

  return <form action={action} className="mt-4 grid gap-4">
    <label className="grid gap-1 text-sm font-semibold text-ink">Title<input name="title" required minLength={3} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} disabled={disabled} className={input} /></label>
    <label className="grid gap-1 text-sm font-semibold text-ink">Tag<select name="tag" value={tag} onChange={(event) => setTag(event.target.value)} disabled={disabled} className={input}>{tags.map((value) => <option key={value}>{value}</option>)}</select></label>
    <label className="grid gap-1 text-sm font-semibold text-ink">Body<textarea name="body" required minLength={3} maxLength={10000} rows={7} value={body} onChange={(event) => setBody(event.target.value)} disabled={disabled} className={`${input} h-auto py-3`} /><span className="text-xs font-normal text-muted">Full https:// links become clickable after publishing.</span></label>
    <label className="grid gap-1 text-sm font-semibold text-ink">Schedule publication (optional)<input type="datetime-local" value={publishAt} onChange={(event) => setPublishAt(event.target.value)} disabled={disabled} className={input} /><span className="text-xs font-normal text-muted">Leave blank to publish now. A future time keeps it hidden until then.</span></label>
    <input type="hidden" name="publish_at" value={publishAt ? new Date(publishAt).toISOString() : ""} />
    <p role="status" className="min-h-5 text-xs text-muted">{autosave || (draft ? "Recovered your saved draft." : "Changes save automatically while you edit.")}</p>
    <button type="button" onClick={() => setPreview((current) => !current)} className="justify-self-start text-sm font-semibold text-navy underline">{preview ? "Hide preview" : "Preview before publication"}</button>
    {preview && <article className="rounded-card border border-line bg-content-bg p-5"><p className="text-xs font-bold uppercase text-muted">{tag}</p><h3 className="mt-2 text-xl font-bold text-ink">{title || "Announcement title"}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted"><AnnouncementBody body={body || "Announcement body"} /></p>{publishAt && <p className="mt-3 text-xs text-muted">Scheduled for {new Date(publishAt).toLocaleString()}</p>}</article>}
    <label className="flex items-start gap-2 text-xs leading-5 text-muted"><input type="checkbox" required className="mt-1" /><span>I reviewed this announcement and am ready to publish or schedule it.</span></label>
    <label className="grid gap-1 text-sm font-semibold text-ink">Version note<input name="version_note" maxLength={240} defaultValue="Initial publication" className={input} /></label>
    {state && <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-navy" : "text-orange"}`}>{state.message}</p>}
    <button disabled={disabled || pending} className="h-10 rounded-full bg-navy px-6 font-semibold text-cream disabled:opacity-50">{pending ? "Saving…" : "Publish or schedule"}</button>
  </form>;
}
