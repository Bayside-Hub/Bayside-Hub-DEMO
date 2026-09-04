import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PrimaryButton } from "@/components/cards";
import { clubs } from "@/lib/data";
import { getClubBySlug } from "@/lib/clubs";
import { getCurrentUser } from "@/lib/auth";
import {
  getClubInterestInfo,
  getClubCommunication,
  getClubMembershipInfo,
  leaveClub,
  requestClubMembership,
  toggleClubInterest,
} from "../actions";
import PendingSubmitButton from "@/components/pending-submit-button";
import type { Metadata } from "next";
import ClubChat from "./club-chat";

// Membership controls and private chat depend on the request's auth cookies.
// Never reuse a build-time guest version of a Club page for signed-in users.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return clubs.map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  return club ? { title: club.name, description: club.description } : { title: "Club not found" };
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();
  const user = await getCurrentUser();
  const isApprovedCharter = club.officers.length === 0;
  const interest = await getClubInterestInfo(club.slug);
  const membership = await getClubMembershipInfo(club.id);
  const communication = await getClubCommunication(club.id);
  const commitmentLabel = club.commitment > 0
    ? `About ${club.commitment} hour${club.commitment === 1 ? "" : "s"}/week`
    : "Flexible commitment";

  return (
    <div className="club-detail-backdrop mx-auto min-h-full w-full max-w-[1920px] px-5 py-8 text-cream sm:px-8 lg:px-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[#dcd0be]/70">
        <Link href="/clubs" className="font-medium text-powder hover:text-cream">
          Activities &amp; Clubs
        </Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-ink">{club.name}</span>
      </nav>

      <section className="grid min-h-[360px] gap-8 overflow-hidden rounded-[22px] border border-[#97b4de] bg-[#f0ebe5]/95 p-6 text-[#2a2829] lg:grid-cols-[210px_minmax(0,1fr)_280px] lg:items-center lg:p-10">
        <div className="mx-auto flex size-[170px] flex-col items-center justify-center rounded-full border border-[#2a2829] bg-[#97b4de]"><span className="text-6xl font-bold text-[#263a99]">{club.name[0]}</span><span className="mt-2 text-[10px] font-bold uppercase">{club.name}</span></div>
        <div>
          <p className="text-sm">{club.category} · {club.meetingDate}</p>
          <h1 className="mt-2 font-display text-5xl font-bold uppercase leading-none sm:text-6xl">{club.name}</h1>
          <p className="mt-4 max-w-4xl text-sm font-medium leading-6">{club.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#2a2829] px-3 py-1.5">{club.meetingDays.join(", ")}</span>
          <span className="rounded-full border border-[#2a2829] px-3 py-1.5">{club.meetingTime}</span>
          <span className="rounded-full border border-[#2a2829] px-3 py-1.5">{club.location}</span>
          {club.communityService && (
            <span className="rounded-full bg-[#f78660] px-3 py-1.5 font-semibold text-black">
              Community Service
            </span>
          )}
          </div>
        </div>
        <div>
          {user ? (
            <PrimaryButton href="/calendar" className="w-full bg-[#97b4de]">Meeting dates →</PrimaryButton>
          ) : (
            <PrimaryButton href={`/login?next=${encodeURIComponent(`/clubs/${club.slug}`)}`} className="w-full bg-[#97b4de]">Sign in to Join</PrimaryButton>
          )}
          {membership.available && user && club.id && (
            <form action={membership.status === "active" || membership.status === "pending" ? leaveClub : requestClubMembership} className="mt-3">
              <input type="hidden" name="club_id" value={club.id} />
              <input type="hidden" name="slug" value={club.slug} />
              <PendingSubmitButton
                pendingLabel="Saving…"
                className="inline-flex h-10 w-full items-center justify-center rounded-[22px] bg-[#f78660] px-6 text-sm font-semibold text-black hover:bg-[#ff9b78]"
              >
                {membership.status === "active"
                  ? "Leave club"
                  : membership.status === "pending"
                    ? "Cancel join request"
                    : club.joinPolicy === "instant"
                      ? "Join club"
                      : "Request to join"}
              </PendingSubmitButton>
            </form>
          )}
          {interest.available && user && (
            <form action={toggleClubInterest} className="mt-3">
              <input type="hidden" name="slug" value={club.slug} />
              <PendingSubmitButton
                pendingLabel="Saving…"
                  className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-[22px] border border-[#2a2829] bg-white px-6 text-sm font-semibold ${
                  interest.joined
                    ? "text-[#263a99]"
                    : "text-[#2a2829]"
                }`}
              >
                {interest.joined ? "★ Interested" : "☆ I'm interested"}
                <span className="text-xs text-muted">({interest.count})</span>
              </PendingSubmitButton>
            </form>
          )}
          {user && membership.status === "active" ? (
            <p role="status" className="mt-3 rounded-control bg-[#97b4de]/25 px-4 py-3 text-xs font-medium text-[#263a99]">
              You&apos;ve joined this club. Meeting details are below and the club now appears in your profile.
            </p>
          ) : user && membership.status === "pending" ? (
            <p role="status" className="mt-3 rounded-control bg-[#f78660]/20 px-4 py-3 text-xs font-medium text-[#2a2829]">
              Your join request is waiting for club approval. You can track it from your profile.
            </p>
          ) : null}
          <p className="mt-3 text-xs text-[#2a2829]/70">
            {user
              ? club.joinPolicy === "instant"
                ? "Open membership · joining is instant. You can also drop by a meeting first."
                : "Membership requires club approval. You can still drop by a meeting first."
              : `${club.joinPolicy === "instant" ? "Open membership · join instantly" : "Approval required"}. Sign in with your NYC student account to continue.`}
          </p>
        </div>
      </section>

      {(club.advisors?.length || club.contactEmail || club.googleClassroomCode) && (
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {club.advisors?.length ? (
            <div className="card-gradient rounded-[10px] p-5">
              <h2 className="font-display text-lg font-bold uppercase text-cream">Advisors</h2>
              {club.advisors.map((advisor) => <p key={`${advisor.name}-${advisor.email ?? ""}`} className="mt-2 text-sm text-cream/75">{advisor.name}{advisor.email ? ` · ${advisor.email}` : ""}</p>)}
            </div>
          ) : null}
          {club.contactEmail && (
            <div className="card-gradient rounded-[10px] p-5">
              <h2 className="font-display text-lg font-bold uppercase text-cream">Contact</h2>
              <a href={`mailto:${club.contactEmail}`} className="mt-2 block break-all text-sm text-powder hover:text-cream">{club.contactEmail}</a>
            </div>
          )}
          {club.googleClassroomCode && (
            <div className="card-gradient rounded-[10px] p-5">
              <h2 className="font-display text-lg font-bold uppercase text-cream">Google Classroom</h2>
              <p className="mt-2 font-mono text-sm text-cream/75">{club.googleClassroomCode}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-12" aria-labelledby="club-stream-title">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-powder">Class stream</p>
        <h2 id="club-stream-title" className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-cream">Club announcements</h2>
        <p className="mt-2 max-w-2xl text-sm text-cream/60">Official updates from the Club board and Advisor.</p>
        {club.announcements?.length ? (
          <div className="mt-5 space-y-4">
            {club.announcements.map((announcement) => (
              <article key={announcement.id} className="card-gradient rounded-[14px] border border-white/10 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold uppercase text-cream">{announcement.title}</h3>
                  <time dateTime={announcement.date} className="text-xs text-cream/45">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(announcement.date))}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-cream/75">{announcement.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-[14px] border border-dashed border-white/15 px-5 py-8 text-center text-sm text-cream/50">No Club announcements yet.</p>
        )}
      </section>

      {communication.available && club.id ? (
        <ClubChat clubId={club.id} slug={club.slug} messages={communication.messages} />
      ) : user && club.id ? (
        <section className="mt-12 rounded-[18px] border border-dashed border-white/15 p-6 text-center">
          <h2 className="font-display text-xl font-semibold uppercase text-cream">Member chat</h2>
          <p className="mt-2 text-sm text-cream/55">Join this Club and receive approval to access its private conversation.</p>
        </section>
      ) : null}

      {club.media?.some((item) => item.type === "image") ? (
        <section className="mt-12" aria-labelledby="club-gallery-title">
          <h2 id="club-gallery-title" className="font-display text-3xl font-semibold uppercase tracking-wide text-cream">Photo gallery</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {club.media.filter((item) => item.type === "image").map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-[10px] border border-line bg-card">
                <Image
                  src={item.path}
                  alt={item.alt ?? ""}
                  width={640}
                  height={480}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                {item.title ? <figcaption className="px-4 py-3 text-sm font-semibold text-ink">{item.title}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-gradient rounded-[10px] p-6">
          <h2 className="font-display text-xl font-bold uppercase text-cream">Meeting Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 font-semibold text-cream">Date:</dt>
              <dd className="text-cream/75">{club.meetingDate}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 font-semibold text-cream">Time:</dt>
              <dd className="text-cream/75">{club.meetingTime}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 font-semibold text-cream">Location:</dt>
              <dd className="text-cream/75">{club.location}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 font-semibold text-cream">Description:</dt>
              <dd className="leading-6 text-cream/75">{club.description}</dd>
            </div>
          </dl>
        </div>

        <aside className="card-gradient rounded-[10px] p-6">
          <h2 className="font-display text-xl font-bold uppercase text-cream">About</h2>
          <p className="mt-3 text-sm leading-6 text-cream/75">
            {club.name} welcomes all students. Meetings are open — come by to
            see what we&apos;re about, no commitment required. Join our Remind
            channel or ask an officer for details.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-cream/75">
            <li>• Open to all grades</li>
            <li>• {commitmentLabel}</li>
            <li>• Advisors: see officer board</li>
          </ul>
        </aside>
      </section>

      <section className="mt-10 overflow-hidden rounded-[20px] bg-[#f0ebe5]/95 p-6 text-[#2a2829] lg:p-10">
        <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#263a99]">Club leadership</p><h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-wide text-[#2a2829] sm:text-5xl">
          Meet the board!
        </h2>
        </div>
        {isApprovedCharter ? (
          <p className="mt-5 text-center text-sm text-[#2a2829]/70">
            This club was just chartered — the officer roster will be posted soon.
            Come to a meeting to meet the founding board!
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">Our officers for the 2025–2026 school year.</p>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {club.officers.map((o) => (
                <div
                  key={o.role}
                  className="relative flex min-h-[285px] flex-col items-center overflow-hidden rounded-[18px] border border-[#2a2829] bg-white p-5 text-center"
                >
                  <span className="rounded-full bg-[#263a99] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#f0ebe5]">{o.role}</span>
                  <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-[#2a2829]">{o.name}</p>
                  <div className="absolute -bottom-20 flex size-[210px] items-start justify-center rounded-full bg-[#dcd0be] pt-12 shadow-[0_4px_30px_-8px_rgba(252,241,221,0.7)]">
                    <span className="font-display text-xl font-extrabold text-[#263a99]">
                      {o.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <footer className="mt-12 flex items-center gap-5 pb-2 text-[10px] font-medium text-[#f0ebe5]"><span>CLUB PROFILE</span><span className="h-px flex-1 bg-[#f0ebe5]" /><span className="text-[#dcd0be]">{club.name.toUpperCase()}</span></footer>
    </div>
  );
}
