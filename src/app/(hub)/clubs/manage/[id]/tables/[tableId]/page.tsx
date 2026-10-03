import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActionFeedbackForm from "@/components/action-feedback-form";
import Pagination from "@/components/pagination";
import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import type { ClubCustomColumn, ClubCustomTableDataRow } from "@/lib/supabase/types";
import { addCustomTableRow, deleteCustomTableRow, duplicateCustomTable, importCustomTableCsv, updateCustomTableRow } from "../actions";
import TableBuilder from "../table-builder";

const input = "h-11 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";
const PAGE_SIZE=25;

function CellInput({ column, value }: { column: ClubCustomColumn; value?: string | number | boolean }) {
  const label=<>{column.label}{column.required?" *":""}</>;
  if(column.type==="checkbox")return <label className="flex h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" name={column.key} defaultChecked={value===true}/> {label}</label>;
  if(column.type==="long_text")return <label className="text-sm font-semibold">{label}<textarea name={column.key} required={column.required} maxLength={2000} rows={3} defaultValue={String(value??"")} className={`${input} mt-1 h-auto py-2`}/></label>;
  if(column.type==="select")return <label className="text-sm font-semibold">{label}<select name={column.key} required={column.required} defaultValue={String(value??"")} className={`${input} mt-1`}><option value="">Choose…</option>{column.options?.map(option=><option key={option}>{option}</option>)}</select></label>;
  const type=column.type==="number"?"number":column.type==="date"?"date":column.type==="email"?"email":column.type==="url"?"url":"text";
  return <label className="text-sm font-semibold">{label}<input name={column.key} type={type} required={column.required} defaultValue={typeof value==="boolean"?"":value??""} maxLength={["text","email","url"].includes(column.type)?2000:undefined} step={column.type==="number"?"any":undefined} pattern={column.type==="url"?"https://.*":undefined} className={`${input} mt-1`}/></label>;
}

function display(column:ClubCustomColumn,value:string|number|boolean|undefined){
  if(typeof value==="boolean")return value?"Yes":"No"; if(value===""||value==null)return "—";
  if(column.type==="url"&&typeof value==="string"&&value.startsWith("https://"))return <a href={value} target="_blank" rel="noreferrer" className="font-semibold text-navy underline">Open link</a>;
  if(column.type==="email"&&typeof value==="string")return <a href={`mailto:${value}`} className="font-semibold text-navy underline">{value}</a>;
  return String(value);
}

function compare(a:ClubCustomTableDataRow,b:ClubCustomTableDataRow,key:string,direction:string){
  const av=key==="created_at"?a.created_at:a.data[key]; const bv=key==="created_at"?b.created_at:b.data[key];
  const result=typeof av==="number"&&typeof bv==="number"?av-bv:String(av??"").localeCompare(String(bv??""),undefined,{numeric:true,sensitivity:"base"}); return direction==="asc"?result:-result;
}

