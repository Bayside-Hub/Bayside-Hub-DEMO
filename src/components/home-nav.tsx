"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./icons";
import SearchBox from "./search-box";
import { Button, DropdownMenu, type MenuItem } from "./ui";
import type { SessionUser } from "@/lib/supabase/types";

const links: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/announcements", label: "Announcements" },
  { href: "/clubs", label: "Clubs" },
  { href: "/calendar", label: "Calendar" },
];

const dropdowns: { label: string; items: MenuItem[] }[] = [
  {
    label: "More",
    items: [
      { href: "/sports", label: "Sports" },
      { href: "/events", label: "Events" },
      { href: "/spirit-week", label: "Spirit Week" },
      { href: "/clubs/apply", label: "Apply for a New Club" },
      { href: "/about", label: "About Us" },
    ],
  },
  {
    label: "Opportunities",
    items: [
      { href: "/opportunities", label: "All Opportunities" },
      { href: "/opportunities#elections", label: "Elections" },
      { href: "/opportunities#internships", label: "Internships" },
      { href: "/opportunities#college-prep", label: "College Prep" },
      { href: "/opportunities#community-service", label: "Community Service" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/support", label: "Support Home" },
      { href: "/support#technical-support", label: "Technical Support" },
      { href: "/support#club-support", label: "Club Support" },
      { href: "/support/manual", label: "User Manual" },
    ],
  },
];

function initials(user: SessionUser) {
  const parts = user.name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function HomeNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-black/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-1 px-6">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mr-6 flex items-center gap-2.5 font-brand text-lg font-semibold tracking-tight text-cream"
        >
          <LogoMark className="h-6 w-7 text-cream" />
          <span className="hidden sm:block">Bayside Hub</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-powder ${
                  active ? "bg-navy text-cream" : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {dropdowns.map((dd) => (
            <DropdownMenu key={dd.label} label={dd.label} items={dd.items} />
          ))}
        </div>

        <div className="mx-4 hidden min-w-0 flex-1 lg:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <p className="hidden text-right 2xl:block">
                <span className="block text-xs font-medium text-cream">
                  Welcome, {user.name}
                </span>
                <span className="block text-[11px] text-muted">
                  {user.email} · {user.role}
                </span>
              </p>
              <Link
                href="/profile"
                title="My Profile"
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-cream shadow-sm transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy hover:scale-105 sm:flex"
              >
                {initials(user)}
              </Link>
              <form action="/auth/signout" method="post" className="sm:hidden">
                <Button type="submit" variant="peach" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Button
              href="/login"
              variant="peach"
              size="sm"
              className="sm:hidden"
            >
              Sign in
            </Button>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-powder md:hidden"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-line bg-black px-6 pb-6 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-light px-4 py-2.5 text-sm font-semibold ${
                    active ? "bg-navy text-cream" : "text-cream hover:bg-cream/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {dropdowns.map((dd) => (
              <div key={dd.label} className="mt-2">
                <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                  {dd.label}
                </p>
                {dd.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-light px-4 py-2 text-sm font-medium text-cream hover:bg-cream/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-light px-4 py-2.5 text-sm font-semibold text-cream hover:bg-cream/10"
            >
              My Profile
            </Link>
            {user && (
              <form action="/auth/signout" method="post" className="mt-1">
                <button
                  type="submit"
                  className="w-full rounded-light px-4 py-2.5 text-left text-sm font-semibold text-cream hover:bg-cream/10"
                >
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
