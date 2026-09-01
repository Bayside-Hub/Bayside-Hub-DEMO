import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { OpportunityForm, OpportunityStatusForm } from "./opportunity-forms";

export default async function AdminOpportunitiesPage() {
  await requireStaff();
  const supabase = isSupabaseConfigured() ? await createServerClient() : null;
  const { data: opportunities } = supabase ? await supabase.from("opportunities").select("id, title, category, status, deadline, created_at").order("created_at", { ascending: false }).limit(100) : { data: null };
  return <div className="mx-auto w-full max-w-6xl px-6 py-8"><PageHeader title="Opportunities" subtitle="Create, review, publish, expire, and archive student opportunities." /><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><section className="rounded-card border border-black/5 bg-card p-6 shadow-sm"><h2 className="text-lg font-bold text-ink">New opportunity</h2><OpportunityForm /></section><section className="rounded-card border border-black/5 bg-card p-6 shadow-sm"><h2 className="text-lg font-bold text-ink">Lifecycle</h2>{opportunities?.length ? <ul className="mt-4 divide-y divide-black/5">{opportunities.map((opportunity) => <li key={opportunity.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]"><div><p className="font-semibold text-ink">{opportunity.title}</p><p className="mt-1 text-xs uppercase text-muted">{opportunity.category.replaceAll("_", " ")}{opportunity.deadline ? ` · ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(opportunity.deadline))}` : ""}</p></div><OpportunityStatusForm id={opportunity.id} status={opportunity.status} /></li>)}</ul> : <p className="mt-4 text-sm text-muted">No opportunities yet.</p>}</section></div></div>;
}
