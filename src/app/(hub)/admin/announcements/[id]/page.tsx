import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import EditAnnouncementForm from "./edit-form";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.from("announcements").select("id, title, tag, body").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <div className="mx-auto w-full max-w-3xl px-6 py-8"><Link href="/admin/announcements" className="text-sm font-semibold text-navy">← Announcements</Link><h1 className="my-6 text-3xl font-bold text-ink">Edit announcement</h1><section className="rounded-card border border-black/5 bg-card p-6 shadow-sm"><EditAnnouncementForm announcement={data} /></section></div>;
}