export default async function CustomTablePage({params,searchParams}:{params:Promise<{id:string;tableId:string}>;searchParams:Promise<{q?:string;sort?:string;direction?:string;page?:string}>}){
  const {id,tableId}=await params; const search=await searchParams; const user=await getCurrentUser(); if(!user)redirect(`/login?next=${encodeURIComponent(`/clubs/manage/${id}/tables/${tableId}`)}`);
  const db=await createServerClient(); const access=await db.rpc("can_manage_club",{p_club_id:id}); if(!access.data)redirect("/clubs/manage");
  const [club,table,rows]=await Promise.all([db.from("clubs").select("id,name").eq("id",id).maybeSingle(),db.from("club_custom_tables").select("*").eq("id",tableId).eq("club_id",id).maybeSingle(),db.from("club_custom_table_rows").select("*").eq("table_id",tableId).order("created_at",{ascending:false}).limit(1000)]);
  if(!club.data||!table.data)notFound(); const columns=table.data.columns; const query=(search.q??"").normalize("NFKC").trim().slice(0,80).toLocaleLowerCase(); const sort=search.sort==="created_at"||columns.some(column=>column.key===search.sort)?search.sort??"created_at":"created_at"; const direction=search.direction==="asc"?"asc":"desc";
  const filtered=(rows.data??[]).filter(row=>!query||Object.values(row.data).some(value=>String(value).toLocaleLowerCase().includes(query))).sort((a,b)=>compare(a,b,sort,direction)); const page=Math.max(1,Number.parseInt(search.page??"1",10)||1); const pageRows=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE); const queryParams={q:search.q??"",sort,direction};
  return <div className="mx-auto max-w-7xl space-y-7 px-5 py-8 text-ink">
    <header><Link href={`/clubs/manage/${id}/tables`} className="text-sm font-semibold text-powder">← {club.data.name} tables</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-bold">{table.data.name}</h1><p className="mt-2 text-muted">{table.data.description||"Custom Club data table"}</p><p className="mt-1 text-xs text-muted">{columns.length} columns · {rows.data?.length??0}{rows.data?.length===1000?"+":""} loaded rows · updated {new Date(table.data.updated_at).toLocaleString("en-US")}</p></div><div className="flex flex-wrap gap-2"><a href={`/clubs/manage/${id}/tables/${tableId}/export`} className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-bold">Export CSV</a></div></div></header>

    <details className="rounded-card border border-line bg-card p-6 shadow-sm" open={!rows.data?.length}><summary className="cursor-pointer text-xl font-bold">Add a row</summary><ActionFeedbackForm action={addCustomTableRow} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><input type="hidden" name="club_id" value={id}/><input type="hidden" name="table_id" value={tableId}/>{columns.map(column=><CellInput key={column.key} column={column}/>)}<button className="h-11 self-end rounded-full bg-navy px-5 font-bold text-cream">Add row</button></ActionFeedbackForm></details>

    <section className="rounded-card border border-line bg-card p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Online data</h2><p className="text-xs text-muted">Search, sort, edit and paginate the latest 1,000 rows.</p></div><form className="flex flex-wrap gap-2"><input name="q" defaultValue={search.q??""} maxLength={80} placeholder="Search all columns" className={input}/><select name="sort" defaultValue={sort} className={input}><option value="created_at">Recorded time</option>{columns.map(column=><option key={column.key} value={column.key}>{column.label}</option>)}</select><select name="direction" defaultValue={direction} className={input}><option value="desc">Descending</option><option value="asc">Ascending</option></select><button className="h-11 rounded-full bg-navy px-5 text-sm font-bold text-cream">Apply</button></form></div>
      {rows.error?<p role="alert" className="mt-4 text-orange">Rows could not be loaded.</p>:pageRows.length?<div className="mt-4 overflow-x-auto"><table className="w-full min-w-max text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase text-muted"><th className="px-3 py-3">Recorded</th>{columns.map(column=><th key={column.key} className="px-3 py-3">{column.label}</th>)}<th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-line">{pageRows.map(row=><tr key={row.id}><td className="whitespace-nowrap px-3 py-3 text-muted">{new Date(row.created_at).toLocaleString("en-US")}{row.updated_by?<span className="block text-[10px]">edited</span>:null}</td>{columns.map(column=><td key={column.key} className="max-w-80 break-words px-3 py-3">{display(column,row.data[column.key])}</td>)}<td className="px-3 py-3"><details><summary className="cursor-pointer text-xs font-bold text-navy">Edit</summary><ActionFeedbackForm action={updateCustomTableRow} className="mt-3 grid w-[min(80vw,620px)] gap-3 rounded-control border border-line bg-card p-4 sm:grid-cols-2"><input type="hidden" name="club_id" value={id}/><input type="hidden" name="table_id" value={tableId}/><input type="hidden" name="row_id" value={row.id}/>{columns.map(column=><CellInput key={column.key} column={column} value={row.data[column.key]}/>)}<button className="h-10 rounded-full bg-navy px-4 text-sm font-bold text-cream">Save changes</button></ActionFeedbackForm><ActionFeedbackForm action={deleteCustomTableRow} className="mt-2 flex items-center gap-2"><input type="hidden" name="club_id" value={id}/><input type="hidden" name="table_id" value={tableId}/><input type="hidden" name="row_id" value={row.id}/><label className="text-xs text-muted"><input type="checkbox" name="confirm" value="yes" required/> Confirm</label><button className="text-xs font-bold text-orange">Delete row</button></ActionFeedbackForm></details></td></tr>)}</tbody></table></div>:<p className="mt-4 text-muted">{query?"No rows match this search.":"No rows yet."}</p>}
      <Pagination basePath={`/clubs/manage/${id}/tables/${tableId}`} page={page} total={filtered.length} pageSize={PAGE_SIZE} query={queryParams}/>
    </section>

    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-card border border-line bg-card p-6"><h2 className="text-xl font-bold">Import CSV</h2><p className="mt-2 text-sm text-muted">Headers may use column names or internal keys. The import validates every row before adding anything; maximum 500 rows and 1 MB.</p><ActionFeedbackForm action={importCustomTableCsv} className="mt-4 grid gap-3"><input type="hidden" name="club_id" value={id}/><input type="hidden" name="table_id" value={tableId}/><input type="file" name="csv" accept=".csv,text/csv" required/><button className="h-10 rounded-full bg-navy px-5 text-sm font-bold text-cream">Import rows</button></ActionFeedbackForm></section><section className="rounded-card border border-line bg-card p-6"><h2 className="text-xl font-bold">Duplicate structure</h2><p className="mt-2 text-sm text-muted">Create a blank table with the same columns and validation settings.</p><ActionFeedbackForm action={duplicateCustomTable} className="mt-4 grid gap-3"><input type="hidden" name="club_id" value={id}/><input type="hidden" name="table_id" value={tableId}/><input name="name" required minLength={2} maxLength={80} defaultValue={`${table.data.name} copy`} className={input}/><button className="h-10 rounded-full border border-line px-5 text-sm font-bold">Duplicate table</button></ActionFeedbackForm></section></div>

    <details className="rounded-card border border-line bg-card p-6"><summary className="cursor-pointer text-xl font-bold">Table settings &amp; columns</summary><TableBuilder clubId={id} table={table.data}/></details>
  </div>;
}
