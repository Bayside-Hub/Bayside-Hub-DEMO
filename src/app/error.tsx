"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-xl px-6 py-16 text-center">
    <h1 className="text-3xl font-bold text-ink">Something went wrong</h1>
    <p className="mt-3 text-sm text-muted">The page could not be loaded. Please try again.</p>
    <button type="button" onClick={reset} className="mt-6 rounded-full bg-navy px-6 py-2 text-sm font-semibold text-cream">Try again</button>
  </div>;
}
