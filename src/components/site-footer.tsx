import Link from "next/link";
import { getSiteText } from "@/lib/site-content";

/** Keep support and data-use information accessible from every Hub page. */
export default async function SiteFooter() {
  const text = await getSiteText();
  return <footer className="mt-12 border-t border-white/10 px-5 py-8 text-sm text-cream/65 sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row">
      <div><p className="font-semibold text-cream">Bayside Hub · Closed Beta</p><p className="mt-1 max-w-lg whitespace-pre-wrap break-words text-xs">{text.footer_note}</p></div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3">
        <Link href="/about">About</Link><Link href="/support">Contact & Support</Link><Link href="/support/manual">User Manual</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link>
      </nav>
    </div>
  </footer>;
}
