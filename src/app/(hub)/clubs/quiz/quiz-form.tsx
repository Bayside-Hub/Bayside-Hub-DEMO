"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Club } from "@/lib/data";
import { rankClubs } from "@/lib/club-quiz";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function QuizForm({ clubs }: { clubs: Club[] }) {
  const [interests, setInterests] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [wantsStem, setWantsStem] = useState(false);
  const [wantsService, setWantsService] = useState(false);
  const [maxCommitment, setMaxCommitment] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const interestOptions = useMemo(() => [...new Set(clubs.flatMap((club) => club.tags?.length ? club.tags : [club.category]))].sort((a, b) => a.localeCompare(b)), [clubs]);

  const results = useMemo(() => rankClubs(clubs, {
    interests,
    days: availableDays,
    wantsStem,
    wantsService,
    maxCommitment,
  }), [clubs, interests, availableDays, wantsStem, wantsService, maxCommitment]);

  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  if (submitted) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">Ranked using real Club tags, your availability, goals, and preferred commitment.</p>
          <button type="button" onClick={() => setSubmitted(false)} className="text-sm font-semibold text-powder hover:text-cream">Edit answers</button>
        </div>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {results.slice(0, 6).map((result, index) => (
            <li key={result.club.slug} className="card-gradient rounded-[10px] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-orange">#{index + 1} · {result.score} points</p>
              <h2 className="mt-2 font-display text-xl font-bold uppercase text-cream">{result.club.name}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">{(result.club.tags ?? [result.club.category]).map((tag) => <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-powder">#{tag}</span>)}</div>
              <ul className="mt-3 space-y-1 text-sm text-cream/75">{result.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
              <Link href={`/clubs/${result.club.slug}`} className="mt-4 inline-flex rounded-full bg-cream px-4 py-2 text-sm font-bold text-black">View club</Link>
            </li>
          ))}
        </ol>
        {!results.length ? <div className="mt-6 rounded-card border border-dashed border-line p-8 text-center"><p className="font-semibold text-cream">No close matches yet.</p><button type="button" onClick={() => setSubmitted(false)} className="mt-3 text-sm font-bold text-powder">Adjust your answers</button></div> : null}
      </div>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="space-y-8">
      <fieldset><legend className="font-display text-xl font-bold uppercase text-cream">1. What interests you?</legend><p className="mt-1 text-sm text-cream/60">Choose any topics that sound like you. These come directly from current Club profiles.</p><div className="mt-3 flex flex-wrap gap-2">{interestOptions.map((interest) => <button key={interest} type="button" aria-pressed={interests.includes(interest)} onClick={() => toggle(interest, interests, setInterests)} className={`rounded-full px-4 py-2 text-sm font-semibold ${interests.includes(interest) ? "bg-orange text-black" : "border border-line text-cream"}`}>{interest}</button>)}</div></fieldset>
      <fieldset><legend className="font-display text-xl font-bold uppercase text-cream">2. When are you available?</legend><div className="mt-3 flex flex-wrap gap-2">{days.map((day) => <button key={day} type="button" aria-pressed={availableDays.includes(day)} onClick={() => toggle(day, availableDays, setAvailableDays)} className={`rounded-full px-4 py-2 text-sm font-semibold ${availableDays.includes(day) ? "bg-orange text-black" : "border border-line text-cream"}`}>{day}</button>)}</div></fieldset>
      <fieldset><legend className="font-display text-xl font-bold uppercase text-cream">3. What do you want to get from a Club?</legend><div className="mt-3 flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm text-cream"><input type="checkbox" checked={wantsStem} onChange={(event) => setWantsStem(event.target.checked)} /> STEM activities</label><label className="flex items-center gap-2 text-sm text-cream"><input type="checkbox" checked={wantsService} onChange={(event) => setWantsService(event.target.checked)} /> Community service</label></div></fieldset>
      <label className="block font-display text-xl font-bold uppercase text-cream">4. Maximum hours per week: {maxCommitment || "Any"}<input type="range" min={0} max={10} value={maxCommitment} onChange={(event) => setMaxCommitment(Number(event.target.value))} className="mt-3 block w-full accent-orange" /></label>
      <button type="submit" className="inline-flex h-12 items-center rounded-[24px] bg-cream px-8 font-bold text-black hover:bg-white">See my matches</button>
    </form>
  );
}
