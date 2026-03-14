import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];

export async function createUserProfile(
  supabase: SupabaseClient<Database>,
  options: {
    displayName?: string | null;
    avatarUrl?: string | null;
  } = {}
): Promise<{ success: boolean; error: string | null }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: userError?.message ?? "Not authenticated" };
  }

  const profile: UserProfileInsert = {
    auth_user_id: user.id,
    display_name: options.displayName ?? null,
    avatar_url: options.avatarUrl ?? null,
  };

  const { error } = await supabase.from("user_profiles").insert(profile as never);

  if (error) {
    if (error.code === "23505") {
      return { success: true, error: null };
    }
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}
