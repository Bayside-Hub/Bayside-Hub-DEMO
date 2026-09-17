import { NextResponse } from "next/server";
import { getSearchResults } from "@/lib/search";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  let query = "";
  try {
    query = new URL(request.url).searchParams.get("q")?.normalize("NFKC").slice(0, 80) ?? "";
  } catch {
    return NextResponse.json({ results: [] }, { status: 400 });
  }
  const cacheHeaders = { "Cache-Control": "private, no-store" };
  if (query.trim().length < 2) {
    return NextResponse.json({ results: [] }, { status: 200, headers: cacheHeaders });
  }
  let results;
  try {
    results = await getSearchResults(query);
  } catch (error) {
    if (isSupabaseConfigured()) {
      try {
        const db = await createServerClient();
        await db.rpc("record_system_error", { p_source: "site-search", p_message: error instanceof Error ? error.message : "Search failed", p_context: {} });
      } catch {
        // Preserve the original search failure.
      }
    }
    return NextResponse.json({ results: [], error: "Search is temporarily unavailable." }, { status: 503, headers: cacheHeaders });
  }
  if (isSupabaseConfigured()) {
    try {
      const db = await createServerClient();
      await db.rpc("record_search_analytics", { p_query: query, p_result_count: results.length });
    } catch {
      // Analytics must never make search unavailable.
    }
  }

  return NextResponse.json(
    { results },
    { headers: cacheHeaders },
  );
}
