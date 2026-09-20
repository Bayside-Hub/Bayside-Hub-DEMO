import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import QRCode from "qrcode";
import ActionFeedbackForm from "@/components/action-feedback-form";
import { createServerClient } from "@/lib/supabase/server";
import type { ClubShareLinkRow } from "@/lib/supabase/types";
import { createClubShareLink, revokeClubShareLink } from "../actions";

const input = "h-10 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";

async function requestOrigin() {
  const values = await headers();
  const host = values.get("x-forwarded-host") ?? values.get("host") ?? "localhost:3000";
  const protocol = values.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function FairQrPanel({ clubId, clubName }: { clubId: string; clubName: string }) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("club_share_links").select("*").eq("club_id", clubId).order("created_at", { ascending: false }).limit(12);
  const links: ClubShareLinkRow[] = data ?? [];
  const origin = await requestOrigin();
  const rows = await Promise.all(links.map(async (link) => {
    const url = `${origin}/clubs/visit/${link.id}`;
    return {
      ...link,
      url,
      qr: await QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: "#080d20", light: "#ffffff" } }),
    };
  }));

  return <section id="fair-qr" className="scroll-mt-28 rounded-[20px] border border-line bg-card p-5 shadow-sm" aria-labelledby="fair-qr-title">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-powder">Club fair</p>
    <h2 id="fair-qr-title" className="mt-1 text-xl font-bold text-ink">Expiring QR code</h2>
    <p className="mt-2 text-sm leading-6 text-muted">Display or print a QR code that opens this Club page. It stops working automatically at the selected time.</p>
    <ActionFeedbackForm action={createClubShareLink} className="mt-4 grid gap-3">
      <input type="hidden" name="club_id" value={clubId} />
      <label className="text-sm font-medium text-ink">Label<input name="label" required minLength={3} maxLength={120} defaultValue="Club Fair" className={`${input} mt-1`} /></label>
      <label className="text-sm font-medium text-ink">Expires at<input type="datetime-local" name="expires_at" required className={`${input} mt-1`} /></label>
      <button className="h-10 rounded-full bg-navy px-5 font-bold text-cream">Generate QR code</button>
    </ActionFeedbackForm>
    {rows.length ? <div className="mt-5 space-y-4">{rows.map((link) => {
      // This server-rendered status intentionally reflects the current request time.
      // eslint-disable-next-line react-hooks/purity
      const expired = new Date(link.expires_at).getTime() <= Date.now();
      const usable = link.active && !expired;
      return <article key={link.id} className="rounded-control border border-line bg-content-bg p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Image src={link.qr} alt={`QR code for ${clubName}`} width={144} height={144} unoptimized className={`size-36 rounded-md ${usable ? "" : "opacity-35"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-powder">{usable ? "Open" : expired ? "Expired" : "Revoked"}</p>
            <h3 className="mt-1 font-semibold text-ink">{link.label}</h3>
            <p className="mt-2 text-xs text-muted">Expires {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(link.expires_at))}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {usable ? <Link href={link.url} target="_blank" className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-cream">Test link</Link> : null}
              <a href={link.qr} download={`${clubName.replaceAll(" ", "-").toLowerCase()}-club-fair-qr.png`} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink">Download PNG</a>
              {usable ? <ActionFeedbackForm action={revokeClubShareLink}><input type="hidden" name="club_id" value={clubId} /><input type="hidden" name="link_id" value={link.id} /><button className="rounded-full border border-[#c94b39] px-3 py-1.5 text-xs font-semibold text-[#a5382a]">Revoke</button></ActionFeedbackForm> : null}
            </div>
          </div>
        </div>
      </article>;
    })}</div> : <p className="mt-4 rounded-control bg-content-bg p-4 text-sm text-muted">No fair QR codes yet.</p>}
  </section>;
}
