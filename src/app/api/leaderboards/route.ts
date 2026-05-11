import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createAdminClient,
  createSessionClient,
  getAuthenticatedUserId,
  getGameIdBySlug,
  type AdminClient,
} from "@/lib/supabase/game-data";
import type { Database, Json } from "@/lib/supabase/database.types";
import {
  buildCircuitBreakerTrackedPaths,
  parseLeaderboardTrack,
} from "@/lib/leaderboardTracks";

type PublicTables = Database["public"]["Tables"];
type GameDataRow = PublicTables["game_data"]["Row"];
type UserProfileRow = PublicTables["user_profiles"]["Row"];
type FriendshipRow = PublicTables["friendships"]["Row"];

type Scope = "global" | "friends";

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bestScore: number;
};

type LeaderboardResponse = {
  ok: true;
  scope: Scope;
  mode: "per-game";
  slug?: string;
  /** e.g. `overall`, `circuit-level-3`, `multiplication-drill` */
  track?: string;
  entries: LeaderboardEntry[];
};

const DEFAULT_SCORE_PATHS = ["highScore", "score"];
const TRACKED_SCORE_PATHS: Record<string, Record<string, string[]>> = {
  "circuit-breaker": buildCircuitBreakerTrackedPaths(),
  "sonic-lab": {
    overall: ["highScore", "score", "points", "sonicLab.highScore", "sonicLab.points"],
  },
  "matrix-meadow": {
    overall: ["highScore", "score", "matrixMeadow.highScore", "matrixMeadow.score"],
    "multiplication-drill": [
      "matrixMeadow.multiplicationDrill.highScore",
      "matrixMeadow.multiplicationDrill.score",
      "matrixMeadow.drill.highScore",
      "matrixMeadow.drill.score",
      "multiplicationDrillHighScore",
      "drillHighScore",
    ],
    "vocabulary-quiz": [
      "matrixMeadow.vocabularyQuiz.highScore",
      "matrixMeadow.vocabularyQuiz.score",
      "matrixMeadow.vocabQuiz.highScore",
      "matrixMeadow.vocabQuiz.score",
      "vocabularyQuizHighScore",
      "vocabQuizHighScore",
    ],
  },
};

function getNumberAtPath(root: unknown, path: string): number | null {
  if (!path) return null;
  const parts = path.split(".");
  let current: unknown = root;

  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return null;
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === "number" && Number.isFinite(current)) return current;
  if (typeof current === "string") {
    const n = Number(current);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function extractHighScore(data: Json, slug: string | null, track: string): number | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const gameTrackPaths = slug ? TRACKED_SCORE_PATHS[slug]?.[track] ?? [] : [];
  const gameOverallPaths = slug ? TRACKED_SCORE_PATHS[slug]?.overall ?? [] : [];
  const candidatePaths = [
    ...gameTrackPaths,
    ...(track === "overall" ? gameOverallPaths : []),
    ...(track === "overall" ? DEFAULT_SCORE_PATHS : []),
  ];

  for (const path of candidatePaths) {
    const parsed = getNumberAtPath(data, path);
    if (parsed != null) return parsed;
  }

  return null;
}

async function getFriendIdsForUser(
  adminSupabase: AdminClient,
  authUserId: string
): Promise<Set<string>> {
  const { data, error } = await adminSupabase
    .from("friendships")
    .select("requester_id, addressee_id, status")
    .or(`requester_id.eq.${authUserId},addressee_id.eq.${authUserId}`);

  if (error || !data) {
    return new Set<string>([authUserId]);
  }

  const rows = data as FriendshipRow[];
  const ids = new Set<string>([authUserId]);

  for (const row of rows) {
    if (row.status !== "accepted") continue;
    const otherId = row.requester_id === authUserId ? row.addressee_id : row.requester_id;
    ids.add(otherId);
  }

  return ids;
}

