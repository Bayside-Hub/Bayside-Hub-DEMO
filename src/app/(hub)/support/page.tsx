import type { Metadata } from "next";
import Link from "next/link";
import { supportTopics } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import SupportRequestForm from "./request-form";

export const metadata: Metadata = { title: "Support" };

const serviceCards = [
  { title: "Club & Activity Support", category: "Student life", schedule: "SCHOOL DAYS · S.O. OFFICE", keywords: "club charter funding room activity", color: "bg-[#263a99]", primary: "Guides", primaryHref: "/support/manual", secondary: "Get help", secondaryHref: "#request-support" },
  { title: "Student Counseling & Wellness", category: "Wellness", schedule: "MONDAY–FRIDAY · ROOM 147", keywords: "counselor counseling mental health wellbeing", color: "bg-[#97b4de]", primary: "Resources", primaryHref: "/support/manual", secondary: "Contact", secondaryHref: "#request-support" },
  { title: "IT Help Desk & Device Support", category: "Tech & IT", schedule: "SCHOOL DAYS · ROOM 314", keywords: "technical technology bug account login computer device", color: "bg-[#263a99]", primary: "Troubleshoot", primaryHref: "#technical-support", secondary: "Report issue", secondaryHref: "#request-support" },
];

const faqs = [
  { question: "Who can I reach out to if I encounter a technical issue or bug?", answer: "Submit a Technical Support request below. The support team will respond within two school days." },
  { question: "How do I track the status of my activities and requests?", answer: "Open your Profile to review joined clubs, applications, and support requests." },
];

