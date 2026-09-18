import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import SiteFooter from "./site-footer";
import MobileBottomNav from "./mobile-bottom-nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Shared application chrome for public and authenticated pages.
 * Authentication may reveal role-specific destinations, but it must never
 * replace the site's navigation model or move the main content unexpectedly.
 */
export default async function HubShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  let unreadNotifications = 0;
  if (user && isSupabaseConfigured()) {
    const db = await createServerClient();
    const result = await db.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null);
    unreadNotifications = result.count ?? 0;
  }

  return (
    <div className="theme-dark flex h-full flex-col overflow-hidden bg-content-bg">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <div className="hidden lg:block">
          <Sidebar role={user?.role ?? "student"} name={user?.name} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} unreadNotifications={unreadNotifications} />
          <main id="main-content" className="hub-unified-backdrop min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
            {children}
            <SiteFooter />
          </main>
        </div>
      </div>
      <MobileBottomNav user={user} />
    </div>
  );
}
