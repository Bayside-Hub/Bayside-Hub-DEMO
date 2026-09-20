import type { Metadata } from "next";
import { LogoMark } from "@/components/icons";
import { PageHeader } from "@/components/ui";
import { getSiteText } from "@/lib/site-content";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const text = await getSiteText();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="About Us"
        subtitle={text.about_intro}
      />

      <section className="card-gradient relative overflow-hidden rounded-panel px-8 py-12 sm:px-12">
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] shadow-[0_4px_30px_-8px_rgba(252,241,221,0.8)]">
            <LogoMark className="h-20 w-20" variant="dark" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-cream">
              {text.about_heading}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-cream/80">
              {text.about_body}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: text.about_card_1_title,
            body: text.about_card_1_body,
          },
          {
            title: text.about_card_2_title,
            body: text.about_card_2_body,
          },
          {
            title: text.about_card_3_title,
            body: text.about_card_3_body,
          },
        ].map((c) => (
          <div key={c.title} className="card-gradient rounded-[10px] p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-cream">{c.title}</h3>
            <p className="mt-2 text-sm leading-6 text-cream/70">{c.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