function searchable(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const user = await getCurrentUser();
  const userId = user?.id;
  const supabase = user && isSupabaseConfigured() ? await createServerClient() : null;
  const { data: requests } = supabase ? await supabase.from("support_requests").select("id, request_type, subject, status, created_at").eq("submitted_by", userId!).order("created_at", { ascending: false }).limit(10) : { data: null };
  const visibleCards = query ? serviceCards.filter((card) => searchable(`${card.title} ${card.category} ${card.schedule} ${card.keywords}`, query)) : serviceCards;
  const visibleFaqs = query ? faqs.filter((faq) => searchable(`${faq.question} ${faq.answer}`, query)) : faqs;
  const visibleTopics = query ? supportTopics.filter((topic) => searchable(`${topic.title} ${topic.description}`, query)) : supportTopics;

  return (
    <div className="support-backdrop relative min-h-full overflow-hidden bg-black px-5 py-8 text-[#f0ebe5] sm:px-8 lg:px-12">
      <div className="relative mx-auto w-full max-w-[1812px]">
        <header className="flex min-h-[300px] flex-col items-center justify-center py-10 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-[52px]">We are here to help!</h1>
          <form role="search" className="mt-5 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
            <label htmlFor="support-search" className="sr-only">Search support</label>
            <input id="support-search" name="q" defaultValue={query} placeholder="Ask a question…" className="h-12 min-w-0 flex-1 rounded-[8px] bg-[#f0ebe5] px-4 text-sm text-[#2a2829] outline-none placeholder:text-[#6f6a6b] focus:ring-2 focus:ring-[#97b4de]" />
            <button className="h-12 rounded-[8px] bg-[#263a99] px-6 text-xs font-bold text-[#f0ebe5]">SEARCH</button>
          </form>
          <p className="mt-2 text-base text-[#dcd0be] sm:text-xl">Comments, concerns, and issues are welcome.</p>
          {query ? <Link href="/support" className="mt-3 text-xs font-semibold text-[#97b4de] hover:underline">Clear search</Link> : null}
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <section aria-labelledby="support-services-title">
            <h2 id="support-services-title" className="sr-only">Support services</h2>
            {visibleCards.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleCards.map((card) => <article key={card.title} className="flex min-h-60 flex-col rounded-[12px] bg-[#dcd0be] p-[18px] text-[#2a2829]"><span className={`size-12 rounded-[14px] ${card.color}`} aria-hidden /><h3 className="mt-3 text-base font-bold">{card.title}</h3><p className="mt-1 text-xs font-semibold text-[#263a99]">{card.category}</p><p className="mt-2 text-[11px] font-medium">{card.schedule}</p><div className="mt-auto flex flex-wrap justify-center gap-2 pt-5"><Link href={card.primaryHref} className="rounded-full bg-[#e8e1d8] px-5 py-2 text-[10px] font-semibold text-[#263a99]">{card.primary.toUpperCase()}</Link><Link href={card.secondaryHref} className="rounded-full bg-[#e8e1d8] px-5 py-2 text-[10px] font-semibold text-[#263a99]">{card.secondary.toUpperCase()}</Link></div></article>)}</div> : <p className="rounded-[12px] bg-[#dcd0be] p-8 text-center text-[#2a2829]">No support service matched “{query}”.</p>}
          </section>

          <section className="rounded-[14px] bg-[#dcd0be] p-[22px] text-[#2a2829]" aria-labelledby="faq-title">
            <h2 id="faq-title" className="text-xl font-bold uppercase">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">{visibleFaqs.length ? visibleFaqs.map((faq, index) => <details key={faq.question} className="group rounded-[10px] bg-[#f0ebe5] p-4"><summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-bold [&::-webkit-details-marker]:hidden"><span className="text-xs text-[#263a99]">Q{index + 1}</span><span className="flex-1">{faq.question}</span><span className="text-xl text-[#263a99] transition-transform group-open:rotate-45" aria-hidden>+</span></summary><p className="mt-3 pl-8 text-sm leading-6 text-[#263a99]">{faq.answer}</p></details>) : <p className="text-sm text-[#6f6a6b]">No FAQ matched this search.</p>}</div>
          </section>
        </div>

        <section id="technical-support" className="mt-8 scroll-mt-24 rounded-[20px] bg-[#dcd0be]/95 p-5 text-[#2a2829] sm:p-8">
          <h2 className="text-2xl font-bold">Support guides</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{visibleTopics.map((topic) => <details key={topic.id} className="group rounded-[10px] bg-[#f0ebe5] p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">{topic.title}<span className="text-[#263a99] transition-transform group-open:rotate-45" aria-hidden>+</span></summary><p className="mt-3 text-sm leading-6 text-[#6f6a6b]">{topic.description}</p></details>)}</div>
        </section>

        <section id="request-support" className="mt-8 scroll-mt-24 rounded-[20px] bg-[#dcd0be]/95 p-5 text-[#2a2829] sm:p-8">
          <h2 className="text-2xl font-bold">Request support</h2>
          <p className="mt-2 text-sm text-[#6f6a6b]">Average response time: within two school days. For in-person help, visit the S.O. office in Room 100.</p>
          {user ? <SupportRequestForm /> : <Link href="/login?next=/support" className="mt-5 inline-flex h-11 items-center rounded-[8px] bg-[#263a99] px-6 text-xs font-bold text-[#f0ebe5]">SIGN IN TO REQUEST SUPPORT</Link>}
        </section>

        {user ? <section className="mt-8 rounded-[20px] bg-[#dcd0be]/95 p-5 text-[#2a2829] sm:p-8"><h2 className="text-2xl font-bold">My requests</h2>{requests?.length ? <ul className="mt-4 space-y-3">{requests.map((request) => <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-[#f0ebe5] px-5 py-4"><div><p className="font-semibold">{request.subject}</p><p className="mt-1 text-xs text-[#6f6a6b]">{request.request_type.replaceAll("_", " ")}</p></div><span className="rounded-full bg-[#263a99] px-3 py-1 text-xs font-bold uppercase text-[#f0ebe5]">{request.status.replaceAll("_", " ")}</span></li>)}</ul> : <p className="mt-4 text-sm text-[#6f6a6b]">You have no support requests yet.</p>}</section> : null}

        <footer className="mt-12 flex items-center gap-5 pb-2 text-[10px] font-medium"><span>SUPPORT</span><span className="h-px flex-1 bg-[#f0ebe5]" /><span className="text-[#dcd0be]">BAYSIDE HUB</span></footer>
      </div>
    </div>
  );
}
