import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { ReviewForm } from "../../announcements/submit/forms";
export default async function ReviewPage() {
  await requireAdmin();
  const db = await createServerClient();
  const { data, error } = await db.from("school_announcement_submissions").select("*").eq("status", "pending").order("created_at").limit(100);
  return <div className="mx-auto max-w-4xl space-y-6 px-5 py-8"><h1 className="text-3xl font-bold">School announcement review</h1>{error ? <p role="alert">Unable to load the review queue. No announcements have been changed.</p> : !data?.length ? <p>No submissions awaiting review.</p> : data.map(row => <article key={row.id} className="rounded-2xl border border-line bg-card p-6"><h2 className="text-xl font-bold">{row.title}</h2><p className="mt-3 whitespace-pre-wrap break-words">{row.body}</p><ReviewForm id={row.id} /></article>)}</div>;
}
