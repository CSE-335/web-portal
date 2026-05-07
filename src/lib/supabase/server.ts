// Anonymous Supabase client for the server — anon key only, no cookies / no user session.
// For logged-in server work use @supabase/ssr createServerClient (see API routes).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createAnonymousSupabaseServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/** @deprecated Use `createAnonymousSupabaseServerClient` — same client, clearer name. */
export function createServerSupabaseClient() {
  return createAnonymousSupabaseServerClient();
}
