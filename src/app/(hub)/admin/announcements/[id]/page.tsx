import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import EditAnnouncementForm from "./edit-form";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;
  const supabase = await createServerClient();
  const [{ data: initial, error: announcementError }, { data: draft }, { data: versions }] = await Promise.all([
    supabase.from("announcements").select("id, title, tag, body, publish_at").eq("id", id).maybeSingle(),
    supabase.from("announcement_drafts").select("*").eq("user_id", user.id).eq("draft_key", id).maybeSingle(),
    supabase.from("announcement_versions").select("*").eq("announcement_id", id).order("version_number", { ascending: false }).limit(15),
  ]);
  const data = announcementError?.code === "42703" ? (await supabase.from("announcements").select("id,title,tag,body").eq("id", id).maybeSingle()).data : initial;
  if (!data) notFound();
  return <div className="mx-auto w-full max-w-3xl px-6 py-8"><Link href="/admin/announcements" className="text-sm font-semibold text-navy">← Announcements</Link><h1 className="my-6 text-3xl font-bold text-ink">Edit announcement</h1><section className="rounded-card border border-black/5 bg-card p-6 shadow-sm"><EditAnnouncementForm announcement={data} draft={draft} versions={versions ?? []} /></section></div>;
}
