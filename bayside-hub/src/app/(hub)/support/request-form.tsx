"use client";

import { useActionState } from "react";
import { submitSupportRequest } from "./actions";

const options = [
  ["technical", "Technical support"],
  ["club_support", "Club support"],
  ["charter", "Club charter or edit"],
  ["room_reservation", "Room reservation"],
  ["funding", "Funding request"],
  ["fundraising_finance", "Fundraising and finance"],
] as const;

export default function SupportRequestForm() {
  const [state, action, pending] = useActionState(submitSupportRequest, null);
  return (
    <form action={action} className="mt-5 grid gap-4">
      <label className="grid gap-1.5 text-sm font-semibold text-cream">
        Request type
        <select name="request_type" className="h-11 rounded-control border border-line bg-content-bg px-3 text-ink" defaultValue="technical">
          {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-cream">
        Subject
        <input name="subject" required minLength={3} maxLength={120} className="h-11 rounded-control border border-line bg-content-bg px-3 text-ink" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-cream">
        Details
        <textarea name="details" required minLength={10} maxLength={4000} rows={5} className="rounded-control border border-line bg-content-bg px-3 py-2 text-ink" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-cream">
        Requested date/time <span className="font-normal text-cream/60">(optional, for room requests)</span>
        <input type="datetime-local" name="requested_for" className="h-11 rounded-control border border-line bg-content-bg px-3 text-ink" />
      </label>
      {state && <p role={state.ok ? "status" : "alert"} className={`rounded-control px-3 py-2 text-sm ${state.ok ? "bg-powder/15 text-powder" : "bg-orange/15 text-orange"}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-[22px] bg-cream px-6 text-sm font-bold text-black hover:bg-white disabled:opacity-50">
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
