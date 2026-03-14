import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

//Client use on Server
export function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
