import { getAllClubs } from "@/lib/clubs";
import { getAnnouncements } from "@/lib/announcements";
import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import { getOpportunities } from "@/lib/opportunities";

export type SearchResult = {
  kind: "Club" | "Announcement" | "Opportunity" | "Event";
  title: string;
  href: string;
  meta?: string;
};

export async function getSearchResults(query: string, limit = 24): Promise<SearchResult[]> {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];

  const [clubs, announcements, events, opportunities] = await Promise.all([
    getAllClubs(),
    getAnnouncements(100),
    getEvents(),
    getOpportunities(),
  ]);

  const results: SearchResult[] = [
    ...clubs.map((club) => ({
      kind: "Club" as const,
      title: club.name,
      href: `/clubs/${club.slug}`,
      meta: club.category,
    })),
    ...announcements.map((announcement) => ({
      kind: "Announcement" as const,
      title: announcement.title,
      href: `/announcements/${announcement.id}`,
      meta: `${announcement.tag} · ${announcement.date}`,
    })),
    ...opportunities.map((opportunity) => ({
      kind: "Opportunity" as const,
      title: opportunity.title,
      href: `/opportunities/${opportunity.id}`,
      meta: opportunity.type,
    })),
    ...events.filter((event) => isEventUpcoming(event)).map((event) => ({
      kind: "Event" as const,
      title: event.title,
      href: `/events/${event.id}`,
      meta: event.date,
    })),
  ];

  const seen = new Set<string>();
  return results
    .filter((result) =>
      `${result.title} ${result.meta ?? ""}`.toLocaleLowerCase().includes(normalized),
    )
    .filter((result) => !seen.has(result.href) && Boolean(seen.add(result.href)))
    .slice(0, limit);
}
