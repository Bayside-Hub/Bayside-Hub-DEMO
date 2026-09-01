import Link from "next/link";
import { LogoMark } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="theme-dark flex min-h-full flex-col items-center justify-center bg-content-bg px-6 py-20 text-center">
      <LogoMark className="h-12 w-14 text-cream" />
      <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide text-cream sm:text-5xl">
        Lost at sea
      </h1>
      <p className="mt-3 max-w-md text-base leading-7 text-muted">
        This page drifted off the map. It may have been moved, renamed, or
        never existed — let&apos;s get you back to shore.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-[22px] bg-cream px-7 font-display text-sm font-extrabold tracking-wide text-black transition-colors hover:bg-white"
        >
          Back to Home
        </Link>
        <Link
          href="/clubs"
          className="inline-flex h-11 items-center justify-center rounded-[22px] border border-line px-7 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
        >
          Browse Clubs
        </Link>
        <Link
          href="/support"
          className="inline-flex h-11 items-center justify-center rounded-[22px] border border-line px-7 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
        >
          Get Help
        </Link>
      </div>
    </div>
  );
}
