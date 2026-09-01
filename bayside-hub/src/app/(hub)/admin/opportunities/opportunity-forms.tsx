"use client";

import { useActionState } from "react";
import { createOpportunity, setOpportunityStatus } from "../actions";

const field = "h-10 w-full rounded-control border border-black/10 bg-content-bg px-3 text-sm text-ink";

export function OpportunityForm() {
  const [state, action, pending] = useActionState(createOpportunity, null);
  return <form action={action} className="mt-4 grid gap-3"><input name="title" required minLength={3} maxLength={120} placeholder="Title" className={field} /><select name="category" className={field}><option value="election">Election</option><option value="community_service">Community service</option><option value="internship">Internship</option><option value="pre_college">Pre-college</option><option value="discount">Student discount</option></select><textarea name="description" required minLength={10} maxLength={4000} rows={4} placeholder="Description" className={`${field} h-auto py-2`} /><textarea name="eligibility" rows={2} placeholder="Eligibility" className={`${field} h-auto py-2`} /><input type="url" name="application_link" placeholder="https:// application link" className={field} /><label className="text-xs font-semibold text-muted">Deadline<input type="datetime-local" name="deadline" className={`${field} mt-1`} /></label>{state && <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-navy" : "text-orange"}`}>{state.message}</p>}<button disabled={pending} className="h-10 rounded-full bg-navy px-5 font-semibold text-cream disabled:opacity-50">{pending ? "Saving…" : "Save draft"}</button></form>;
}

export function OpportunityStatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(setOpportunityStatus, null);
  return <form action={action} className="flex flex-wrap items-center justify-end gap-2"><input type="hidden" name="id" value={id} /><select name="status" defaultValue={status} className="h-9 rounded-full border border-black/10 bg-content-bg px-3 text-xs font-semibold text-ink"><option value="draft">Draft</option><option value="in_review">In review</option><option value="published">Published</option><option value="expired">Expired</option><option value="archived">Archived</option></select><button disabled={pending} className="h-9 rounded-full bg-navy px-4 text-xs font-semibold text-cream">{pending ? "Saving…" : "Update"}</button>{state && <span className="basis-full text-right text-xs text-muted">{state.message}</span>}</form>;
}
