import { Suspense } from "react";
import Link from "next/link";
import LoginCard, { LoginCardSkeleton } from "./login-card";

export default function LoginPage() {
  return (
    <div className="login-gradient fixed inset-0 z-50 min-h-full w-full overflow-y-auto px-4 py-6 sm:px-8 lg:px-14">
      <nav className="relative z-10 mx-auto flex w-full max-w-[1800px] items-center justify-between text-[#f7f8f0]">
        <Link href="/" className="text-sm font-bold tracking-wide">BAYSIDE HUB</Link>
        <Link href="/support#technical-support" className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold hover:bg-white/10">NEED HELP?</Link>
      </nav>
      <div className="login-intro-orb pointer-events-none absolute left-[22%] top-1/2 size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7f8f0] shadow-[0_4px_100px_rgba(255,255,255,0.94)]" aria-hidden />
      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] w-full max-w-[1500px] items-center gap-12 py-10 lg:grid-cols-[1fr_520px]">
        <section className="login-intro-copy hidden max-w-2xl text-[#f7f8f0] lg:block">
          <p className="text-xs font-bold tracking-[0.28em] text-[#c0dbea]">ONE SCHOOL · ONE HUB</p>
          <h1 className="mt-6 text-7xl font-bold leading-[0.94] tracking-[-0.05em]">Everything at Bayside,<br />in one place.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">Discover clubs, follow school events, read announcements, and keep your schedule together with your official school account.</p>
          <ol className="mt-10 flex gap-3 text-[10px] font-bold tracking-wider" aria-label="Sign-in steps">
            <li className="rounded-full bg-white px-4 py-2 text-[#141d40]">01 DISCOVER</li>
            <li className="rounded-full border border-white/30 px-4 py-2">02 CONNECT</li>
            <li className="rounded-full border border-white/30 px-4 py-2">03 PARTICIPATE</li>
          </ol>
        </section>
        <section className="login-intro-card relative w-full rounded-[15px] border border-[#c0dbea] bg-[#f7f8f0] px-6 py-10 shadow-[0_4px_100px_rgba(255,255,255,0.28)] sm:px-12 sm:py-14">
          <Suspense fallback={<LoginCardSkeleton />}><LoginCard /></Suspense>
          <p className="mt-7 text-center text-xs text-[#5f6368]">Need help? <Link href="/support#technical-support" className="font-semibold text-navy underline-offset-2 hover:underline">Visit Technical Support</Link></p>
        </section>
      </main>
    </div>
  );
}
