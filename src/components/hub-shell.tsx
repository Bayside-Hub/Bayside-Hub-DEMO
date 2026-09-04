import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

/**
 * Shared application chrome for public and authenticated pages.
 * Authentication may reveal role-specific destinations, but it must never
 * replace the site's navigation model or move the main content unexpectedly.
 */
export default async function HubShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="theme-dark flex h-full overflow-hidden bg-content-bg">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="hidden md:block">
        <Sidebar role={user?.role ?? "student"} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
