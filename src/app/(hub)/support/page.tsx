import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { supportTopics } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import SupportRequestForm from "./request-form";

export const metadata: Metadata = { title: "Support" };

export default async function SupportPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  const supabase = user && isSupabaseConfigured() ? await createServerClient() : null;
  const { data: requests } = supabase
    ? await supabase
        .from("support_requests")
        .select("id, request_type, subject, status, created_at")
        .eq("submitted_by", userId!)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: null };
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title="Support"
        subtitle="Club Support and Technical Support — find guides for chartering, funding, room booking, and Bayside Hub help."
        actions={
          <Link
            href="/support/manual"
            className="inline-flex h-10 items-center justify-center rounded-[22px] bg-cream px-6 font-display text-xs font-extrabold tracking-wide text-black transition-colors hover:bg-white"
          >
            Read the User Manual →
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section id="club-support" className="scroll-mt-24">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wide text-ink">Club Support</h2>
          <div className="space-y-4">
            {supportTopics
              .filter((t) => t.id !== "tech")
              .map((t) => (
                <details
                  key={t.id}
                  className="group card-gradient rounded-[10px] open:shadow-lg"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-cream [&::-webkit-details-marker]:hidden">
                    {t.title}
                    <span className="text-powder transition-transform group-open:rotate-180" aria-hidden>
                      ▾
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-6 text-cream/70">{t.description}</p>
                </details>
              ))}
          </div>
        </section>

        <section id="technical-support" className="scroll-mt-24">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wide text-ink">Technical Support</h2>
          <div className="card-gradient rounded-[10px] p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-cream">Bayside Hub Help</h3>
            <p className="mt-2 text-sm leading-6 text-cream/70">Need help with your account?</p>
            {user ? <SupportRequestForm /> : (
              <Link href="/login?next=/support" className="mt-4 inline-flex h-10 w-fit items-center justify-center rounded-[22px] bg-cream px-6 font-display text-xs font-extrabold tracking-wide text-black transition-colors hover:bg-white">
                Sign in to request support
              </Link>
            )}
            <p className="mt-4 text-sm leading-6 text-cream/70">
              Average response time: within 2 school days. Come to the SO office
              (Room 100) for in-person help.
            </p>
          </div>
        </section>
      </div>

      {user && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">My requests</h2>
          {requests?.length ? (
            <ul className="mt-4 space-y-3">
              {requests.map((request) => (
                <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-card px-5 py-4">
                  <div><p className="font-semibold text-ink">{request.subject}</p><p className="mt-1 text-xs text-muted">{request.request_type.replaceAll("_", " ")}</p></div>
                  <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase text-cream">{request.status.replaceAll("_", " ")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted">You have no support requests yet.</p>}
        </section>
      )}
    </div>
  );
}
