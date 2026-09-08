"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "./icons";
import { adminNavItems, isNavItemActive, isSubItemActive, mainNavItems, type NavItem } from "./sidebar";
import type { Role, SessionUser } from "@/lib/supabase/types";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MobileNavItem({ item, pathname, role, expanded, onToggle, onNavigate }: {
  item: NavItem;
  pathname: string;
  role: Role;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (item.adminOnly && !["staff", "admin"].includes(role)) return null;
  const Icon = item.icon;
  const active = isNavItemActive(pathname, item);
  const submenuId = `mobile-nav-${item.href.replace(/[^a-z]/gi, "") || "home"}`;

  return (
    <div className="mb-1">
      <div className={`flex items-center rounded-xl ${active ? "bg-[#263a99] text-cream" : "text-cream/75 hover:bg-white/[0.07] hover:text-cream"}`}>
        <Link href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-sm font-semibold">
          <Icon className="h-5 w-5 shrink-0" />
          <span>{item.label}</span>
        </Link>
        {item.sub ? (
          <button type="button" aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`} aria-expanded={expanded} aria-controls={submenuId} onClick={onToggle} className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-white/10">
            <Chevron open={expanded} />
          </button>
        ) : null}
      </div>

      {item.sub && expanded ? (
        <div id={submenuId} className="ml-[22px] mt-1 space-y-0.5 border-l border-white/15 py-1 pl-4">
          {item.sub.map((subItem) => {
            if (subItem.roles && !subItem.roles.includes(role)) return null;
            const subActive = isSubItemActive(pathname, subItem.href);
            return (
              <Link key={subItem.href} href={subItem.href} aria-current={subActive ? "page" : undefined} onClick={onNavigate} className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${subActive ? "bg-white/10 text-cream" : "text-cream/55 hover:bg-white/[0.06] hover:text-cream"}`}>
                {subItem.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function MobileNav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const role = user?.role ?? "student";

  const closeMenu = useCallback(() => {
    setOpen(false);
    setOpenSection(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([tabindex="-1"])')];
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
    // A resized desktop window must not keep a hidden drawer/focus trap active.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onViewportChange = () => { if (desktop.matches) closeMenu(); };
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onViewportChange);
    };
  }, [closeMenu, open]);

  const renderItem = (item: NavItem) => (
    <MobileNavItem
      key={item.href}
      item={item}
      pathname={pathname}
      role={role}
      expanded={openSection === item.href}
      onToggle={() => setOpenSection((current) => current === item.href ? null : item.href)}
      onNavigate={closeMenu}
    />
  );

  return (
    <div className="flex items-center lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => {
          setOpenSection(mainNavItems.find((item) => item.sub && isNavItemActive(pathname, item))?.href ?? null);
          setOpen(true);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-powder"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden><path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>

      {open ? (
        <div ref={dialogRef} className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" tabIndex={-1} className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-[2px]" onClick={closeMenu} aria-label="Close navigation menu" />
          <div className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col overflow-hidden border-r border-white/10 bg-[#090a0b] text-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3 font-display text-lg font-extrabold tracking-tight">
                <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-cream text-navy"><LogoMark className="h-5 w-6" /></span>
                Bayside Hub
              </Link>
              <button ref={closeRef} type="button" aria-label="Close menu" onClick={closeMenu} className="flex h-10 w-10 items-center justify-center rounded-full text-cream/65 transition-colors hover:bg-white/10 hover:text-cream">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile navigation">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35">Explore</p>
              {mainNavItems.map(renderItem)}
              {["staff", "admin"].includes(role) ? (
                <>
                  <div className="mx-3 my-4 h-px bg-white/10" aria-hidden />
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35">Manage</p>
                  {adminNavItems.map(renderItem)}
                </>
              ) : null}
            </nav>

            <div className="border-t border-white/10 p-4">
              <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/75 hover:bg-white/[0.07] hover:text-cream">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream font-bold text-navy">{user?.name?.[0]?.toUpperCase() ?? "H"}</span>
                <span className="min-w-0"><span className="block truncate">{user?.name ?? "Sign in"}</span><span className="block text-[10px] font-medium uppercase tracking-wider text-cream/35">{user ? role : "Account"}</span></span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
