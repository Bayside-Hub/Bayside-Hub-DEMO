import { NextResponse } from "next/server";
import { getSearchResults } from "@/lib/search";

export async function GET(request: Request) {
  let query = "";
  try {
    query = new URL(request.url).searchParams.get("q")?.normalize("NFKC").slice(0, 80) ?? "";
  } catch {
    return NextResponse.json({ results: [] }, { status: 400 });
  }
  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    "Vary": "Accept-Encoding",
  };
  if (query.trim().length < 2) {
    return NextResponse.json({ results: [] }, { status: 200, headers: cacheHeaders });
  }
  const results = await getSearchResults(query);

  return NextResponse.json(
    { results },
    { headers: cacheHeaders },
  );
}
