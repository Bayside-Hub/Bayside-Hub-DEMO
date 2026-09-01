"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./icons";
import { adminNavItems, mainNavItems } from "./sidebar";
import type { SessionUser } from "@/lib/supabase/types";

export default function MobileNav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const role = user?.role ?? "student";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("a, button")];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
          <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div ref={dialogRef} className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar-bg px-4 py-5 text-cream shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight"
              >
                <LogoMark className="h-6 w-7 text-cream" />
                Bayside Hub
              </Link>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-sidebar-surface hover:text-cream"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                  <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto">
              {[...mainNavItems, ...adminNavItems].map((item) => {
                if (item.adminOnly && !["staff", "admin"].includes(role)) return null;
                const Icon = item.icon;
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <div key={item.href} className="mb-1">
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-light px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active ? "bg-sidebar-surface text-cream" : "text-cream/80 hover:bg-sidebar-surface/60"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                    {item.sub && (
                      <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
                        {item.sub.map((s) => (
                          s.roles && !s.roles.includes(role) ? null :
                          <Link
                            key={s.href}
                            href={s.href}
                            onClick={() => setOpen(false)}
                            aria-current={pathname === s.href ? "page" : undefined}
                            className="rounded-control px-3 py-1.5 text-sm text-cream/60 transition-colors hover:bg-sidebar-surface/60 hover:text-cream"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-sidebar-surface pt-4">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-light px-3 py-2 text-sm font-semibold text-cream/80 transition-colors hover:bg-sidebar-surface/60 hover:text-cream"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-sm font-bold text-navy">
                  {user?.name?.[0]?.toUpperCase() ?? "H"}
                </span>
                {user?.name ?? "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
