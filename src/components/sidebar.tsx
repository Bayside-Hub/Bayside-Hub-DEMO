"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

type SubItem = { href: string; label: string; roles?: Role[] };

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
  { href: "/clubs", label: "Activities & Clubs", icon: ClubsIcon, sub: [
    { href: "/clubs", label: "All Clubs" },
    { href: "/clubs/quiz", label: "Club 101 Quiz" },
    { href: "/clubs/manage", label: "Manage My Clubs" },
    { href: "/clubs/apply", label: "Apply for a New Club" },
    { href: "/sports", label: "Sports" },
    { href: "/events", label: "Events" },
    { href: "/spirit-week", label: "Spirit Week" },
  ] },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  {
    href: "/opportunities",
    label: "Opportunities",
    icon: OpportunitiesIcon,
    sub: [
      { href: "/opportunities", label: "All Opportunities" },
      { href: "/opportunities#elections", label: "Elections" },
      { href: "/opportunities#internships", label: "Internships" },
      { href: "/opportunities#college-prep", label: "College Prep" },
      { href: "/opportunities#community-service", label: "Community Service" },
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
    label: "Admin",
    icon: AdminIcon,
    adminOnly: true,
    sub: [
      { href: "/admin", label: "Home" },
      { href: "/admin/announcements", label: "Post Announcement" },
      { href: "/admin/clubs", label: "Manage Clubs" },
      { href: "/admin/support", label: "Support Requests" },
      { href: "/admin/opportunities", label: "Manage Opportunities" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/users", label: "Manage Users", roles: ["admin"] },
    ],
  },
];

function NavIconRow({
  item,
  pathname,
  role,
}: {
  item: NavItem;
  pathname: string;
  role: Role;
}) {
  if (item.adminOnly && !["staff", "admin"].includes(role)) return null;
  const Icon = item.icon;
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <div className="group relative w-[35px] shrink-0">
      <Link
        href={item.href}
        aria-label={item.label}
        // Items with a flyout already have a visible label. A native title
        // tooltip would overlap that menu (especially at high browser zoom).
        title={item.sub ? undefined : item.label}
        aria-haspopup={item.sub ? "menu" : undefined}
        aria-current={active ? "page" : undefined}
        className={`flex h-[35px] w-full items-center justify-center rounded-nav px-[7px] transition-colors ${
          active
            ? "bg-sidebar-surface text-cream"
            : "text-cream/80 hover:bg-sidebar-surface/60 hover:text-cream"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
      </Link>
      {!item.sub && (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-line bg-[#101426] px-3 py-2 text-xs font-semibold text-cream shadow-xl group-hover:block group-focus-within:block">
          {item.label}
        </span>
      )}
      {item.sub && (
        <div
          role="menu"
          className="pointer-events-none absolute left-full top-0 z-50 ml-2 hidden max-h-[calc(100vh-2rem)] w-64 max-w-[calc(100vw-5rem)] overflow-y-auto rounded-light border border-line bg-card p-1.5 shadow-xl group-focus-within:pointer-events-auto group-hover:pointer-events-auto group-hover:block group-focus-within:block"
        >
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
            {item.label}
          </p>
          {item.sub.map((s) => {
            if (s.roles && !s.roles.includes(role)) return null;
            const subActive = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                role="menuitem"
                aria-current={subActive ? "page" : undefined}
                className={`block rounded-control px-3 py-2 text-sm font-medium leading-5 transition-colors ${
                  subActive ? "bg-navy text-cream" : "text-ink hover:bg-content-bg"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  role = "student",
}: {
  role?: Role;
}) {
  const pathname = usePathname();

  return (
    <aside aria-label="Primary navigation" className="z-40 flex h-full w-16 shrink-0 flex-col items-center gap-nav overflow-visible border-r border-white/10 bg-sidebar-bg/95 px-3.5 py-4 shadow-[12px_0_40px_-32px_rgba(151,191,244,.8)] backdrop-blur-xl">
      <Link
        href="/"
        aria-label="Bayside Hub home"
        title="Bayside Hub"
        className="mb-1 flex h-[42px] w-[35px] shrink-0 items-center justify-center pb-[7px]"
      >
        <LogoMark className="h-[22px] w-[25px] shrink-0 text-cream" />
      </Link>

      {mainNavItems.map((item) => (
        <NavIconRow key={item.href} item={item} pathname={pathname} role={role} />
      ))}

      <div className="mx-auto h-px w-[27px] shrink-0 bg-sidebar-surface" aria-hidden />

      {adminNavItems.map((item) => (
        <NavIconRow key={item.href} item={item} pathname={pathname} role={role} />
      ))}

      <div className="mt-auto flex w-[35px] flex-col items-center gap-nav">
        <Link
          href="/profile"
          aria-label="Profile"
          title="Profile"
          className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-sidebar-surface bg-sidebar-bg text-cream transition-colors hover:border-cream/40"
        >
          <UserIcon className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
