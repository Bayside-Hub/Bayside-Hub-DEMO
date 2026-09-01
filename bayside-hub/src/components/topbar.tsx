"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./icons";
import MobileNav from "./mobile-nav";
import SearchBox from "./search-box";
import type { SessionUser } from "@/lib/supabase/types";

function initials(user: SessionUser) {
  const parts = user.name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Topbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header
      className={`flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-content-bg px-4 sm:px-6 ${
        isAdmin ? "theme-light" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav user={user} />
        <Link
          href="/"
          aria-label="Bayside Hub home"
          className="flex h-9 w-9 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-powder md:hidden"
        >
          <LogoMark className="h-5 w-6" />
        </Link>
      </div>
      <SearchBox />
      <div className="flex shrink-0 items-center gap-3">
        {user ? (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-ink">Welcome, {user.name}</p>
              <p className="text-[11px] text-muted">
                {user.email} · {user.role}
              </p>
            </div>
            <Link
              href="/profile"
              title="My Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-sm font-bold text-navy ring-1 ring-line transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              {initials(user)}
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
