import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { POST_FORM_REDIRECT_STATUS, safeNextPath } from "@/lib/navigation";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  await supabase.auth.signOut();

  const { searchParams } = new URL(request.url);
  const next = safeNextPath(searchParams.get("next"), "/login");

  return NextResponse.redirect(
    new URL(next, request.url),
    POST_FORM_REDIRECT_STATUS,
  );
}
