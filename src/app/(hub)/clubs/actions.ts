"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth";
import { clubCategories } from "@/lib/data";
import { getClubBySlug } from "@/lib/clubs";
import type { ClubChatMessage } from "@/lib/supabase/types";

export type ActionState = { ok: boolean; message: string } | null;

export async function submitClubApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Please sign in with your NYC student account first." };
  }
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase is not configured. Add the env keys in .env.local to submit.",
    };
  }

  const clubName = String(formData.get("club_name") ?? "").trim();
  const category = String(formData.get("category") ?? "Other").trim();
  const description = String(formData.get("description") ?? "").trim();
  const meetingDays = String(formData.get("meeting_days") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();

  if (clubName.length < 3 || clubName.length > 120) {
    return { ok: false, message: "Club name is required (3–120 characters)." };
  }
  if (!clubCategories.includes(category)) {
    return { ok: false, message: "Pick a valid category." };
  }
  if (description.length < 10 || description.length > 1000) {
    return { ok: false, message: "Description is required (10–1000 characters)." };
  }
  if (meetingDays.length > 100) {
    return { ok: false, message: "Meeting days must be 100 characters or fewer." };
  }
  if (contactEmail.length > 320) {
    return { ok: false, message: "Contact email must be 320 characters or fewer." };
  }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { ok: false, message: "Enter a valid contact email." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("club_applications").insert({
    club_name: clubName,
    category,
    description,
    meeting_days: meetingDays || null,
    contact_email: contactEmail || user.email,
    submitted_by: user.id,
  });

  if (error) {
    return { ok: false, message: "Couldn't submit your application. Try again." };
  }

  revalidatePath("/clubs/apply");
  revalidatePath("/admin/clubs");
  revalidatePath("/admin");
  return {
    ok: true,
    message: "Application submitted! An administrator will review it soon.",
  };
}

export type InterestState = { count: number; joined: boolean; available: boolean };

export async function getClubInterestInfo(slug: string): Promise<InterestState> {
  if (!isSupabaseConfigured() || !(await getClubBySlug(slug))) {
    return { count: 0, joined: false, available: false };
  }

  const user = await getCurrentUser();
  const supabase = await createServerClient();
  const { data: count, error } = await supabase
    .rpc("club_interest_count", { p_slug: slug });
  if (error) return { count: 0, joined: false, available: false };

  let joined = false;
  if (user) {
    const { data: row } = await supabase
      .from("club_interests")
      .select("id")
      .eq("user_id", user.id)
      .eq("club_slug", slug)
      .maybeSingle();
    joined = Boolean(row);
  }
  return { count: Number(count ?? 0), joined, available: true };
}

export async function toggleClubInterest(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!user || !isSupabaseConfigured() || !(await getClubBySlug(slug))) return;

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("club_interests")
    .select("id")
    .eq("user_id", user.id)
    .eq("club_slug", slug)
    .maybeSingle();

  if (existing) {
    await supabase.from("club_interests").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase
      .from("club_interests")
      .insert({ user_id: user.id, club_slug: slug });
    if (error) return;
  }

  revalidatePath(`/clubs/${slug}`);
}

export type MembershipState = {
  available: boolean;
  status: "pending" | "active" | "rejected" | "left" | null;
};

export async function getClubMembershipInfo(clubId?: string): Promise<MembershipState> {
  const user = await getCurrentUser();
  if (!clubId || !user || !isSupabaseConfigured()) return { available: false, status: null };
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("club_memberships")
    .select("status")
    .eq("club_id", clubId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (error) return { available: false, status: null };
  return { available: true, status: data?.status ?? null };
}

export async function requestClubMembership(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const clubId = String(formData.get("club_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!user || !clubId || !slug || !isSupabaseConfigured()) return;

  const supabase = await createServerClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("join_policy")
    .eq("id", clubId)
    .eq("status", "published")
    .maybeSingle();
  if (!club) return;

  const status = club.join_policy === "instant" ? "active" : "pending";
  await supabase.from("club_memberships").upsert(
    { club_id: clubId, profile_id: user.id, status, requested_at: new Date().toISOString() },
    { onConflict: "club_id,profile_id" },
  );
  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/profile");
}

export async function leaveClub(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const clubId = String(formData.get("club_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!user || !clubId || !slug || !isSupabaseConfigured()) return;
  const supabase = await createServerClient();
  await supabase
    .from("club_memberships")
    .delete()
    .eq("club_id", clubId)
    .eq("profile_id", user.id);
  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/profile");
}

export type ClubCommunicationState = {
  available: boolean;
  messages: ClubChatMessage[];
};

/** Load member-only chat through a safe RPC that never returns profile emails. */
export async function getClubCommunication(clubId?: string): Promise<ClubCommunicationState> {
  const user = await getCurrentUser();
  if (!clubId || !user || !isSupabaseConfigured()) {
    return { available: false, messages: [] };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("get_club_chat_messages", {
    p_club_id: clubId,
    p_limit: 100,
  });
  if (error) return { available: false, messages: [] };
  return { available: true, messages: data ?? [] };
}

export type ClubMessageActionState = {
  ok: boolean;
  message: string;
} | null;

/** Post a chat message; RLS independently verifies Club access and authorship. */
export async function postClubMessage(
  _previous: ClubMessageActionState,
  formData: FormData,
): Promise<ClubMessageActionState> {
  const user = await getCurrentUser();
  const clubId = String(formData.get("club_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!user) return { ok: false, message: "Sign in to send a message." };
  if (!clubId || !slug || !isSupabaseConfigured()) {
    return { ok: false, message: "Club chat is not available yet." };
  }
  if (body.length < 1 || body.length > 2000) {
    return { ok: false, message: "Messages must be between 1 and 2,000 characters." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("club_messages").insert({
    club_id: clubId,
    author_id: user.id,
    body,
  });
  if (error) return { ok: false, message: "Message not sent. Check your Club membership and try again." };

  revalidatePath(`/clubs/${slug}`);
  return { ok: true, message: "Message sent." };
}

/** Messages are immutable; authors and Club managers may remove them. */
export async function deleteClubMessage(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const clubId = String(formData.get("club_id") ?? "").trim();
  const messageId = String(formData.get("message_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!user || !clubId || !messageId || !slug || !isSupabaseConfigured()) return;

  const supabase = await createServerClient();
  await supabase
    .from("club_messages")
    .delete()
    .eq("id", messageId)
    .eq("club_id", clubId);
  revalidatePath(`/clubs/${slug}`);
}
