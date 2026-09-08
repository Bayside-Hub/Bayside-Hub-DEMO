"use client";

import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";

/** Email registration requires verification; database triggers assign roles. */
export default function EmailAccount({ next, recovery = false }: { next: string; recovery?: boolean }) {
  const [mode, setMode] = useState<"login" | "signup" | "recovery">(recovery ? "recovery" : "login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    if (mode === "signup" && !/^[^@\s]+@(nycstudents\.net|schools\.nyc\.gov)$/.test(email)) {
      setMessage("Register with your @nycstudents.net or @schools.nyc.gov email.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const client = createBrowserClient();
      if (mode === "recovery") {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        setMessage(error ? "Unable to send the recovery email. Try again later or contact Support." : "If this address has an account, you will receive a password reset email. Open it in this browser.");
      } else if (mode === "signup") {
        const { error } = await client.auth.signUp({ email, password, options: {
          data: { full_name: String(form.get("name")).trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        } });
        setMessage(error ? "Registration could not complete. Please check your details or contact Support." : "Check your school email to confirm your account before signing in. If you already have an account, use Sign in.");
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) setMessage("Sign-in failed. Check your email and password, and confirm your email first.");
        else window.location.assign(next);
      }
    } catch {
      setMessage("Unable to connect. Please try again.");
    } finally { setPending(false); }
  }
  return <section className="mt-8 border-t border-black/10 pt-6 text-[#232b3b]">
    <div className="mb-5 flex gap-2" aria-label="Account options">
      {(["login", "signup"] as const).map(value => <button key={value} disabled={pending} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setMessage(""); }} className={`min-h-11 flex-1 rounded-full px-3 text-sm font-semibold ${mode === value ? "bg-[#263a99] text-white" : "bg-black/5"}`}>{value === "signup" ? "Create account" : "Email sign in"}</button>)}
    </div>
    <form onSubmit={submit} className="grid gap-4">
      {mode === "signup" && <label className="grid gap-1 text-sm">Full name<input name="name" required maxLength={120} autoComplete="name" className="min-h-11 rounded-lg border border-black/20 bg-white px-3" /></label>}
      <label className="grid gap-1 text-sm">School email<input name="email" type="email" required autoComplete="email" className="min-h-11 rounded-lg border border-black/20 bg-white px-3" /></label>
      {mode !== "recovery" && <label className="grid gap-1 text-sm">Password<input name="password" type="password" required minLength={mode === "signup" ? 12 : 1} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="min-h-11 rounded-lg border border-black/20 bg-white px-3" /></label>}
      {mode === "recovery" && <p className="text-sm">We will email you a link to reset your password.</p>}
      {mode === "signup" && <p className="text-xs leading-5">Use at least 12 characters. Student email addresses receive Student access; school staff addresses receive Teacher access. Club leadership is assigned separately by an administrator.</p>}
      {message && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm leading-5 text-blue-950">{message}</p>}
      {mode === "signup" && <label className="flex items-start gap-2 text-xs leading-5"><input name="terms" type="checkbox" required className="mt-1" /><span>I have read the <Link href="/privacy" className="underline">Privacy Policy</Link> and agree to the <Link href="/terms" className="underline">Terms of Use</Link>.</span></label>}
      <button disabled={pending || !isSupabaseConfigured()} className="min-h-11 rounded-full bg-[#263a99] px-4 font-semibold text-white disabled:opacity-50">{pending ? "Please wait…" : mode === "signup" ? "Create account" : mode === "recovery" ? "Send reset link" : "Sign in"}</button>
    </form>
    {mode === "login" && <button type="button" disabled={pending} onClick={() => { setMode("recovery"); setMessage(""); }} className="mt-3 min-h-11 text-sm text-[#263a99] underline">Forgot password?</button>}
  </section>;
}
