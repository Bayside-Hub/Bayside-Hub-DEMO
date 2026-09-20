import { getCurrentUser } from "@/lib/auth";
import { getSiteText, siteContentSections } from "@/lib/site-content";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SiteTextForm from "./form";

export default async function SiteEditorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manage/site");
  const db = await createServerClient();
  const { data: allowed } = await db.rpc("has_custom_permission", { p_permission: "site.manage" });
  if (!["staff", "admin"].includes(user.role) && !allowed) return <p className="p-8">An administrator must grant you public content editing permission.</p>;
  const { data: cmsMarker, error } = await db.from("site_content").select("key").eq("key", "site_name").maybeSingle();
  const text = await getSiteText();
  return <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 text-ink"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-powder">Administration</p><h1 className="mt-2 text-3xl font-bold">Public content</h1><p className="mt-2 max-w-3xl text-muted">Manage the main public copy without a code deployment. Changes are audited and published immediately. Text is public; never enter student or staff private information.</p></div>{error || !cmsMarker ? <p role="alert" className="rounded-card border border-orange/40 bg-card p-5">Apply <code>site_cms_content.sql</code> and the earlier content migrations before using this editor.</p> : siteContentSections.map(section => <section key={section.title} aria-labelledby={`section-${section.title.replaceAll(" ", "-").toLowerCase()}`}><div className="mb-4"><h2 id={`section-${section.title.replaceAll(" ", "-").toLowerCase()}`} className="text-xl font-bold">{section.title}</h2><p className="mt-1 text-sm text-muted">{section.description}</p></div><div className="grid gap-4 lg:grid-cols-2">{section.fields.map(field => <SiteTextForm key={field.key} field={field.key} value={text[field.key]} label={field.label} help={field.help} rows={field.rows} optional={field.optional} />)}</div></section>)}</div>;
}
