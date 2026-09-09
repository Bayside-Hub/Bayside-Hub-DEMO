"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function preferredTheme(): Theme {
  const saved = window.localStorage.getItem("bayside-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = preferredTheme();
    document.documentElement.dataset.theme = current;
    document.documentElement.style.colorScheme = current;
    const frame = window.requestAnimationFrame(() => setTheme(current));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("bayside-theme", next);
    setTheme(next);
  }

  const isDark = theme !== "light";
  return <button
    type="button"
    onClick={toggle}
    aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    title={`Switch to ${isDark ? "light" : "dark"} mode`}
    className="theme-toggle flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
  >
    {isDark ? <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42M7.06 16.94l-1.42 1.42" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/></svg>
      : <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>}
  </button>;
}
