"use client";

import { useActionState, useRef, useState } from "react";
import type { ClubCustomColumn } from "@/lib/supabase/types";
import { createCustomTable, updateCustomTable } from "./actions";

const input = "h-11 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";
type EditableColumn = ClubCustomColumn & { id: string };

export default function TableBuilder({ clubId, table }: { clubId: string; table?: { id: string; name: string; description: string | null; columns: ClubCustomColumn[] } }) {
  const initial = table?.columns.map(column => ({ ...column, id: column.key })) ?? [{ id: "column_1", key: "column_1", label: "", type: "text" as const, required: false }];
  const [columns, setColumns] = useState<EditableColumn[]>(initial);
  const nextKey = useRef(Math.max(0, ...initial.map(column => Number(column.key.split("_")[1]) || 0)) + 1);
  const actionFn = table ? updateCustomTable : createCustomTable;
  const [result, action, pending] = useActionState(async (_state: { ok: boolean; message: string } | null, form: FormData) => actionFn(form), null);
  function update(id: string, values: Partial<EditableColumn>) { setColumns(current => current.map(column => column.id === id ? { ...column, ...values } : column)); }
  return <form action={action} className="mt-5 grid gap-4">
    <input type="hidden" name="club_id" value={clubId}/>{table ? <input type="hidden" name="table_id" value={table.id}/> : null}
    <label className="text-sm font-semibold text-ink">Table name<input name="name" required minLength={2} maxLength={80} defaultValue={table?.name} placeholder="Volunteer hours" className={`${input} mt-1`}/></label>
    <label className="text-sm font-semibold text-ink">Description<textarea name="description" maxLength={500} rows={2} defaultValue={table?.description ?? ""} placeholder="What this table tracks" className={`${input} mt-1 h-auto py-3`}/></label>
    <fieldset className="grid gap-3"><legend className="text-sm font-semibold text-ink">Columns</legend>{columns.map(column => <div key={column.id} className="grid gap-2 rounded-control border border-line p-3 lg:grid-cols-[1fr_155px_1fr_auto_auto] lg:items-end"><input type="hidden" name="column_key" value={column.key}/><label className="text-xs font-semibold text-muted">Column name<input name="column_label" required maxLength={80} value={column.label} onChange={event=>update(column.id,{label:event.target.value})} placeholder="Student name" className={`${input} mt-1`}/></label><label className="text-xs font-semibold text-muted">Type<select name="column_type" value={column.type} onChange={event=>update(column.id,{type:event.target.value as ClubCustomColumn["type"]})} className={`${input} mt-1`}><option value="text">Short text</option><option value="long_text">Long text</option><option value="number">Number</option><option value="date">Date</option><option value="checkbox">Checkbox</option><option value="email">Email</option><option value="url">HTTPS link</option><option value="select">Dropdown</option></select></label><label className={`text-xs font-semibold text-muted ${column.type === "select" ? "" : "opacity-50"}`}>Dropdown options<textarea name="column_options" value={column.options?.join("\n") ?? ""} onChange={event=>update(column.id,{options:event.target.value.split("\n")})} disabled={column.type !== "select"} rows={2} placeholder="One option per line" className={`${input} mt-1 h-auto py-2`}/>{column.type !== "select" ? <input type="hidden" name="column_options" value=""/> : null}</label><label className="flex h-11 items-center gap-2 text-xs font-semibold text-muted"><input type="checkbox" name="column_required" value={column.key} defaultChecked={column.required}/>Required</label><button type="button" disabled={columns.length===1} onClick={()=>setColumns(current=>current.filter(item=>item.id!==column.id))} className="h-11 px-2 text-xs font-bold text-orange disabled:opacity-30">Remove</button></div>)}</fieldset>
    <div className="flex flex-wrap gap-3"><button type="button" disabled={columns.length>=30} onClick={()=>{const key=`column_${nextKey.current++}`;setColumns(current=>[...current,{id:key,key,label:"",type:"text",required:false}])}} className="h-10 rounded-full border border-line px-4 text-sm font-semibold text-ink">Add column</button><button disabled={pending} className="h-10 rounded-full bg-navy px-5 text-sm font-bold text-cream disabled:opacity-50">{pending?"Saving…":table?"Save table settings":"Create table"}</button></div>
    {table ? <p className="text-xs text-muted">Removing a column hides it from existing rows and exports. Editing a row permanently removes hidden values from that row.</p> : null}
    {result&&<p role={result.ok?"status":"alert"} className="text-sm text-muted">{result.message}</p>}
  </form>;
}
