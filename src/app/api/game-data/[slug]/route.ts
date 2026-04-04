import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Database, Json } from "../../../../lib/supabase/database.types";

const DEFAULT_GAME_DATA: Json = {};

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

type SessionClient = SupabaseClient<Database>;
type AdminClient = SupabaseClient<Database>;
type SaveError = { message: string; code?: string | null };

function normalizeGameData(value: unknown): { gameData: Json; fallbackUsed: boolean } {
  if (value === null) return { gameData: null, fallbackUsed: false };
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { gameData: value, fallbackUsed: false };
  }
  if (Array.isArray(value)) return { gameData: value as Json, fallbackUsed: false };
  if (typeof value === "object") return { gameData: value as Json, fallbackUsed: false };
  return { gameData: DEFAULT_GAME_DATA, fallbackUsed: true };
}

async function createSessionClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Missing Supabase environment variables." },
        { status: 500 }
      ),
    };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  return { ok: true as const, supabase };
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Treat empty string as configured for local scaffolding;
  // only fail when the variable is truly missing (undefined/null).
  if (supabaseUrl == null || serviceRoleKey == null) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      ),
    };
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { ok: true as const, supabase };
}

async function getAuthenticatedUserId(sessionSupabase: SessionClient, request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

  const {
    data: { user },
    error,
  } = accessToken
    ? await sessionSupabase.auth.getUser(accessToken)
    : await sessionSupabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 }),
    };
  }

  return { ok: true as const, authUserId: user.id };
}

async function getGameIdBySlug(adminSupabase: AdminClient, slug: string) {
  const { data: game, error } = await adminSupabase.from("games").select("id").eq("slug", slug).maybeSingle();

  if (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Failed to resolve game.", details: error.message },
        { status: 500 }
      ),
    };
  }

  if (!game) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: `Game "${slug}" not found.` }, { status: 404 }),
    };
  }

  return { ok: true as const, gameId: game.id };
}

async function getProfileIdByAuthUserId(adminSupabase: AdminClient, authUserId: string) {
  const { data: profile, error } = await adminSupabase
    .from("user_profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Failed to resolve user profile.", details: error.message },
        { status: 500 }
      ),
    };
  }

  return { ok: true as const, profileId: profile?.id ?? null };
}

async function resolveOwnership(
  request: NextRequest,
  slug: string
): Promise<
  | { ok: true; adminSupabase: AdminClient; userIds: string[]; gameId: number }
  | { ok: false; response: NextResponse }
> {
  const sessionResult = await createSessionClient();
  if (!sessionResult.ok) return sessionResult;

  const authResult = await getAuthenticatedUserId(sessionResult.supabase, request);
  if (!authResult.ok) return authResult;

  const adminResult = createAdminClient();
  if (!adminResult.ok) return adminResult;

  const gameResult = await getGameIdBySlug(adminResult.supabase, slug);
  if (!gameResult.ok) return gameResult;

  const profileResult = await getProfileIdByAuthUserId(adminResult.supabase, authResult.authUserId);
  if (!profileResult.ok) return profileResult;

  const userIds = Array.from(
    new Set([authResult.authUserId, profileResult.profileId].filter((value): value is string => Boolean(value)))
  );

  return {
    ok: true,
    adminSupabase: adminResult.supabase,
    userIds,
    gameId: gameResult.gameId,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await Promise.resolve(context.params);
  const ownership = await resolveOwnership(request, slug);
  if (!ownership.ok) {
    return ownership.response;
  }

  const { data, error } = await ownership.adminSupabase
    .from("game_data")
    .select("data_json")
    .in("user_id", ownership.userIds)
    .eq("game_id", ownership.gameId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to load game data.", details: error.message },
      { status: 500 }
    );
  }

  const rawGameData = data?.data_json ?? DEFAULT_GAME_DATA;
  const { gameData, fallbackUsed } = normalizeGameData(rawGameData);

  return NextResponse.json({
    ok: true,
    gameData,
    fallbackUsed: !data || fallbackUsed,
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { slug } = await Promise.resolve(context.params);
  const ownership = await resolveOwnership(request, slug);
  if (!ownership.ok) {
    return ownership.response;
  }
  const { adminSupabase, userIds, gameId } = ownership;

  const body = (await request.json().catch(() => null)) as { data?: unknown } | null;
  const { gameData, fallbackUsed } = normalizeGameData(body?.data);

  async function saveForUserId(userId: string): Promise<{ ok: true } | { ok: false; error: SaveError }> {
    const { data: updatedRows, error: updateError } = await adminSupabase
      .from("game_data")
      .update({ data_json: gameData })
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .select("id");

    if (updateError) {
      return { ok: false, error: updateError };
    }

    if ((updatedRows?.length ?? 0) > 0) {
      return { ok: true };
    }

    const { error: insertError } = await adminSupabase
      .from("game_data")
      .insert({ user_id: userId, game_id: gameId, data_json: gameData });

    if (!insertError) {
      return { ok: true };
    }

    if (insertError.code === "23505") {
      const { error: retryUpdateError } = await adminSupabase
        .from("game_data")
        .update({ data_json: gameData })
        .eq("user_id", userId)
        .eq("game_id", gameId);
      if (!retryUpdateError) {
        return { ok: true };
      }
      return { ok: false, error: retryUpdateError };
    }

    return { ok: false, error: insertError };
  }

  const saveErrors: SaveError[] = [];
  for (const userId of userIds) {
    const saveResult = await saveForUserId(userId);
    if (saveResult.ok) {
      return NextResponse.json({
        ok: true,
        gameData,
        fallbackUsed,
      });
    }
    saveErrors.push(saveResult.error);
  }

  console.error("[game-data] save failed", {
    slug,
    gameId,
    userIds,
    errors: saveErrors.map((error) => ({ code: error.code ?? null, message: error.message })),
  });

  const firstError = saveErrors[0];
  return NextResponse.json(
    {
      ok: false,
      error: "Failed to save game data.",
      details: firstError?.message ?? "Unknown save error",
      code: firstError?.code ?? null,
    },
    { status: 500 }
  );
}