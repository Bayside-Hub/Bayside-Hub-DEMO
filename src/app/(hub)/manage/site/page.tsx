import { getCurrentUser } from "@/lib/auth";
import { getSiteText } from "@/lib/site-content";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SiteTextForm from "./form";

export default async function SiteEditorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manage/site");
  const db = await createServerClient();
  const { data: allowed } = await db.rpc("has_custom_permission", { p_permission: "site.manage" });
  if (user.role !== "admin" && !allowed) return <p className="p-8">An administrator must grant you site text editing permission.</p>;
  const { error } = await db.from("site_content").select("key").limit(1);
  const text = await getSiteText();
  return <div className="mx-auto max-w-4xl space-y-5 px-5 py-8 text-ink"><h1 className="text-3xl font-bold">Public content</h1><p className="text-muted">Edit page introductions, Support FAQs, the Help Guide, and footer text. FAQ lines use <code>Question || Answer</code>. Text is public; do not enter private information.</p>{error ? <p role="alert">Apply <code>editable_support_content.sql</code> before using this editor.</p> : Object.entries(text).map(([key, value]) => <SiteTextForm key={key} field={key} value={value} />)}</div>;
}
