import { createServerClient as createClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";
import type { Database } from "./types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response: supabaseResponse, user: null };
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and getUser().
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Clear only invalid Supabase auth cookies; unrelated preference cookies
    // must survive an expired or malformed login session.
    for (const cookie of request.cookies.getAll()) {
      if (!cookie.name.startsWith("sb-") || !cookie.name.includes("auth-token")) continue;
      request.cookies.delete(cookie.name);
      supabaseResponse.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    }
    return { response: supabaseResponse, user: null };
  }

  return { response: supabaseResponse, user };
}
