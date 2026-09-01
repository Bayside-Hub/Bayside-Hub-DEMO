"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { parseOptionalIsoDateTime } from "@/lib/input-validation";

export type SupportActionState = { ok: boolean; message: string } | null;

const requestTypes = [
  "technical",
  "club_support",
  "room_reservation",
  "funding",
  "fundraising_finance",
  "charter",
] as const;

export async function submitSupportRequest(
  _previous: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in before submitting a request." };
  if (!isSupabaseConfigured()) return { ok: false, message: "Support requests are unavailable until Supabase is configured." };

  const requestType = String(formData.get("request_type") ?? "technical");
  const subject = String(formData.get("subject") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const requestedFor = String(formData.get("requested_for") ?? "").trim();
  if (!requestTypes.includes(requestType as (typeof requestTypes)[number])) {
    return { ok: false, message: "Choose a valid request type." };
  }
  if (subject.length < 3 || subject.length > 120 || details.length < 10 || details.length > 4000) {
    return { ok: false, message: "Enter a subject and 10–4000 characters of details." };
  }
  const requestedForIso = parseOptionalIsoDateTime(requestedFor);
  if (requestedForIso === undefined) {
    return { ok: false, message: "Enter a valid requested date and time." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("support_requests").insert({
    request_type: requestType as (typeof requestTypes)[number],
    submitted_by: user.id,
    subject,
    details,
    requested_for: requestedForIso,
  });
  if (error) return { ok: false, message: "Couldn't submit the request. Please try again." };
  revalidatePath("/support");
  revalidatePath("/profile");
  return { ok: true, message: "Request submitted. You can track its status below." };
}
