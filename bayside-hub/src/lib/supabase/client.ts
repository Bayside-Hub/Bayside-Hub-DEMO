import { createBrowserClient as createClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";
import type { Database } from "./types";

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}