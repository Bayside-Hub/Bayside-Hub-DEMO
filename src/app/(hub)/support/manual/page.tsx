import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "User Manual — Support",
};

const roles = [
  {
    id: "student",
    label: "Students",
    badge: "bg-navy text-cream",
    summary:
      "Discover clubs, sign up for activities, and stay on top of announcements and opportunities.",
    sections: [
      {
        title: "Signing in for the first time",
        steps: [
          "Click Sign in in the top-right corner of any page.",
          "Choose Continue with Google and sign in with your @nycstudents.net account.",
          "You'll land back on the home page automatically — no extra setup needed.",
        ],
        note: "Usernames and passwords are managed by the school, not by Bayside Hub.",
      },
      {
        title: "Browsing clubs and activities",
        steps: [
          "Open Activities & Clubs from the left sidebar or the Clubs link.",
          "Use the search box to filter by name, or browse the full list.",
          "Open any club card to read its description and meeting schedule.",
        ],
      },
      {
        title: "Checking announcements",
        steps: [
          "Visit Announcements for daily updates and school-wide notices.",
          "Use Full Announcement on the featured post for the day's complete rundown.",
          "Older posts live in the archive.",
        ],
      },
      {
        title: "Finding opportunities",
        steps: [
          "Open Opportunities for elections, internships, college prep, and service.",
          "Jump between categories with the quick links at the top of the page.",
          "Read the Learn more pages for requirements and deadlines.",
        ],
      },
      {
        title: "Applying for a new club",
        steps: [
          "Submit a club application from the Activities & Clubs page.",
          "Fill in your club name, category, description, and meeting days.",
          "An administrator reviews your application — check back in a few days.",
        ],
        note: "Status changes appear in the Manage Clubs queue once your application is reviewed.",
      },
      {
        title: "Viewing your profile",
        steps: [
          "Click your avatar or My Profile in the navigation.",
          "Your name, school email, and role are shown there.",
          "Saved clubs and service hours will appear on your profile in a future update.",
        ],
      },
    ],
  },
  {
    id: "advisor",
    label: "Advisors & Club Officers",
    badge: "bg-peach text-black",
    summary:
      "Guide a club through chartering, keep member info current, and connect students with opportunities.",
    sections: [
      {
        title: "Getting your club recognized",
        steps: [
          "Prepare a club constitution following the sample in Support.",
          "Submit the charter application through the Activities & Clubs page.",
          "Administrators approve charters in the Manage Clubs queue.",
        ],
        note: "Once approved, your club appears on the public Activities & Clubs list.",
      },
      {
        title: "Keeping club information current",
        steps: [
          "Open Activities & Clubs → Manage My Clubs.",
          "Advisors can appoint active club members to club-specific board positions.",
          "Advisors and current board members can update public descriptions, schedules, announcements, and the photo gallery.",
          "Use Change History to review who changed club content and when.",
        ],
        note: "Board access belongs to the club assignment, not the student's global account role.",
      },
      {
        title: "Annual BHS requirements",
        steps: [
          "Keep a roster of at least 10 interested students; do not store S.O. card numbers in Bayside Hub.",
          "Confirm a constitution and College Alignment Form are on file.",
          "Record completion of one event, one community service project, and one fundraiser each school year.",
          "Use the annual checklist in Manage My Clubs to track completion.",
        ],
      },
      {
        title: "Promoting opportunities",
        steps: [
          "Suggest service hours, elections, and internships to an administrator.",
          "Admin can post opportunities and announcements that reach the whole school.",
        ],
      },
    ],
  },
  {
    id: "admin",
    label: "Administrators",
    badge: "bg-orange/25 text-orange",
    summary:
      "Run the platform day-to-day: review applications, publish announcements, and manage accounts.",
    sections: [
      {
        title: "Reviewing club applications",
        steps: [
          "Open Admin → Manage Clubs from the left sidebar.",
          "Each pending application shows its details and contact email.",
          "Choose Approve or Reject — the status updates immediately.",
        ],
        note: "Approved clubs appear on the public Activities & Clubs list automatically.",
      },
      {
        title: "Publishing announcements",
        steps: [
          "Open Admin → Post Announcement.",
          "Write a title, pick a tag (Announcements, Events, Clubs, Sports, Opportunities), and add the body.",
          "Publish — the post appears on the Announcements page right away.",
        ],
      },
      {
        title: "Managing user roles",
        steps: [
          "Open Admin → Manage Users.",
          "Use the dropdown next to a member to set their global role: Student, Advisor, Staff, or Admin.",
          "Changes take effect on that member's next request.",
        ],
        note: "Be careful promoting users to Admin — admins can change roles and delete content.",
      },
      {
        title: "Reading platform reports",
        steps: [
          "Open Admin → Reports for live counts of approved, pending, and rejected applications.",
          "Weekly, monthly, and quarterly summaries are gathered there for the SO office.",
        ],
      },
    ],
  },
  {
    id: "board",
    label: "School Leadership",
    badge: "bg-steel text-black",
    summary:
      "School leadership oversees club governance and investigations through staff reports and club change history.",
    sections: [
      {
        title: "Oversight and reporting",
        steps: [
          "Ask an administrator to walk through the Reports page and relevant club change history.",
          "Review club engagement, application volume, and announcement reach.",
          "Use the weekly, monthly, and quarterly summaries administrators export for leadership meetings.",
        ],
        note: "Student club-board membership is club-specific. School-wide oversight remains with authorized staff and administrators.",
      },
      {
        title: "Connecting with the SO office",
        steps: [
          "Direct student questions to the Support page.",
          "Escalate platform issues through Technical Support.",
          "Set approvals policy (which categories need board sign-off) with the administrator team.",
        ],
      },
    ],
  },
];

export default function ManualPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        eyebrow="Support"
        title="Bayside Hub User Manual"
        subtitle="Everything you need to use Bayside Hub, organized by role. Pick your section below — students, advisors, administrators, and board leadership are all covered."
        actions={
          <nav aria-label="Manual sections" className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <a
                key={r.id}
                href={`#${r.id}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-80 ${r.badge}`}
              >
                {r.label}
              </a>
            ))}
          </nav>
        }
      />

      <div className="space-y-10">
        {roles.map((role, i) => (
          <section
            key={role.id}
            id={role.id}
            className="scroll-mt-24 rounded-card border border-line bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${role.badge}`}
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">{role.label}</h2>
                <p className="mt-0.5 text-sm leading-6 text-muted">{role.summary}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {role.sections.map((s) => (
                <article key={s.title} className="rounded-light border border-line bg-content-bg p-5">
                  <h3 className="text-base font-semibold text-ink">{s.title}</h3>
                  <ol className="mt-3 space-y-2">
                    {s.steps.map((step, n) => (
                      <li key={n} className="flex gap-3 text-sm leading-6 text-muted">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy/40 text-[11px] font-bold text-cream"
                          aria-hidden
                        >
                          {n + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {s.note && (
                    <p className="mt-3 rounded-light bg-peach/60 px-3 py-2 text-xs leading-5 text-black">
                      <span className="font-semibold">Note: </span>
                      {s.note}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-card border border-line bg-peach/60 p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-black">Still need help?</h2>
        <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-black/70">
          Visit the Support home for club chartering guides and technical help, or open a
          support request and the SO office will get back to you within 2 school days.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/support"
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark"
          >
            Support Home
          </Link>
          <Link
            href="/support#technical-support"
            className="rounded-full border border-line bg-content-bg px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-powder hover:text-powder"
          >
            Technical Support
          </Link>
        </div>
      </section>
    </div>
  );
}
