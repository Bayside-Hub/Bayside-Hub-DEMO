import {
  AnnouncementCard,
  ClubCard,
  EventCard,
  PrimaryButton,
  SectionHeader,
} from "@/components/cards";
import Link from "next/link";
import HomeNav from "@/components/home-nav";
import { getAnnouncements } from "@/lib/announcements";
import { getAllClubs } from "@/lib/clubs";
import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import { getOpportunities } from "@/lib/opportunities";
import { getCurrentUser } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/student-dashboard";

export default async function Home() {
  const [user, dashboard, announcements, clubs, events, opportunities] = await Promise.all([
    getCurrentUser(),
    getStudentDashboard(),
    getAnnouncements(1),
    getAllClubs(),
    getEvents(),
    getOpportunities(),
  ]);
  const [featured] = announcements;
  const upcomingEvents = events.filter((event) => isEventUpcoming(event));
  return (
    <div className="theme-dark min-h-full bg-content-bg">
      <HomeNav user={user} />

      <section className="relative overflow-hidden bg-black">
        <div className="hero-blobs pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute left-[8%] top-[18%] h-[300px] w-[520px]"
            style={{ background: "#4772AA" }}
          />
          <div
            className="absolute left-[38%] top-[42%] h-[350px] w-[386px] rounded-full"
            style={{ background: "#589AEF" }}
          />
          <div
            className="absolute left-[14%] top-[52%] h-[294px] w-[294px]"
            style={{ background: "#FF8E68" }}
          />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-6 pb-24 pt-20 sm:pt-28">
          <p className="font-display text-3xl font-bold tracking-wide text-cream sm:text-5xl lg:text-[61px] lg:leading-[75px]">
            {user ? (
              <>Welcome, <span className="font-normal italic">{user.name}</span></>
            ) : (
              "Welcome to Bayside Hub"
            )}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[1.05] tracking-wide text-cream sm:text-7xl lg:text-[96px] xl:text-[105px] xl:leading-[131px]">
            Anchored in Excellence
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-cream lg:text-2xl lg:leading-[30px]">
            Welcome to Bayside Hub! Bayside Hub offers our students to
            discover different activities, opportunities, and clubs, all in
            one place. Browse around to start exploring!
          </p>
          <div className="mt-10">
            <PrimaryButton
              href="/clubs"
              className="h-16 px-14 text-lg"
            >
              Explore
            </PrimaryButton>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {user && dashboard ? (
          <section className="mb-10" aria-labelledby="your-hub-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="your-hub-title" className="font-display text-2xl font-bold uppercase text-cream">Your Hub</h2>
                <p className="mt-1 text-sm text-muted">Your memberships, requests, and next actions in one place.</p>
              </div>
              <PrimaryButton href="/profile">View profile</PrimaryButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard label="Joined clubs" value={dashboard.activeClubs.length} href="/profile" />
              <DashboardCard label="Pending joins" value={dashboard.pendingMemberships} href="/profile" />
              <DashboardCard label="Club applications" value={dashboard.pendingApplications} href="/profile" />
              <DashboardCard label="Open support requests" value={dashboard.openSupportRequests} href="/support" />
            </div>
            {dashboard.activeClubs.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {dashboard.activeClubs.slice(0, 5).map((club) => (
                  <PrimaryButton key={club.id} href={`/clubs/${club.slug}`}>{club.name}</PrimaryButton>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
        <section className="mt-2">
          <SectionHeader
            title="Announcements"
            subtitle="Browse daily announcements and check for new updates!"
            href="/announcements"
            linkLabel="VIEW ALL"
          />
          {featured ? (
            <AnnouncementCard a={featured} />
          ) : (
            <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-10 text-center text-sm text-muted">
              No current announcements. Check back soon for school updates.
            </p>
          )}
        </section>

        <section className="mt-10">
          <SectionHeader title="Opportunities" subtitle="Deadlines, programs, service, and student offers." href="/opportunities" linkLabel="VIEW ALL" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.slice(0, 3).map((opportunity) => (
              <article key={opportunity.id} className="card-gradient rounded-[10px] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-orange">{opportunity.type}</p>
                <h3 className="mt-2 font-display text-lg font-bold uppercase text-cream">{opportunity.title}</h3>
                <p className="mt-2 text-sm text-cream/70">{opportunity.date}</p>
                <PrimaryButton href={`/opportunities/${opportunity.id}`} className="mt-4">Learn more</PrimaryButton>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader
            title="Clubs"
            subtitle={`Explore ${clubs.length} currently listed club${clubs.length === 1 ? "" : "s"}. More clubs are being added.`}
            href="/clubs"
            linkLabel="VIEW ALL"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.slice(0, 3).map((club) => (
              <ClubCard key={club.slug} club={club} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader
            title="Events"
            subtitle="Bayside hosts fun, engaging events for students to enjoy. Check out the date, time, location, and price."
            href="/calendar"
            linkLabel="VIEW ALL"
          />
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-dashed border-line bg-card/60 px-6 py-10 text-center text-sm text-muted">
              No upcoming events have been published yet.
            </p>
          )}
        </section>

        <section className="mt-10">
          <SectionHeader
            title="Spirit Week"
            subtitle="Spirit Week is a time to show off our SCHOOL SPIRIT! Each day of the week is filled with something different."
            href="/spirit-week"
            linkLabel="VIEW ALL"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {spiritDays.map((d) => (
              <div
                key={d.day}
                className={`flex flex-col justify-between rounded-card p-5 shadow-sm ${d.color}`}
              >
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {d.day}
                </span>
                <span className="mt-3 font-display text-base font-bold leading-snug">
                  {d.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card-gradient rounded-[10px] p-5 transition-transform hover:-translate-y-0.5">
      <p className="text-sm text-cream/70">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-cream">{value}</p>
    </Link>
  );
}

const spiritDays = [
  { day: "Monday", name: "Pajama Day", color: "bg-navy text-cream" },
  { day: "Tuesday", name: "Twin Day", color: "bg-peach text-black" },
  { day: "Wednesday", name: "Dress Like a Teacher Day", color: "bg-orange text-black" },
  { day: "Thursday", name: "Class Color Day", color: "bg-cream text-navy" },
  { day: "Friday", name: "Blue & Gold Day", color: "bg-navy text-cream" },
];
