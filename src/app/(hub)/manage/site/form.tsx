"use client";
import { useActionState, useId, useState } from "react";
import { saveSiteText } from "./actions";

export default function SiteTextForm({ field, value }: { field: string; value: string }) {
  const [message, action, pending] = useActionState(saveSiteText, "");
  const [length, setLength] = useState(value.length);
  const descriptionId = useId();
  return <form action={action} className="grid gap-3 rounded-xl border border-white/15 p-5" aria-busy={pending}>
    <input type="hidden" name="key" value={field} />
    <label htmlFor={`${descriptionId}-body`} className="grid gap-2 font-semibold">{field.replaceAll("_", " ")}</label>
    <textarea id={`${descriptionId}-body`} name="body" required maxLength={4000} defaultValue={value} rows={4} aria-describedby={`${descriptionId}-help`} onChange={(event) => setLength(event.currentTarget.value.length)} className="w-full rounded-lg bg-white/10 p-3 font-normal" />
    <p id={`${descriptionId}-help`} className="text-xs text-cream/65">{length}/4000 characters</p>
    <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-cream px-5 py-2 text-navy disabled:opacity-50">{pending ? "Saving…" : "Save text"}</button>
    {message && <p role="status" aria-live="polite">{message}</p>}
  </form>;
}
