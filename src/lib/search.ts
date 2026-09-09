import { getAllClubs } from "@/lib/clubs";
import { getAnnouncements } from "@/lib/announcements";
import { isEventUpcoming } from "@/lib/data";
import { getEvents } from "@/lib/events";
import { getOpportunities } from "@/lib/opportunities";
import { rankSearchResults, type SearchResult } from "./search-ranking";

export type { SearchResult } from "./search-ranking";

const SEARCH_SOURCE_LIMIT = 250;

export async function getSearchResults(query: string, limit = 24): Promise<SearchResult[]> {
  const normalized = query.normalize("NFKC").trim();
  if (!normalized) return [];

  const [clubs, announcements, events, opportunities] = await Promise.all([
    getAllClubs(SEARCH_SOURCE_LIMIT),
    getAnnouncements(100),
    getEvents(SEARCH_SOURCE_LIMIT),
    getOpportunities(SEARCH_SOURCE_LIMIT),
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

  return rankSearchResults(results, normalized, limit);
}
