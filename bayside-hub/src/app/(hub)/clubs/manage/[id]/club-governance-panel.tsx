import {
  addClubAdvisor,
  addClubOfficer,
  deleteClubImage,
  removeClubOfficer,
  updateClubCompliance,
  uploadClubImage,
} from "../actions";
import type { ClubAdvisorRow, ClubAuditLogRow, ClubComplianceRow, ClubMediaRow, ClubOfficerRow, Role } from "@/lib/supabase/types";

const input = "h-10 w-full rounded-control border border-line bg-content-bg px-3 text-sm text-ink";

export default function ClubGovernancePanel({
  clubId,
  role,
  canGovern,
  officers,
  advisors,
  media,
  history,
  compliance,
}: {
  clubId: string;
  role: Role;
  canGovern: boolean;
  officers: ClubOfficerRow[];
  advisors: ClubAdvisorRow[];
  media: ClubMediaRow[];
  history: ClubAuditLogRow[];
  compliance: ClubComplianceRow | null;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="card-gradient rounded-[10px] p-6">
        <h2 className="font-display text-xl font-bold uppercase text-cream">Board &amp; advisors</h2>
        <p className="mt-2 text-sm text-cream/65">Board access is club-specific. Students keep their student account and may serve on more than one board.</p>
        <div className="mt-4 space-y-2">
          {officers.map((officer) => (
            <div key={officer.id} className="flex items-center justify-between gap-3 rounded-control border border-line p-3 text-sm">
              <div><p className="font-semibold text-cream">{officer.display_name ?? "Student officer"}</p><p className="text-cream/60">{officer.title}</p></div>
              {canGovern ? <form action={removeClubOfficer}><input type="hidden" name="club_id" value={clubId} /><input type="hidden" name="officer_id" value={officer.id} /><button className="text-xs font-semibold text-orange">Remove</button></form> : null}
            </div>
          ))}
          {advisors.map((advisor) => <div key={advisor.id} className="rounded-control border border-line p-3 text-sm"><p className="font-semibold text-cream">{advisor.display_name ?? "Faculty advisor"}</p><p className="text-cream/60">Advisor{advisor.contact_email ? ` · ${advisor.contact_email}` : ""}</p></div>)}
        </div>
        {canGovern ? (
          <form action={addClubOfficer} className="mt-5 grid gap-3 border-t border-line pt-5">
            <h3 className="font-semibold text-cream">Add board member</h3>
            <p className="text-xs text-cream/60">The student must already be an active member of this club.</p>
            <input type="hidden" name="club_id" value={clubId} />
            <input type="email" name="email" required placeholder="Student school email" className={input} />
            <input name="title" required minLength={2} maxLength={80} placeholder="Position, e.g. President" className={input} />
            <div className="grid grid-cols-2 gap-3"><input type="date" name="term_start" aria-label="Term start" className={input} /><input type="date" name="term_end" aria-label="Term end" className={input} /></div>
            <button className="h-10 rounded-full bg-cream px-5 font-bold text-black">Add to board</button>
          </form>
        ) : null}
        {["staff", "admin"].includes(role) ? (
          <form action={addClubAdvisor} className="mt-5 grid gap-3 border-t border-line pt-5">
            <h3 className="font-semibold text-cream">Add faculty advisor</h3>
            <input type="hidden" name="club_id" value={clubId} />
            <input type="email" name="email" required placeholder="Faculty school email" className={input} />
            <button className="h-10 rounded-full border border-cream px-5 font-bold text-cream">Add advisor</button>
          </form>
        ) : null}
      </section>

      <section className="card-gradient rounded-[10px] p-6">
        <h2 className="font-display text-xl font-bold uppercase text-cream">Public photo gallery</h2>
        <p className="mt-2 text-sm text-cream/65">JPEG, PNG, WebP, or GIF; maximum 5 MB. Alt text is required for accessibility.</p>
        <form action={uploadClubImage} className="mt-4 grid gap-3">
          <input type="hidden" name="club_id" value={clubId} />
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-sm text-cream" />
          <input name="title" maxLength={120} placeholder="Photo title (optional)" className={input} />
          <input name="alt_text" required maxLength={240} placeholder="Describe the photo for screen-reader users" className={input} />
          <button className="h-10 rounded-full bg-cream px-5 font-bold text-black">Upload photo</button>
        </form>
        {media.length ? <ul className="mt-5 space-y-2">{media.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 rounded-control border border-line p-3 text-sm"><div><p className="font-semibold text-cream">{item.title ?? "Club photo"}</p><p className="line-clamp-1 text-cream/60">{item.alt_text}</p></div><form action={deleteClubImage}><input type="hidden" name="club_id" value={clubId} /><input type="hidden" name="media_id" value={item.id} /><button className="text-xs font-semibold text-orange">Delete</button></form></li>)}</ul> : <p className="mt-4 text-sm text-cream/60">No photos uploaded yet.</p>}
      </section>

      <section className="card-gradient rounded-[10px] p-6 lg:col-span-2">
        <h2 className="font-display text-xl font-bold uppercase text-cream">Annual club requirements</h2>
        <p className="mt-2 text-sm text-cream/65">Based on the BHS Club Manual. Do not enter student names or S.O. card numbers here.</p>
        <form action={updateClubCompliance} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="club_id" value={clubId} />
          <label className="text-sm text-cream">School year<input name="school_year" required pattern="[0-9]{4}-[0-9]{4}" placeholder="2026-2027" defaultValue={compliance?.school_year ?? "2026-2027"} className={`${input} mt-1`} /></label>
          <label className="text-sm text-cream">Roster count<input type="number" name="roster_count" required min={0} max={10000} defaultValue={compliance?.roster_count ?? 0} className={`${input} mt-1`} /><span className="mt-1 block text-xs text-cream/50">A charter requires at least 10 interested students.</span></label>
          <div className="grid gap-2 text-sm text-cream sm:col-span-2 lg:col-span-1">
            {[
              ["constitution_on_file", "Constitution on file", compliance?.constitution_on_file],
              ["college_alignment_on_file", "College Alignment Form on file", compliance?.college_alignment_on_file],
              ["annual_event_completed", "Annual event completed", compliance?.annual_event_completed],
              ["community_service_completed", "Community service completed", compliance?.community_service_completed],
              ["fundraiser_completed", "Fundraiser completed", compliance?.fundraiser_completed],
            ].map(([name, label, checked]) => <label key={String(name)} className="flex items-center gap-2"><input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} /> {String(label)}</label>)}
          </div>
          <button className="h-10 rounded-full bg-cream px-5 font-bold text-black sm:col-span-2 lg:col-span-3">Save annual checklist</button>
        </form>
      </section>

      <section className="card-gradient rounded-[10px] p-6 lg:col-span-2">
        <h2 className="font-display text-xl font-bold uppercase text-cream">Change history</h2>
        <p className="mt-2 text-sm text-cream/65">Append-only records identify what changed and when for review or investigation.</p>
        {history.length ? <ol className="mt-4 divide-y divide-line">{history.map((entry) => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><p className="text-cream"><span className="font-semibold capitalize">{entry.action}</span> {entry.entity_type.replaceAll("_", " ")}</p><p className="text-xs text-cream/60">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}{entry.actor_id ? ` · actor ${entry.actor_id.slice(0, 8)}` : " · system"}</p></li>)}</ol> : <p className="mt-4 text-sm text-cream/60">No recorded changes yet. History starts after the governance migration is applied.</p>}
      </section>
    </div>
  );
}
