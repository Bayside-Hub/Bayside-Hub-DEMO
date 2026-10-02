import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActionFeedbackForm from "@/components/action-feedback-form";
import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import type { ClubCustomColumn } from "@/lib/supabase/types";
import { addCustomTableRow, deleteCustomTableRow } from "../actions";

const input = "h-11 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";

function CellInput({ column }: { column: ClubCustomColumn }) {
  if (column.type === "checkbox") return <label className="flex h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" name={column.key} /> {column.label}</label>;
  return <label className="text-sm font-semibold">{column.label}{column.required ? " *" : ""}<input name={column.key} type={column.type === "number" ? "number" : column.type === "date" ? "date" : "text"} required={column.required} maxLength={column.type === "text" ? 2000 : undefined} step={column.type === "number" ? "any" : undefined} className={`${input} mt-1`} /></label>;
}

function display(value: string | number | boolean | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === "" || value == null ? "—" : String(value);
}

export default async function CustomTablePage({ params }: { params: Promise<{ id: string; tableId: string }> }) {
  const { id, tableId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/clubs/manage/${id}/tables/${tableId}`)}`);
  const db = await createServerClient();
  const access = await db.rpc("can_manage_club", { p_club_id: id });
  if (!access.data) redirect("/clubs/manage");
  const [club, table, rows] = await Promise.all([
    db.from("clubs").select("id,name").eq("id", id).maybeSingle(),
    db.from("club_custom_tables").select("*").eq("id", tableId).eq("club_id", id).maybeSingle(),
    db.from("club_custom_table_rows").select("*").eq("table_id", tableId).order("created_at", { ascending: false }).limit(500),
  ]);
  if (!club.data || !table.data) notFound();
  const columns = table.data.columns;
  return <div className="mx-auto max-w-7xl space-y-7 px-5 py-8 text-ink">
    <header><Link href={`/clubs/manage/${id}/tables`} className="text-sm font-semibold text-powder">← {club.data.name} tables</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-bold">{table.data.name}</h1><p className="mt-2 text-muted">{table.data.description || "Custom Club data table"}</p></div><a href={`/clubs/manage/${id}/tables/${tableId}/export`} className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-bold">Export CSV</a></div></header>
    <section className="rounded-card border border-line bg-card p-6 shadow-sm"><h2 className="text-xl font-bold">Add a row</h2><ActionFeedbackForm action={addCustomTableRow} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><input type="hidden" name="club_id" value={id} /><input type="hidden" name="table_id" value={tableId} />{columns.map(column => <CellInput key={column.key} column={column} />)}<button className="h-11 self-end rounded-full bg-navy px-5 font-bold text-cream">Add row</button></ActionFeedbackForm></section>
        <section className="rounded-card border border-line bg-card p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Online data</h2><span className="text-xs text-muted">Latest 500 rows</span></div>{rows.error ? <p role="alert" className="mt-4 text-orange">Rows could not be loaded.</p> : rows.data?.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-max text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase text-muted"><th className="px-3 py-3">Recorded</th>{columns.map(column => <th key={column.key} className="px-3 py-3">{column.label}</th>)}<th className="px-3 py-3">Action</th></tr></thead><tbody className="divide-y divide-line">{rows.data.map(row => <tr key={row.id}><td className="whitespace-nowrap px-3 py-3 text-muted">{new Date(row.created_at).toLocaleString("en-US")}</td>{columns.map(column => <td key={column.key} className="max-w-80 break-words px-3 py-3">{display(row.data[column.key])}</td>)}<td className="px-3 py-3"><ActionFeedbackForm action={deleteCustomTableRow} className="flex items-center gap-2"><input type="hidden" name="club_id" value={id} /><input type="hidden" name="table_id" value={tableId} /><input type="hidden" name="row_id" value={row.id} /><label className="text-xs text-muted"><input type="checkbox" name="confirm" value="yes" required /> Confirm</label><button className="text-xs font-bold text-orange">Delete</button></ActionFeedbackForm></td></tr>)}</tbody></table></div> : <p className="mt-4 text-muted">No rows yet.</p>}</section>
  </div>;
}
