// Play sessions — record, end, streak calc, recent activity
// Table: play_sessions (user_id, game_slug, started_at, ended_at, duration_seconds)
import { supabase } from "./client";

export async function recordPlaySession(
  gameSlug: string
): Promise<{ sessionId: number | null; error: string | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { sessionId: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("play_sessions")
    .insert({ user_id: user.id, game_slug: gameSlug })
    .select("id")
    .single();

  return { sessionId: data?.id ?? null, error: error?.message ?? null };
}

export async function endPlaySession(
  sessionId: number
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();

  const { data: session } = await supabase
    .from("play_sessions")
    .select("started_at")
    .eq("id", sessionId)
    .single();

  const durationSeconds = session?.started_at
    ? Math.floor(
        (new Date(now).getTime() - new Date(session.started_at).getTime()) /
          1000
      )
    : null;

  const { error } = await supabase
    .from("play_sessions")
    .update({ ended_at: now, duration_seconds: durationSeconds })
    .eq("id", sessionId);

  return { error: error?.message ?? null };
}

export async function getPlayStreak(userId: string): Promise<number> {
  const { data } = await supabase
    .from("play_sessions")
    .select("started_at")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (!data || data.length === 0) return 0;

  const playDates = new Set(
    data.map((s) => new Date(s.started_at).toISOString().split("T")[0])
  );

  const sortedDates = Array.from(playDates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86400000
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getRecentActivity(
  userId: string,
  limit = 5
): Promise<{ game_slug: string; started_at: string; duration_seconds: number | null }[]> {
  const { data } = await supabase
    .from("play_sessions")
    .select("game_slug, started_at, duration_seconds")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
