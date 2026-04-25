// Game likes — toggle, check, list, count
// Table: game_likes (user_id, game_slug)
import { supabase } from "./client";

export async function toggleGameLike(
  gameSlug: string
): Promise<{ liked: boolean; error: string | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { liked: false, error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("game_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_slug", gameSlug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("game_likes")
      .delete()
      .eq("id", existing.id);
    return { liked: false, error: error?.message ?? null };
  }

  const { error } = await supabase
    .from("game_likes")
    .insert({ user_id: user.id, game_slug: gameSlug });
  return { liked: true, error: error?.message ?? null };
}

export async function isGameLikedByUser(
  gameSlug: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("game_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_slug", gameSlug)
    .maybeSingle();

  return !!data;
}

export async function getUserLikedGames(
  userId: string
): Promise<{ game_slug: string; created_at: string }[]> {
  const { data } = await supabase
    .from("game_likes")
    .select("game_slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUserLikesCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("game_likes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return count ?? 0;
}