async function loadProfilesForUserIds(
  adminSupabase: AdminClient,
  userIds: string[]
): Promise<Map<string, Pick<UserProfileRow, "auth_user_id" | "display_name" | "avatar_url">>> {
  if (userIds.length === 0) return new Map();

  const { data } = await adminSupabase
    .from("user_profiles")
    .select("auth_user_id, display_name, avatar_url")
    .in("auth_user_id", userIds);

  const map = new Map<string, Pick<UserProfileRow, "auth_user_id" | "display_name" | "avatar_url">>();
  for (const row of data ?? []) {
    map.set(row.auth_user_id, row);
  }
  return map;
}

function buildLeaderboardFromRows(
  rows: GameDataRow[],
  gameIdToSlug: Map<number, string>,
  selectedSlug: string | null,
  track: string,
  profiles: Map<string, Pick<UserProfileRow, "auth_user_id" | "display_name" | "avatar_url">>,
  limit: number
): LeaderboardEntry[] {
  const perUserBest = new Map<string, number>();

  for (const row of rows) {
    const rowSlug = selectedSlug ?? gameIdToSlug.get(row.game_id) ?? null;
    const score = extractHighScore(row.data_json as Json, rowSlug, track);
    if (score == null) continue;

    const prev = perUserBest.get(row.user_id);
    if (prev == null || score > prev) {
      perUserBest.set(row.user_id, score);
    }
  }

  const entries: LeaderboardEntry[] = [];
  for (const [userId, bestScore] of perUserBest.entries()) {
    const profile = profiles.get(userId);
    entries.push({
      userId,
      bestScore,
      displayName: profile?.display_name || "Player",
      avatarUrl: profile?.avatar_url ?? null,
    });
  }

  entries.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return a.displayName.localeCompare(b.displayName);
  });

  return entries.slice(0, limit);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "A game slug is required for leaderboard requests." },
      { status: 400 }
    );
  }
  const scope = (url.searchParams.get("scope") as Scope | null) ?? "global";
  const track = parseLeaderboardTrack(slug, url.searchParams.get("track"));
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 100);

  const sessionResult = await createSessionClient();
  if (!sessionResult.ok) return sessionResult.response;

  const authResult = await getAuthenticatedUserId(sessionResult.supabase, request);
  if (!authResult.ok) return authResult.response;

  const adminResult = createAdminClient();
  if (!adminResult.ok) return adminResult.response;

  const adminSupabase = adminResult.supabase;
  const authUserId = authResult.authUserId;

  const gameResult = await getGameIdBySlug(adminSupabase, slug);
  if (!gameResult.ok) return gameResult.response;
  const gameId = gameResult.gameId;

  let userFilterIds: string[] | null = null;
  if (scope === "friends") {
    const ids = await getFriendIdsForUser(adminSupabase, authUserId);
    userFilterIds = Array.from(ids);
  }

  let query = adminSupabase.from("game_data").select("user_id, game_id, data_json").eq("game_id", gameId);
  if (userFilterIds && userFilterIds.length > 0) {
    query = query.in("user_id", userFilterIds);
  }

  const { data: rows, error } = await query;
  if (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to load leaderboard data.", details: error.message },
      { status: 500 }
    );
  }

  const gameDataRows = (rows ?? []) as GameDataRow[];
  if (gameDataRows.length === 0) {
    const empty: LeaderboardResponse = {
      ok: true,
      scope,
      mode: "per-game",
      slug,
      track,
      entries: [],
    };
    return NextResponse.json(empty);
  }

  const userIds = Array.from(new Set(gameDataRows.map((row) => row.user_id)));
  const gameIds = Array.from(new Set(gameDataRows.map((row) => row.game_id)));
  const gameIdToSlug = new Map<number, string>();
  if (gameIds.length > 0) {
    const { data: gameRows } = await adminSupabase
      .from("games")
      .select("id, slug")
      .in("id", gameIds);
    for (const game of gameRows ?? []) {
      if (typeof game.id === "number" && typeof game.slug === "string") {
        gameIdToSlug.set(game.id, game.slug);
      }
    }
  }
  const profiles = await loadProfilesForUserIds(adminSupabase, userIds);
  const entries = buildLeaderboardFromRows(gameDataRows, gameIdToSlug, slug, track, profiles, limit);

  const response: LeaderboardResponse = {
    ok: true,
    scope,
    mode: "per-game",
    slug,
    track,
    entries,
  };

  return NextResponse.json(response);
}

