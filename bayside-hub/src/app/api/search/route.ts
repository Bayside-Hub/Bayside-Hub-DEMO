import { NextResponse } from "next/server";
import { getSearchResults } from "@/lib/search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.slice(0, 80) ?? "";
  if (query.trim().length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
  const results = await getSearchResults(query);

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
