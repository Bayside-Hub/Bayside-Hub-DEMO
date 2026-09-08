import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

/** Audit is read-only. Raw before/after values preserve evidence for review. */
export default async function AuditPage() {
  await requireAdmin();
  const db = await createServerClient();
  const [roles, changes] = await Promise.all([
    db.from("account_role_audit").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("management_audit").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  return <div className="mx-auto max-w-5xl space-y-5 px-5 py-8">
    <h1 className="text-3xl font-bold">Management audit</h1>
    <p>Latest 100 entries per category. Club changes appear in each club’s management page. These records cannot be edited here.</p>
    {roles.error || changes.error ? <p role="alert">Audit data is unavailable. Verify the role and custom permission migrations.</p> : <>
      <h2 className="text-xl font-semibold">Account role changes</h2>
      {!roles.data?.length && <p>No recorded role changes.</p>}
      {roles.data?.map(row => <article key={row.id} className="rounded-xl border border-line p-4 text-sm"><p className="font-semibold">{row.previous_role} → {row.new_role}</p><p className="break-all">Account {row.profile_id} · Actor {row.actor_id ?? "System"}</p><time dateTime={row.created_at}>{new Date(row.created_at).toISOString()}</time>{row.club_id && <p>Club: {row.club_id}</p>}</article>)}
      <h2 className="text-xl font-semibold">Custom permissions & public text</h2>
      {!changes.data?.length && <p>No recorded management changes.</p>}
      {changes.data?.map(row => <details key={row.id} className="rounded-xl border border-line p-4 text-sm"><summary className="cursor-pointer break-words">{row.operation} · {row.resource} · {new Date(row.created_at).toISOString()}</summary><p className="mt-3 break-all">Actor: {row.actor_id ?? "System / SQL Editor"}</p><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-content-bg p-3">{JSON.stringify({ before: row.before_data, after: row.after_data }, null, 2)}</pre></details>)}
    </>}
  </div>;
}
