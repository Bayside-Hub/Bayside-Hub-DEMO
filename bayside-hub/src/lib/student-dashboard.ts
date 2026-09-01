import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";

export type StudentDashboard = {
  activeClubs: { id: string; slug: string; name: string }[];
  pendingMemberships: number;
  pendingApplications: number;
  openSupportRequests: number;
};

export const getStudentDashboard = cache(async (): Promise<StudentDashboard | null> => {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return null;

  const supabase = await createServerClient();
  // Independent reads run together so dashboard latency stays near the slowest
  // query rather than the sum of all three.
  const [membershipsResult, applicationsResult, supportResult] = await Promise.all([
    supabase.from("club_memberships").select("club_id, status").eq("profile_id", user.id).in("status", ["active", "pending"]),
    supabase.from("club_applications").select("id", { count: "exact", head: true }).eq("submitted_by", user.id).eq("status", "pending"),
    supabase.from("support_requests").select("id", { count: "exact", head: true }).eq("submitted_by", user.id).in("status", ["open", "in_review"]),
  ]);

  const memberships = membershipsResult.data ?? [];
  const activeIds = memberships.filter((membership) => membership.status === "active").map((membership) => membership.club_id);
  const clubsResult = activeIds.length
    ? await supabase.from("clubs").select("id, slug, name").in("id", activeIds)
    : { data: [] as { id: string; slug: string; name: string }[] };

  return {
    activeClubs: clubsResult.data ?? [],
    pendingMemberships: memberships.filter((membership) => membership.status === "pending").length,
    pendingApplications: applicationsResult.count ?? 0,
    openSupportRequests: supportResult.count ?? 0,
  };
});
