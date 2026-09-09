export type SearchResult = {
  kind: "Club" | "Announcement" | "Opportunity" | "Event";
  title: string;
  href: string;
  meta?: string;
};

export const MAX_SEARCH_RESULTS = 50;

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase();

/**
 * Rank matches by relevance instead of returning records in source order.
 * Every query term must occur in the title or metadata, which prevents a
 * common term in one field from producing unrelated results.
 */
export function rankSearchResults(
  results: SearchResult[],
  query: string,
  limit = 24,
): SearchResult[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const boundedLimit = Number.isFinite(limit)
    ? Math.max(0, Math.min(MAX_SEARCH_RESULTS, Math.floor(limit)))
    : 24;
  const seen = new Set<string>();

  return results
    .map((result, index) => {
      if (seen.has(result.href)) return null;
      const title = normalize(result.title);
      const meta = normalize(result.meta ?? "");
      const searchable = `${title} ${meta}`;
      if (!terms.every((term) => searchable.includes(term))) return null;

      let score = 0;
      for (const term of terms) {
        if (title === term) score += 120;
        else if (title.startsWith(term)) score += 80;
        else if (title.includes(term)) score += 45;
        if (meta.includes(term)) score += 12;
        if (new RegExp(`(?:^|[^\\p{L}\\p{N}])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^\\p{L}\\p{N}])`, "u").test(title)) {
          score += 25;
        }
      }
      score += Math.max(0, 10 - index / 100);
      seen.add(result.href);
      return { result, score, index };
    })
    .filter((item): item is { result: SearchResult; score: number; index: number } => item !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, boundedLimit)
    .map((item) => item.result);
}
