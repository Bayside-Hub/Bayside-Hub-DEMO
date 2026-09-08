"use client";
import { useActionState } from "react";
import { submitSchoolAnnouncement, reviewSchoolAnnouncement } from "./actions";
const field = "min-h-11 w-full rounded-lg border border-line bg-content-bg px-3 py-2 text-ink";
export function SubmissionForm({ clubs }: { clubs: { id: string; name: string }[] }) {
  const [message, action, pending] = useActionState(submitSchoolAnnouncement, "");
  return <form action={action} className="grid gap-4 rounded-2xl border border-line bg-card p-6">
    <label>Club<select className={field} name="club_id" required defaultValue=""><option disabled value="">Choose your club</option>{clubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label>
    <label>Title<input className={field} name="title" required minLength={3} maxLength={120} /></label>
    <label>School announcement<textarea className={field} rows={7} name="body" required minLength={3} maxLength={10000} /></label>
    <button disabled={pending} className="min-h-11 rounded-full bg-navy px-5 font-semibold text-cream disabled:opacity-50">{pending ? "Submitting…" : "Submit for review"}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
export function ReviewForm({ id }: { id: string }) {
  const [message, action, pending] = useActionState(reviewSchoolAnnouncement, "");
  return <form action={action} className="mt-4 grid gap-3"><input type="hidden" name="id" value={id} /><label>Review feedback<textarea name="note" maxLength={2000} className={field} /></label><div className="flex gap-3"><button name="decision" value="approve" disabled={pending} className="min-h-11 rounded-full bg-navy px-5 text-cream">Approve and publish</button><button name="decision" value="reject" disabled={pending} className="min-h-11 rounded-full border border-line px-5">Reject</button></div>{message && <p role="status">{message}</p>}</form>;
}
