import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { getSiteText } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Hatchx—the student-built platform helping every Baysider discover, connect, and lead.",
};

const steps = [
  { number: "01", title: "Discover", body: "Find clubs, events, announcements, and opportunities without searching through disconnected posts and group chats." },
  { number: "02", title: "Connect", body: "Move from curiosity to participation with clear club profiles, timely updates, and one shared school calendar." },
  { number: "03", title: "Lead", body: "Give student leaders and advisors practical tools to organize membership, attendance, communication, and club operations." },
];

export default async function AboutPage() {
  const text = await getSiteText();
  const principles = [[text.about_card_1_title, text.about_card_1_body], [text.about_card_2_title, text.about_card_2_body], [text.about_card_3_title, text.about_card_3_body]];
  return <main className="about-page overflow-hidden">
    <section className="about-hero relative isolate min-h-[min(760px,calc(100svh-5rem))] overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div className="about-grid absolute inset-0 -z-10" aria-hidden />
      <div className="about-orbit about-orbit-one" aria-hidden />
      <div className="about-orbit about-orbit-two" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-end gap-14 lg:grid-cols-[1.15fr_.85fr]">
        <div className="max-w-4xl">
          <p className="about-reveal text-xs font-bold uppercase tracking-[.24em] text-[#9bc3ff]">Built at Bayside · Built for what comes next</p>
          <h1 className="about-reveal about-reveal-delay mt-6 font-display text-[clamp(3.4rem,9.5vw,8.6rem)] font-bold leading-[.82] tracking-[-.075em] text-white">School life,<br /><span className="about-gradient-text">in motion.</span></h1>
          <p className="about-reveal about-reveal-delay-2 mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">{text.about_intro}</p>
          <div className="about-reveal about-reveal-delay-2 mt-9 flex flex-wrap gap-3"><Link href="/clubs" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#081126] transition hover:-translate-y-0.5 hover:bg-[#dce9ff]">Explore the community</Link><a href="#story" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">Our story ↓</a></div>
        </div>
        <div className="about-reveal about-reveal-delay-2 relative mx-auto aspect-square w-full max-w-[430px]" aria-label="Hatchx connects discovery, community, and leadership">
          <div className="absolute inset-[12%] rounded-full border border-white/10 bg-white/[.035] backdrop-blur-sm" />
          <div className="absolute inset-[28%] grid place-items-center rounded-[32%] bg-gradient-to-br from-[#87b9ff] to-[#ff9d76] shadow-[0_0_90px_rgba(112,166,255,.34)]"><LogoMark className="h-24 w-24 sm:h-32 sm:w-32" variant="dark" /></div>
          <span className="about-node left-[2%] top-[22%]">Discover</span><span className="about-node right-0 top-[48%]">Connect</span><span className="about-node bottom-[8%] left-[28%]">Lead</span>
        </div>
      </div>
    </section>

    <section className="border-y border-line bg-card/60 px-5 py-6 sm:px-8"><div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3"><p className="text-sm"><strong className="mr-2 text-ink">One place</strong><span className="text-muted">for the full school experience</span></p><p className="text-sm"><strong className="mr-2 text-ink">Every club</strong><span className="text-muted">easier to find and join</span></p><p className="text-sm"><strong className="mr-2 text-ink">Each student</strong><span className="text-muted">closer to belonging</span></p></div></section>

    <section id="story" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-24"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-azure">Why Hatchx</p><p className="mt-4 max-w-xs text-sm leading-7 text-muted">A better school experience starts when the right information reaches the right student at the right moment.</p></div><div><h2 className="font-display text-4xl font-bold leading-[1.05] tracking-[-.04em] text-ink sm:text-6xl">{text.about_heading}</h2><p className="mt-8 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-muted">{text.about_body}</p></div></div></section>

    <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#091126] text-white shadow-[0_35px_100px_-50px_rgba(32,92,190,.8)]"><div className="border-b border-white/10 px-7 py-8 sm:px-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9bc3ff]">From interest to impact</p><h2 className="mt-3 font-display text-3xl font-bold tracking-[-.03em] sm:text-5xl">One connected journey.</h2></div><div className="grid md:grid-cols-3">{steps.map((step) => <article key={step.number} className="group border-white/10 p-7 md:border-r md:last:border-r-0 sm:p-10"><p className="font-mono text-xs text-[#87b9ff]">{step.number}</p><h3 className="mt-14 font-display text-2xl font-bold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{step.body}</p><div className="mt-8 h-px w-10 bg-[#ff9d76] transition-all duration-300 group-hover:w-20" /></article>)}</div></div></section>

    <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-24"><div className="relative aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] bg-[#0a1124] p-8 text-white shadow-[0_30px_80px_-45px_rgba(41,69,168,.9)]"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#4d7ee8]/35 blur-3xl" /><div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#ff8e68]/30 blur-3xl" /><div className="relative flex h-full flex-col justify-between"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">The founder</p><div><div className="grid size-24 place-items-center rounded-3xl border border-white/15 bg-white/10 font-display text-3xl font-bold">HX</div><p className="mt-6 text-sm text-white/55">Student founder · Bayside High School</p></div></div></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-azure">Meet the founder</p><h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-.04em] text-ink sm:text-6xl">Started by a student who wanted school to feel more connected.</h2><div className="mt-8 space-y-5 text-base leading-8 text-muted"><p>Hatchx began with a student founder noticing a familiar problem: incredible opportunities existed across campus, yet too many students learned about them late—or not at all.</p><p>Instead of accepting that friction, the founder began building a shared digital home for school life: a place designed from a student&apos;s point of view, strengthened by club leaders and advisors, and made to grow with the community it serves.</p><p className="border-l-2 border-orange pl-5 font-medium text-ink">“The goal is not simply to organize information. It is to help every student find a place to begin.”</p></div></div></div></section>

    <section className="border-y border-line bg-card/55 px-5 py-24 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-azure">What guides us</p><h2 className="mt-4 font-display text-4xl font-bold tracking-[-.04em] text-ink sm:text-5xl">Designed with intention.</h2><div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">{principles.map(([title, body], index) => <article key={title} className="bg-card p-7 sm:p-9"><p className="font-mono text-xs text-muted">0{index + 1}</p><h3 className="mt-10 text-xl font-bold text-ink">{title}</h3><p className="mt-3 text-sm leading-7 text-muted">{body}</p></article>)}</div></div></section>

    <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-[#2447aa] to-[#14265f] px-7 py-12 text-white sm:px-12 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/60">Find your next thing</p><h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-[-.04em] sm:text-6xl">There is a place for you here.</h2></div><Link href="/clubs" className="shrink-0 rounded-full bg-[#ffcf86] px-6 py-3 text-sm font-bold text-[#101936] transition hover:-translate-y-0.5 hover:bg-white">Discover clubs →</Link></div></section>
  </main>;
}
