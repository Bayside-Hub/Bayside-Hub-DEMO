"use client";
import { useActionState, useId, useState } from "react";
import { saveSiteText } from "./actions";

export default function SiteTextForm({ field, value, label, help, rows = 3, optional = false }: { field: string; value: string; label: string; help: string; rows?: number; optional?: boolean }) {
  const [message, action, pending] = useActionState(saveSiteText, "");
  const [length, setLength] = useState(value.length);
  const descriptionId = useId();
  return <form action={action} className="grid gap-3 rounded-xl border border-line bg-card p-5 text-ink" aria-busy={pending}>
    <input type="hidden" name="key" value={field} />
    <label htmlFor={`${descriptionId}-body`} className="grid gap-2 font-semibold">{label}{optional ? <span className="text-xs font-normal text-muted">Optional</span> : null}</label>
    <textarea id={`${descriptionId}-body`} name="body" required={!optional} maxLength={4000} defaultValue={value} rows={rows} aria-describedby={`${descriptionId}-help`} onChange={(event) => setLength(event.currentTarget.value.length)} className="w-full rounded-lg border border-line bg-content-bg p-3 font-normal text-ink" />
    <p id={`${descriptionId}-help`} className="flex justify-between gap-3 text-xs text-muted"><span>{help}</span><span>{length}/4000</span></p>
    <button type="submit" disabled={pending} className="justify-self-start rounded-full bg-cream px-5 py-2 text-navy disabled:opacity-50">{pending ? "Saving…" : "Save text"}</button>
    {message && <p role="status" aria-live="polite">{message}</p>}
  </form>;
}
