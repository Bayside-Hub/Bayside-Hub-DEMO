import { isValidOptionalTime } from "./input-validation.ts";

/** Share limits between create and edit so updates cannot bypass validation. */
export function parseMeetingInput(form: FormData) {
  const day = Number(form.get("day_of_week"));
  const start = String(form.get("start_time") ?? "");
  const end = String(form.get("end_time") ?? "");
  const location = String(form.get("location") ?? "").trim();
  const note = String(form.get("recurrence_note") ?? "").trim();
  if (!Number.isInteger(day) || day < 1 || day > 7 || !isValidOptionalTime(start) || !isValidOptionalTime(end)) return null;
  const normalizedStart = start.length === 5 ? `${start}:00` : start;
  const normalizedEnd = end.length === 5 ? `${end}:00` : end;
  if ((start && end && normalizedEnd <= normalizedStart) || location.length > 240 || note.length > 500) return null;
  return { day_of_week: day, start_time: start || null, end_time: end || null, location: location || null, recurrence_note: note || null };
}

export function parseClubPostInput(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (title.length < 3 || title.length > 120 || body.length < 3 || body.length > 4000) return null;
  return { title, body };
}
