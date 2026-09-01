import { LogoMark } from "@/components/icons";
import { PageHeader } from "@/components/ui";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="About Us"
        subtitle="Bayside Hub is Bayside High School's one-stop platform for activities, clubs, events, and opportunities."
      />

      <section className="card-gradient relative overflow-hidden rounded-panel px-8 py-12 sm:px-12">
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-cream shadow-[0_4px_30px_-8px_rgba(252,241,221,0.8)]">
            <LogoMark className="h-9 w-10 text-navy" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-cream">
              Anchored in Excellence
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-cream/80">
              Bayside Hub is Bayside High School&apos;s one-stop platform for
              activities, clubs, events, and opportunities — built by students,
              for students. We keep every announcement, meeting, and deadline
              in one place so you never miss out.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Everything in one place",
            text: "Announcements, club listings, calendars, and opportunities — a single source of truth for school life.",
          },
          {
            title: "Built by students",
            text: "Developed and maintained by the Bayside student dev team, guided by advisors and the SO office.",
          },
          {
            title: "Open to everyone",
            text: "Any student can browse, join clubs, and find opportunities with their NYC student account.",
          },
        ].map((c) => (
          <div key={c.title} className="card-gradient rounded-[10px] p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-cream">{c.title}</h3>
            <p className="mt-2 text-sm leading-6 text-cream/70">{c.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
