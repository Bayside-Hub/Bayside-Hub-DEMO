"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/icons";
import { createBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNextPath } from "@/lib/navigation";

export function LoginCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-card bg-navy">
        <LogoMark className="h-8 w-9 text-cream" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-ink">Bayside Hub</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in with your NYC student account to get started.
      </p>
      <div className="mt-8 h-11 w-full animate-pulse rounded-full bg-black/5" />
    </div>
  );
}

export default function LoginCard() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const error = searchParams.get("error");
  const configured = isSupabaseConfigured();
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    const supabase = createBrowserClient();
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      console.error("OAuth sign-in failed:", oauthError.message);
      setPending(false);
      return;
    }
    if (data?.url) window.location.href = data.url;
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-card bg-navy">
        <LogoMark className="h-8 w-9 text-cream" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-ink">Bayside Hub</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in with your NYC student account to get started.
      </p>

      {error === "auth" && (
        <p className="mt-4 rounded-light bg-orange/10 px-3 py-2 text-xs font-medium text-orange">
          Sign-in didn&apos;t complete. Please try again.
        </p>
      )}
      {error === "domain" && (
        <p className="mt-4 rounded-light bg-orange/10 px-3 py-2 text-xs font-medium text-orange" role="alert">
          This Google account is not from an approved school domain.
        </p>
      )}

      <div className="mt-8 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={signIn}
          disabled={!configured || pending}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-content-bg text-sm font-semibold text-ink transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path fill="#4285F4" d="M19 10.2c0-.7-.06-1.4-.18-2H10v3.8h5.06a4.6 4.6 0 0 1-2 3v2.5h3.24C18.12 15.8 19 13.2 19 10.2Z" />
            <path fill="#34A853" d="M10 19c1.8 0 3.3-.6 4.4-1.6l-3.24-2.5c-.9.6-2.05.95-3.16.95-2.43 0-4.5-1.64-5.23-3.85H1.4v2.6A9 9 0 0 0 10 19Z" />
            <path fill="#FBBC05" d="M4.77 11.98A5.4 5.4 0 0 1 4.5 10c0-.69.1-1.35.27-1.98V5.42H1.4a9 9 0 0 0 0 8.17l3.37-2.6Z" />
            <path fill="#EA4335" d="M10 4.14c1-.88 2.24-1.39 3.54-1.39.96 0 1.86.34 2.56.96l2.7-2.7A9.04 9.04 0 0 0 10-1C6.35-1 3.14 1.05 1.4 4.42l3.37 2.6C5.5 5.78 7.57 4.14 10 4.14Z" />
          </svg>
          {pending ? "Redirecting to Google…" : "Continue with Google"}
        </button>

        {!configured && (
          <p className="rounded-light bg-cream px-3 py-2 text-xs leading-5 text-muted">
            Supabase isn&apos;t configured yet. Add{" "}
            <code className="font-mono text-[11px] text-ink">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="font-mono text-[11px] text-ink">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            to <code className="font-mono text-[11px] text-ink">.env.local</code> to enable
            sign-in.
          </p>
        )}

        <p className="text-center text-xs text-muted">
          Use your @nycstudents.net account. Advisors sign in with their school account.
        </p>
      </div>
    </div>
  );
}
