import { Suspense } from "react";
import Link from "next/link";
import LoginCard, { LoginCardSkeleton } from "./login-card";

export default function LoginPage() {
  return (
    <div className="login-gradient fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-[0px_4px_100px_rgba(255,255,255,0.94)] blur-2xl"
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-panel bg-card p-8 shadow-[0_4px_100px_rgba(255,255,255,0.35)]">
        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginCard />
        </Suspense>
        <p className="mt-6 text-center text-xs text-muted">
          Need help?{" "}
          <Link
            href="/support#technical-support"
            className="font-semibold text-navy underline-offset-2 hover:underline"
          >
            Visit Technical Support
          </Link>
        </p>
      </div>
    </div>
  );
}