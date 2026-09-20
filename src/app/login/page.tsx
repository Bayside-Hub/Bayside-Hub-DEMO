import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import LoginCard, { LoginCardSkeleton } from "./login-card";
import { LogoMark } from "@/components/icons";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="login-gradient relative z-50 min-h-screen min-h-dvh w-full overflow-x-hidden px-4 py-4 sm:px-8 sm:py-6 xl:px-14">
      <nav className="relative z-10 mx-auto flex w-full max-w-[1800px] items-center justify-between text-[#f7f8f0]">
        <Link href="/" aria-label="Bayside Hub home" className="flex items-center gap-3 text-sm font-bold tracking-wide"><LogoMark className="h-12 w-12" variant="dark" /><span>BAYSIDE HUB</span></Link>
        <Link href="/support#technical-support" className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold hover:bg-white/10">NEED HELP?</Link>
      </nav>
      <div className="login-intro-orb pointer-events-none absolute left-[22%] top-1/2 hidden size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7f8f0] shadow-[0_4px_100px_rgba(255,255,255,0.94)] xl:block" aria-hidden />
      <div className="login-ambient login-ambient-one pointer-events-none absolute hidden rounded-full xl:block" aria-hidden />
      <div className="login-ambient login-ambient-two pointer-events-none absolute hidden rounded-full xl:block" aria-hidden />
      <main className="relative z-10 mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-[1500px] items-center gap-10 py-6 sm:py-8 xl:grid-cols-[minmax(0,1fr)_minmax(440px,520px)] xl:py-10">
        <section className="login-intro-copy hidden max-w-2xl text-[#f7f8f0] xl:block">
          <p className="text-xs font-bold tracking-[0.28em] text-[#c0dbea]">ONE SCHOOL · ONE HUB</p>
          <h1 className="mt-6 text-[clamp(3.5rem,5vw,4.5rem)] font-bold leading-[0.94] tracking-[-0.05em]">Everything at Bayside,<br />in one place.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">Discover clubs, follow school events, read announcements, and keep your schedule together with your official school account.</p>
          <ol className="mt-10 flex gap-3 text-[10px] font-bold tracking-wider" aria-label="Sign-in steps">
            <li className="rounded-full bg-white px-4 py-2 text-[#141d40]">01 DISCOVER</li>
            <li className="rounded-full border border-white/30 px-4 py-2">02 CONNECT</li>
            <li className="rounded-full border border-white/30 px-4 py-2">03 PARTICIPATE</li>
          </ol>
        </section>
        <section className="login-intro-card relative mx-auto w-full max-w-[560px] rounded-[15px] border border-[#c0dbea] bg-[#f7f8f0] px-5 py-7 shadow-[0_18px_70px_rgba(5,10,35,0.32)] sm:px-10 sm:py-9 xl:mx-0 xl:justify-self-end xl:px-12 xl:py-10">
          <Suspense fallback={<LoginCardSkeleton />}><LoginCard /></Suspense>
          <p className="login-card-support mt-5 text-center text-xs text-[#5f6368]">Need help? <Link href="/support#technical-support" className="font-semibold text-navy underline-offset-2 hover:underline">Visit Technical Support</Link></p>
          <nav aria-label="Account policies" className="login-card-policies mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-navy"><Link href="/privacy" className="underline">Privacy Policy</Link><Link href="/terms" className="underline">Terms of Use</Link></nav>
        </section>
      </main>
    </div>
  );
}
