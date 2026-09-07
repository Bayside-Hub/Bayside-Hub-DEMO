"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LogoMark,
  HomeIcon,
  MegaphoneIcon,
  ClubsIcon,
  CalendarIcon,
  OpportunitiesIcon,
  SupportIcon,
  InfoIcon,
  AdminIcon,
  UserIcon,
} from "./icons";
import type { Role } from "@/lib/supabase/types";

export type SubItem = { href: string; label: string; roles?: Role[] };

export type NavItem = {
  href: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  sub?: SubItem[];
  adminOnly?: boolean;
};

export const mainNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/announcements", label: "Announcements", icon: MegaphoneIcon },
  {
    href: "/clubs",
    label: "Activities & Clubs",
    icon: ClubsIcon,
    sub: [
      { href: "/clubs", label: "All Clubs" },
      { href: "/clubs/quiz", label: "Club 101 Quiz" },
      { href: "/clubs/manage", label: "Manage My Clubs" },
      { href: "/clubs/apply", label: "Apply for a New Club" },
      { href: "/sports", label: "Sports" },
      { href: "/events", label: "Events" },
      { href: "/spirit-week", label: "Spirit Week" },
    ],
  },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  {
    href: "/opportunities",
    label: "Opportunities",
    icon: OpportunitiesIcon,
    sub: [
      { href: "/opportunities", label: "All Opportunities" },
      { href: "/opportunities/all?type=Elections", label: "Elections" },
      { href: "/opportunities/internships", label: "Internships" },
      { href: "/opportunities/scholarships", label: "Scholarships" },
      { href: "/opportunities/pre-college", label: "College Prep" },
      { href: "/opportunities/community-service", label: "Community Service" },
    ],
  },
  {
    href: "/support",
    label: "Support",
    icon: SupportIcon,
    sub: [
      { href: "/support", label: "Support Home" },
      { href: "/support#club-support", label: "Club Support" },
      { href: "/support#technical-support", label: "Technical Support" },
      { href: "/support/manual", label: "User Manual" },
    ],
  },
  { href: "/about", label: "About Us", icon: InfoIcon },
];

export const adminNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Administration",
    icon: AdminIcon,
    adminOnly: true,
    sub: [
      { href: "/admin", label: "Admin Home" },
      { href: "/admin/announcements", label: "Post Announcement" },
      { href: "/admin/clubs", label: "Manage Clubs" },
      { href: "/admin/support", label: "Support Requests" },
      { href: "/admin/opportunities", label: "Manage Opportunities" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/users", label: "Manage Users", roles: ["admin"] },
    ],
  },
];

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.href === "/") return pathname === "/";
  if (item.href === "/clubs") {
    return pathname.startsWith("/clubs") || pathname.startsWith("/events") || pathname === "/sports" || pathname === "/spirit-week";
  }
  return pathname.startsWith(item.href);
}

export function isSubItemActive(pathname: string, href: string) {
  const destination = href.split(/[?#]/)[0];
  if (["/clubs", "/opportunities", "/support", "/admin"].includes(destination)) return pathname === destination;
  return pathname === destination || pathname.startsWith(`${destination}/`);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesktopNavItem({ item, pathname, role, expanded, onToggle, onNavigate }: {
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
  const submenuId = `desktop-nav-${item.href.replace(/[^a-z]/gi, "") || "home"}`;

  return (
    <div className="mb-1">
      <div className={`flex items-center rounded-[11px] transition-colors ${active ? "bg-[#263a99] text-cream shadow-[0_8px_24px_rgba(38,58,153,.25)]" : "text-cream/72 hover:bg-white/[0.07] hover:text-cream"}`}>
        <Link href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm font-semibold">
          <Icon className="h-[19px] w-[19px] shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
        {item.sub ? (
          <button type="button" aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`} aria-expanded={expanded} aria-controls={submenuId} onClick={onToggle} className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-current transition-colors hover:bg-white/10">
            <Chevron open={expanded} />
          </button>
        ) : null}
      </div>

      {item.sub && expanded ? (
        <div id={submenuId} className="ml-[21px] mt-1 space-y-0.5 border-l border-white/15 py-1 pl-4">
          {item.sub.map((subItem) => {
            if (subItem.roles && !subItem.roles.includes(role)) return null;
            const subActive = isSubItemActive(pathname, subItem.href);
            return (
              <Link key={subItem.href} href={subItem.href} aria-current={subActive ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-[13px] font-medium leading-5 transition-colors ${subActive ? "bg-white/10 text-cream" : "text-cream/55 hover:bg-white/[0.06] hover:text-cream"}`}>
                {subItem.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({ role = "student" }: { role?: Role }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(() =>
    [...mainNavItems, ...adminNavItems].find((item) => item.sub && isNavItemActive(pathname, item))?.href ?? null,
  );

  return (
    <aside aria-label="Primary navigation" className="z-40 flex h-full w-60 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#090a0b]/95 text-cream shadow-[18px_0_45px_-36px_rgba(151,191,244,.75)] backdrop-blur-xl">
      <Link href="/" aria-label="Bayside Hub home" className="mx-3 mt-4 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06]">
        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-cream text-navy shadow-[0_6px_20px_rgba(252,241,221,.14)]">
          <LogoMark className="h-5 w-6" />
        </span>
        <span className="font-display text-[17px] font-extrabold tracking-tight">Bayside Hub</span>
      </Link>

      <div className="mx-4 my-3 h-px bg-white/10" aria-hidden />

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35">Explore</p>
        {mainNavItems.map((item) => (
          <DesktopNavItem key={item.href} item={item} pathname={pathname} role={role} expanded={openMenu === item.href} onToggle={() => setOpenMenu((current) => current === item.href ? null : item.href)} onNavigate={() => setOpenMenu(null)} />
        ))}

        {["staff", "admin"].includes(role) ? (
          <>
            <div className="mx-3 my-3 h-px bg-white/10" aria-hidden />
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35">Manage</p>
            {adminNavItems.map((item) => (
              <DesktopNavItem key={item.href} item={item} pathname={pathname} role={role} expanded={openMenu === item.href} onToggle={() => setOpenMenu((current) => current === item.href ? null : item.href)} onNavigate={() => setOpenMenu(null)} />
            ))}
          </>
        ) : null}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/72 transition-colors hover:bg-white/[0.07] hover:text-cream">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.05]"><UserIcon className="h-4 w-4" /></span>
          <span className="min-w-0"><span className="block">My Profile</span><span className="block text-[10px] font-medium uppercase tracking-wider text-cream/35">{role}</span></span>
        </Link>
      </div>
    </aside>
  );
}
