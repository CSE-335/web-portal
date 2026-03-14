import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase client for use on the server (Server Components, Route Handlers, Server Actions).
 * Uses the same anon key by default. For admin operations use SUPABASE_SERVICE_ROLE_KEY
 * in a separate server-only client and never expose it to the client.
 */
export function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
