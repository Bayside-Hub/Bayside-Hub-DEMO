export type StudentDashboard = {
  activeClubs: { id: string; slug: string; name: string }[];
  pendingMemberships: number;
  pendingApplications: number;
  openSupportRequests: number;
  managedClubCount: number;
};

type DashboardPayload = {
  active_clubs?: unknown;
  pending_memberships?: unknown;
  pending_applications?: unknown;
  open_support_requests?: unknown;
  managed_club_count?: unknown;
};

function safeCount(value: unknown) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

export function parseStudentDashboard(value: unknown): StudentDashboard | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as DashboardPayload;
  const activeClubs = Array.isArray(payload.active_clubs)
    ? payload.active_clubs.flatMap((club) => {
        if (!club || typeof club !== "object") return [];
        const candidate = club as Record<string, unknown>;
        return typeof candidate.id === "string" && typeof candidate.slug === "string" && typeof candidate.name === "string"
          ? [{ id: candidate.id, slug: candidate.slug, name: candidate.name }]
          : [];
      })
    : [];
  return {
    activeClubs,
    pendingMemberships: safeCount(payload.pending_memberships),
    pendingApplications: safeCount(payload.pending_applications),
    openSupportRequests: safeCount(payload.open_support_requests),
    managedClubCount: safeCount(payload.managed_club_count),
  };
}
