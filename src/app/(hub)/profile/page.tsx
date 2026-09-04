import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { leaveClub } from "@/app/(hub)/clubs/actions";
import { getCurrentUser } from "@/lib/auth";
import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import type { ClubApplicationRow } from "@/lib/supabase/types";

type ProfileClub = {
  id: string;
  slug: string;
  name: string;
  status: "pending" | "active";
  requestedAt: string;
  role: string;
  meetingDay: string;
  location: string;
};

export const metadata: Metadata = { title: "Profile" };

const dayNames = ["", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts.at(-1)?.[0] ?? "" : ""}`.toUpperCase();
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(value));
}

async function getProfileData(userId: string) {
  if (!isSupabaseConfigured()) return { clubs: [] as ProfileClub[], applications: [] as ClubApplicationRow[] };
  const supabase = await createServerClient();
  const [membershipResult, officerResult, advisorResult, meetingResult, applicationsResult] = await Promise.all([
    supabase.from("club_memberships").select("club_id, status, requested_at").eq("profile_id", userId).in("status", ["pending", "active"]),
    supabase.from("club_officers").select("club_id, title").eq("profile_id", userId),
    supabase.from("club_advisors").select("club_id").eq("profile_id", userId),
    supabase.from("club_meetings").select("club_id, day_of_week, location").order("day_of_week"),
    supabase.from("club_applications").select("id, club_name, category, description, meeting_days, contact_email, submitted_by, status, created_at, reviewed_at, reviewed_by").eq("submitted_by", userId).order("created_at", { ascending: false }).limit(3),
  ]);
  const memberships = membershipResult.data ?? [];
  const clubIds = [...new Set(memberships.map((row) => row.club_id))];
  const clubResult = clubIds.length
    ? await supabase.from("clubs").select("id, slug, name").in("id", clubIds)
    : { data: [] as { id: string; slug: string; name: string }[] };
  const clubsById = new Map((clubResult.data ?? []).map((club) => [club.id, club]));
  const roles = new Map((officerResult.data ?? []).map((row) => [row.club_id, row.title]));
  const advised = new Set((advisorResult.data ?? []).map((row) => row.club_id));
  const meetings = new Map((meetingResult.data ?? []).map((row) => [row.club_id, row]));

  return {
    clubs: memberships.flatMap((membership) => {
      const club = clubsById.get(membership.club_id);
      if (!club) return [];
      const meeting = meetings.get(club.id);
      return [{
        ...club,
        status: membership.status as "pending" | "active",
        requestedAt: membership.requested_at,
        role: roles.get(club.id) ?? (advised.has(club.id) ? "Advisor" : "Member"),
        meetingDay: meeting ? dayNames[meeting.day_of_week] : "Schedule TBA",
        location: meeting?.location ?? "Location TBA",
      }];
    }),
    applications: applicationsResult.data ?? [],
  };
}

function SectionTitle({ children, detail }: { children: React.ReactNode; detail: string }) {
  return <div className="text-center"><h2 className="text-base font-bold tracking-wide text-[#f0ebe5] sm:text-xl">{children}</h2><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#97b4de]">{detail}</p></div>;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const [{ clubs, applications }, allEvents] = await Promise.all([getProfileData(user.id), getEvents()]);
  const activeClubs = clubs.filter((club) => club.status === "active");
  const upcomingEvents = allEvents.filter((event) => isEventUpcoming(event)).slice(0, 2);
  const roleLabel = user.role === "student" ? "Student account" : `${user.role} account`;

  return (
    <div className="profile-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#2a2829] font-sans text-[#2a2829]">
      <div className="mx-auto flex min-h-full w-full max-w-[1920px] flex-col px-4 py-5 sm:px-8 lg:px-[3.125%]">
        <nav className="flex items-center justify-between" aria-label="Profile navigation"><Link href="/" className="text-xs font-bold text-[#97b4de] hover:text-[#f0ebe5]">&lt; DASHBOARD</Link><div className="flex size-10 items-center justify-center rounded-full bg-[#263a99] text-[10px] font-medium text-[#f0ebe5]">{initials(user.name)}</div></nav>

        <header className="mt-6 grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_200px_434px]">
          <div className="relative h-40 overflow-hidden rounded-[20px] border-4 border-[#f0ebe5] sm:h-52 lg:h-[279px]"><Image src="/profile/keep-going.jpeg" alt="Hand-painted stars encouraging students to keep going" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" /></div>
          <div className="mx-auto flex size-36 items-center justify-center rounded-full border-4 border-[#f0ebe5] bg-[#97b4de] text-4xl font-bold text-[#263a99] sm:size-[200px] sm:text-5xl">{initials(user.name)}</div>
          <div className="text-center lg:text-left"><p className="text-lg font-bold uppercase text-[#97b4de] sm:text-2xl">{roleLabel}</p><h1 className="mt-1 break-words text-4xl font-bold leading-none text-[#f0ebe5] sm:text-[52px]">{user.name}</h1><p className="mt-3 text-sm text-[#dcd0be] sm:text-xl">Bayside High School · NYC Public Schools</p></div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.73fr)_minmax(360px,1fr)]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-[14px] bg-[#f0ebe5]/95 p-5 sm:p-6">
              <h2 className="text-sm font-bold text-[#263a99] sm:text-base">STUDENT INFORMATION</h2>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.7fr_1fr_auto] lg:items-end">
                <div><dt className="text-[10px] font-medium text-[#263a99]">FULL NAME</dt><dd className="mt-2 text-sm font-semibold uppercase">{user.name}</dd></div>
                <div className="min-w-0"><dt className="text-[10px] font-medium text-[#263a99]">SCHOOL EMAIL</dt><dd className="mt-2 truncate text-sm font-semibold">{user.email}</dd></div>
                <div><dt className="text-[10px] font-medium text-[#263a99]">ACCESS ROLE</dt><dd className="mt-2 text-sm font-semibold uppercase">{user.role}</dd></div>
                <form action="/auth/signout" method="post"><button className="h-10 rounded-full bg-[#263a99] px-7 text-[11px] font-bold text-[#f0ebe5] hover:bg-[#1d2f7e]">SIGN OUT</button></form>
              </dl>
            </section>

            <SectionTitle detail={`${activeClubs.length} active`}>MY ENROLLED CLUBS</SectionTitle>
            {activeClubs.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{activeClubs.map((club, index) => (
              <article key={club.id} className="flex min-h-56 flex-col rounded-xl bg-[#dcd0be]/95 p-[18px]">
                <div className={`size-12 rounded-[14px] ${index % 2 ? "bg-[#97b4de]" : "bg-[#263a99]"}`} /><h3 className="mt-3 text-base font-bold uppercase">{club.name}</h3><p className="mt-1 text-xs font-medium text-[#263a99]">{club.role}</p><p className="mt-2 text-[10px] font-medium uppercase">{club.meetingDay} · {club.location}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4 text-[10px] font-medium text-[#263a99]"><Link href={`/clubs/${club.slug}`} className="rounded-full bg-[#e8e1d8] px-4 py-2">PROFILE</Link><Link href="/calendar" className="rounded-full bg-[#e8e1d8] px-4 py-2">CALENDAR</Link><form action={leaveClub}><input type="hidden" name="club_id" value={club.id} /><input type="hidden" name="slug" value={club.slug} /><button className="rounded-full bg-[#e8e1d8] px-4 py-2">LEAVE</button></form></div><p className="mt-3 text-right text-[9px] font-medium uppercase">Joined {dateLabel(club.requestedAt)}</p>
              </article>
            ))}</div> : <div className="rounded-xl border border-dashed border-[#f0ebe5]/40 p-8 text-center text-sm text-[#dcd0be]">No active clubs yet. <Link href="/clubs" className="font-bold text-[#97b4de]">Browse clubs</Link></div>}

            <SectionTitle detail="Application history ↓">RECENT ACTIVITY</SectionTitle>
            <div className="space-y-2">{applications.length ? applications.map((application, index) => (
              <div key={application.id} className="flex items-center gap-3 rounded-[10px] bg-[#f0ebe5] p-3"><div className={`size-8 shrink-0 rounded-full ${index % 2 ? "bg-[#97b4de]" : "bg-[#263a99]"}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Applied for {application.club_name}</p><p className="mt-1 text-[10px] font-medium text-[#263a99]">{application.category} · {dateLabel(application.created_at)}</p></div><span className="text-[10px] font-bold uppercase text-[#263a99]">{application.status}</span></div>
            )) : <div className="rounded-[10px] bg-[#f0ebe5] p-5 text-center text-xs">No recent applications.</div>}</div>
          </main>

          <aside className="min-w-0 space-y-5">
            <section className="rounded-[14px] bg-[#dcd0be] p-[22px]"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">UPCOMING EVENTS</h2><Link href="/calendar" className="text-[10px] font-bold text-[#263a99]">VIEW ALL</Link></div><div className="mt-3 space-y-2">{upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="flex items-center gap-3 rounded-[10px] bg-[#f0ebe5] p-3 hover:bg-white"><span className="w-14 text-[10px] font-bold uppercase text-[#263a99]">{event.date.split(",").at(-1)?.trim() ?? event.date}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{event.title}</strong><small className="mt-1 block truncate text-[10px] font-medium text-[#263a99]">{event.time} · {event.location}</small></span><span className="text-xl font-bold text-[#263a99]">+</span></Link>
            ))}</div></section>
            <div className="relative h-40 overflow-hidden rounded-2xl border-4 border-[#f0ebe5] sm:h-[167px]"><Image src="/profile/hope-happy.jpeg" alt="Hand-painted stars wishing students happiness" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 35vw" /></div>
            <section className="rounded-[14px] bg-[#dcd0be] p-[22px]"><h2 className="text-xl font-bold">ACCOUNT LINKS</h2><div className="mt-3 grid gap-2 sm:grid-cols-3"><Link href="/clubs" className="flex min-h-24 flex-col items-center justify-center rounded-xl bg-[#263a99] p-3 text-center text-[#f0ebe5]"><span className="text-[10px] font-medium">CLUB DIRECTORY</span><span className="mt-2 text-lg">✦</span></Link><Link href="/support" className="flex min-h-24 flex-col items-center justify-center rounded-xl bg-[#97b4de] p-3 text-center"><span className="text-lg">✦</span><span className="mt-2 text-[10px] font-medium">SUPPORT</span></Link><Link href="/clubs/manage" className="flex min-h-24 flex-col items-center justify-center rounded-xl bg-[#263a99] p-3 text-center text-[#f0ebe5]"><span className="text-[10px] font-medium">MANAGE CLUBS</span><span className="mt-2 text-lg">✦</span></Link></div></section>
            <Link href="/announcements" className="flex items-center justify-between rounded-xl bg-white p-4 text-[11px] font-bold hover:bg-[#f0ebe5]"><span>CLUB ANNOUNCEMENTS</span><span className="text-lg text-[#263a99]" aria-hidden>→</span></Link>
          </aside>
        </div>
        <footer className="mt-10 flex items-center gap-5 pb-1 text-[10px] font-medium text-[#f0ebe5]"><span>PROFILE</span><span className="h-px flex-1 bg-[#f0ebe5]" /><span className="text-[#dcd0be]">{user.name.toUpperCase()}</span></footer>
      </div>
    </div>
  );
}
