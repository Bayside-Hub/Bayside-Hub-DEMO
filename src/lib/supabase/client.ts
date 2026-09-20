import { createBrowserClient as createClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";
import type { Database } from "./types";
import { authCookieOptions, persistentBrowserAuth } from "./auth-session";

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: authCookieOptions,
    auth: persistentBrowserAuth,
  });
}
