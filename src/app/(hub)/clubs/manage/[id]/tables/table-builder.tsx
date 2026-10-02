"use client";

import { useActionState, useState } from "react";
import { createCustomTable } from "./actions";

const input = "h-11 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";

export default function TableBuilder({ clubId }: { clubId: string }) {
  const [columns, setColumns] = useState([{ id: crypto.randomUUID() }]);
  const [result, action, pending] = useActionState(async (_state: { ok: boolean; message: string } | null, form: FormData) => createCustomTable(form), null);
  return <form action={action} className="mt-5 grid gap-4">
    <input type="hidden" name="club_id" value={clubId} />
    <label className="text-sm font-semibold text-ink">Table name<input name="name" required minLength={2} maxLength={80} placeholder="Volunteer hours" className={`${input} mt-1`} /></label>
    <label className="text-sm font-semibold text-ink">Description<textarea name="description" maxLength={500} rows={2} placeholder="What this table tracks" className={`${input} mt-1 h-auto py-3`} /></label>
    <fieldset className="grid gap-3"><legend className="text-sm font-semibold text-ink">Columns</legend>{columns.map((column, index) => <div key={column.id} className="grid gap-2 rounded-control border border-line p-3 sm:grid-cols-[1fr_150px_auto_auto] sm:items-end"><label className="text-xs font-semibold text-muted">Column name<input name="column_label" required maxLength={80} placeholder="Student name" className={`${input} mt-1`} /></label><label className="text-xs font-semibold text-muted">Type<select name="column_type" className={`${input} mt-1`}><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="checkbox">Checkbox</option></select></label><label className="flex h-11 items-center gap-2 text-xs font-semibold text-muted"><input type="checkbox" name="column_required" value={index} />Required</label><button type="button" disabled={columns.length === 1} onClick={() => setColumns(current => current.filter(item => item.id !== column.id))} className="h-11 px-2 text-xs font-bold text-orange disabled:opacity-30">Remove</button></div>)}</fieldset>
    <div className="flex flex-wrap gap-3"><button type="button" disabled={columns.length >= 30} onClick={() => setColumns(current => [...current, { id: crypto.randomUUID() }])} className="h-10 rounded-full border border-line px-4 text-sm font-semibold text-ink">Add column</button><button disabled={pending} className="h-10 rounded-full bg-navy px-5 text-sm font-bold text-cream disabled:opacity-50">{pending ? "Creating…" : "Create table"}</button></div>
    {result && <p role={result.ok ? "status" : "alert"} className="text-sm text-muted">{result.message}</p>}
  </form>;
}
