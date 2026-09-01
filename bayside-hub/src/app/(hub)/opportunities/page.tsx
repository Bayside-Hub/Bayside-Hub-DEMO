import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getOpportunities } from "@/lib/opportunities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunities",
};

const types = ["Elections", "Internships", "College Prep", "Community Service", "Student Discounts"];

const typeSlug = (t: string) => t.toLowerCase().replace(/[^a-z]+/g, "-");

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="Opportunities"
        subtitle="Elections, internships, college prep, and community service opportunities — all in one place. Check dates, requirements, and how to apply."
        actions={
          <nav aria-label="Opportunity types" className="flex flex-wrap gap-2">
            {types.map((t) => (
              <a
                key={t}
                href={`#${typeSlug(t)}`}
                className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-cream/85 transition-colors hover:bg-navy hover:text-cream"
              >
                {t}
              </a>
            ))}
          </nav>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {opportunities.map((o) => (
          <article
            key={o.id}
            id={typeSlug(o.type)}
            className="card-gradient flex flex-col scroll-mt-24 rounded-[10px] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-navy">
                {o.type}
              </span>
              <time className="text-xs text-cream/60">{o.date}</time>
            </div>
            <h2 className="mt-3 font-display text-xl font-bold uppercase leading-snug text-cream">{o.title}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-cream/70">{o.description}</p>
            <Link
              href={`/opportunities/${o.id}`}
              className="mt-4 inline-flex h-10 w-fit items-center justify-center rounded-[22px] bg-cream px-6 font-display text-xs font-extrabold tracking-wide text-black transition-colors hover:bg-white"
            >
              Learn more
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
