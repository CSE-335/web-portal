import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase client for use in the browser (Client Components, client-side code).
 * Uses the anon key from env – safe to expose to the client.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
