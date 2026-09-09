"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import "./sidebar.css";
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
  { href: "/announcements", label: "Announcements", icon: MegaphoneIcon, sub: [
    { href: "/announcements", label: "All Announcements" },
    { href: "/announcements/submit", label: "Submit for Review" },
  ] },
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
      { href: "/manage/site", label: "Site Text Editor" },
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
      { href: "/admin/review", label: "Announcement Review", roles: ["admin"] },
      { href: "/admin/announcements", label: "Post Announcement" },
      { href: "/admin/clubs", label: "Manage Clubs" },
      { href: "/admin/support", label: "Support Requests" },
      { href: "/admin/opportunities", label: "Manage Opportunities" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/users", label: "Manage Users", roles: ["admin"] },
      { href: "/admin/roles", label: "Custom Roles", roles: ["admin"] },
      { href: "/admin/audit", label: "Management Audit", roles: ["admin"] },
      { href: "/manage/site", label: "Site Text Editor", roles: ["admin"] },
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
  if (href.includes("#") || href.includes("?")) return false;
  const destination = href.split(/[?#]/)[0];
  if (["/clubs", "/opportunities", "/support", "/admin"].includes(destination)) return pathname === destination;
  return pathname === destination || pathname.startsWith(`${destination}/`);
}

/** Figma rail icons are committed exports, not approximated glyphs. */
const railAssets: Record<string, string> = {
  "/": "home", "/announcements": "mail", "/clubs": "users",
  "/calendar": "calendar", "/opportunities": "briefcase",
  "/support": "question", "/about": "form", "/admin": "shield",
  "/clubs/manage": "users",
};

function RailIcon({ name }: { name: string }) {
  return <Image src={`/navigation/${name}.svg`} width={24} height={24} alt="" aria-hidden />;
}

/** Native popovers live in the browser top layer, above content stacking contexts. */
function RailItem({ item, pathname, role }: { item: NavItem; pathname: string; role: Role }) {
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const active = isNavItemActive(pathname, item);
  const classes = `rail-control ${active ? "rail-control-active" : ""}`;

  useEffect(() => {
    const close = () => panel.current?.hidePopover();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && panel.current?.matches(":popover-open")) {
        close();
        trigger.current?.focus();
      }
    };
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function position() {
    const node = panel.current;
    const button = trigger.current;
    if (!node || !button) return;
    const rect = button.getBoundingClientRect();
    node.style.left = `${(button.closest("aside")?.getBoundingClientRect().right ?? rect.right) + 8}px`;
    node.style.top = `${Math.max(12, Math.min(rect.top, window.innerHeight - node.offsetHeight - 12))}px`;
  }

  const glyph = <RailIcon name={railAssets[item.href] ?? "form"} />;
  if (!item.sub) return <Link href={item.href} aria-label={item.label} title={item.label} aria-current={active ? "page" : undefined} className={classes}>{glyph}</Link>;
  return (
    <div>
      <button ref={trigger} type="button" className={classes} title={item.label} aria-label={item.label} aria-expanded={expanded} aria-controls={id} popoverTarget={id}>{glyph}</button>
      <div ref={panel} id={id} popover="auto" className="rail-popover" aria-label={item.label}
        onToggle={(event) => {
          const isOpen = event.newState === "open";
          setExpanded(isOpen);
          if (isOpen) position();
        }}>
        <p className="px-3 pb-2 pt-1 text-xs font-medium tracking-wide text-white/60">{item.label}</p>
        {item.sub.filter(sub => !sub.roles || sub.roles.includes(role)).map(sub => (
          <Link key={sub.href} href={sub.href} aria-current={isSubItemActive(pathname, sub.href) ? "page" : undefined}
            onClick={() => panel.current?.hidePopover()}
            className="rail-sub-link">{sub.label}</Link>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ role = "student", name }: { role?: Role; name?: string }) {
  const pathname = usePathname();
  const [contrast, setContrast] = useState(false);
  const groups = [
    { label: "General", items: mainNavItems.filter(item => !["/support", "/about"].includes(item.href)) },
    { label: "Myspace", items: [
      { href: "/clubs/manage", label: "Manage My Clubs", icon: ClubsIcon },
      ...(["staff", "admin"].includes(role) ? adminNavItems : []),
    ] },
    { label: "Support", items: mainNavItems.filter(item => ["/support", "/about"].includes(item.href)) },
  ];
  const initials = name?.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
  return (
    <aside aria-label="Primary navigation" className={`figma-rail ${contrast ? "figma-rail-contrast" : ""}`}>
      <Link href="/" aria-label="Bayside Hub home" title="Bayside Hub" className="rail-brand"><LogoMark className="h-6 w-6" /></Link>
      <button type="button" aria-label="Search website" title="Search website" className="rail-control rail-search"
        onClick={() => document.getElementById("site-search")?.focus()}><RailIcon name="search" /></button>
      <nav aria-label="Main navigation" className="rail-groups" onScroll={() => {
        document.querySelectorAll<HTMLElement>(".rail-popover:popover-open").forEach(node => node.hidePopover());
      }}>
        {groups.map(group => (
          <section key={group.label} aria-label={group.label} className="rail-group">
            <h2>{group.label}</h2>
            {group.items.map(item => <RailItem key={item.href} item={item} pathname={pathname} role={role} />)}
          </section>
        ))}
      </nav>
      <div className="rail-account">
        <button type="button" className="rail-control" aria-label="Higher contrast navigation" aria-pressed={contrast} title="Higher contrast navigation" onClick={() => setContrast(value => !value)}><RailIcon name="sun" /></button>
        <Link href="/profile" className="rail-avatar" aria-label={name ? `My Profile: ${name}` : "Sign in or view profile"} title={name ?? "My Profile"}>
          {initials || <UserIcon className="h-5 w-5" />}
        </Link>
      </div>
    </aside>
  );
}
