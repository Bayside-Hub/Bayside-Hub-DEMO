import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { clubCompleteness } from "@/lib/club-completeness";

export default async function ManageClubsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/clubs/manage");
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-4xl px-6 py-8"><PageHeader title="Manage clubs" subtitle="Apply the core platform migration to enable club management." /></div>;
  const supabase = await createServerClient();
  let clubIds: string[] | null = null;
  if (user.role === "advisor") {
    const { data } = await supabase.from("club_advisors").select("club_id").eq("profile_id", user.id);
    clubIds = (data ?? []).map((row) => row.club_id);
  } else if (!["staff", "admin"].includes(user.role)) {
    const { data } = await supabase.from("club_officers").select("club_id").eq("profile_id", user.id);
    clubIds = (data ?? []).map((row) => row.club_id);
  }
  const query = supabase.from("clubs").select("id, slug, name, short_description, interest_tags, contact_email, google_classroom_code, active_start_date, active_end_date, status").order("name");
  const { data: clubs } = clubIds ? (clubIds.length ? await query.in("id", clubIds) : { data: [] }) : await query;
  return <div className="mx-auto w-full max-w-6xl px-6 py-8"><PageHeader title="Manage clubs" subtitle="Update assigned clubs, meetings, announcements, and membership requests." />{clubs?.length ? <div className="grid gap-4 sm:grid-cols-2">{clubs.map((club) => { const completeness = clubCompleteness(club); return <article key={club.id} className="rounded-card border border-line bg-card p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase text-muted">{club.status}</p><span className={`text-xs font-semibold ${completeness < 70 ? "text-orange" : "text-powder"}`}>{completeness}% complete</span></div><h2 className="mt-1 text-xl font-bold text-ink">{club.name}</h2><p className="mt-2 line-clamp-2 text-sm text-muted">{club.short_description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-content-bg" aria-label={`Profile ${completeness}% complete`}><div className="h-full rounded-full bg-powder" style={{ width: `${completeness}%` }} /></div><Link href={`/clubs/manage/${club.id}`} className="mt-4 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream">Manage</Link></article>; })}</div> : <p className="rounded-card border border-dashed border-line p-8 text-center text-muted">No clubs are assigned to you.</p>}</div>;
}
