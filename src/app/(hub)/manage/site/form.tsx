"use client";
import { useActionState } from "react";
import { saveSiteText } from "./actions";

export default function SiteTextForm({ field, value }: { field: string; value: string }) {
  const [message, action, pending] = useActionState(saveSiteText, "");
  return <form action={action} className="grid gap-3 rounded-xl border border-white/15 p-5">
    <input type="hidden" name="key" value={field} />
    <label className="grid gap-2 font-semibold">{field.replaceAll("_", " ")}<textarea name="body" required maxLength={4000} defaultValue={value} rows={4} className="w-full rounded-lg bg-white/10 p-3 font-normal" /></label>
    <button disabled={pending} className="justify-self-start rounded-full bg-cream px-5 py-2 text-navy disabled:opacity-50">{pending ? "Saving…" : "Save text"}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
