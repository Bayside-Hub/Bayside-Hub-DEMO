import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import ApplyForm from "../apply-form";

export const metadata: Metadata = {
  title: "Apply for a New Club",
};

export default async function ClubApplyPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <PageHeader
        title="Apply for a New Club"
        subtitle="Start a club at Bayside! Tell us what you want to create and an administrator will review your application. You'll see its status once it's reviewed."
      />

      <p className="text-sm text-muted">
        <Link href="/clubs" className="font-semibold text-powder hover:text-cream">
          ← Back to Activities &amp; Clubs
        </Link>
      </p>

      {!user && (
        <div className="card-gradient mt-8 rounded-[10px] p-6 text-center sm:p-8">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-cream">
            Sign in to apply
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-cream/70">
            Club applications are tied to your student account so administrators
            can follow up with you.
          </p>
          <Link
            href="/login?next=/clubs/apply"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[22px] bg-cream px-8 font-display text-sm font-extrabold tracking-wide text-black transition-colors hover:bg-white"
          >
            Sign in with Google
          </Link>
        </div>
      )}

      {user ? <ApplyForm defaultEmail={user.email} /> : null}

      <section className="mt-8 rounded-card border border-line bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
          What happens next?
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>An administrator reviews your application in the Manage Clubs queue.</li>
          <li>Once approved, your club appears on the public Activities &amp; Clubs list automatically.</li>
          <li>
            Questions? Visit{" "}
            <Link href="/support#club-support" className="font-semibold text-powder hover:text-cream">
              Club Support
            </Link>{" "}
            for chartering guides.
          </li>
        </ol>
      </section>
    </div>
  );
}
