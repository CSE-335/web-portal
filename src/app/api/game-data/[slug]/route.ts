import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createAdminClient,
  createSessionClient,
  getAuthenticatedUserId,
  getGameIdBySlug,
  type AdminClient,
} from "@/lib/supabase/game-data";
import type { Json } from "../../../../lib/supabase/database.types";

const DEFAULT_GAME_DATA: Json = {};

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

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

async function resolveOwnership(
  request: NextRequest,
  slug: string
): Promise<
  | { ok: true; adminSupabase: AdminClient; userId: string; gameId: number }
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

  return {
    ok: true,
    adminSupabase: adminResult.supabase,
    userId: authResult.authUserId,
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
    .eq("user_id", ownership.userId)
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

  if (!data) {
    console.warn("[game-data] no row found for auth user id", {
      slug,
      userId: ownership.userId,
      gameId: ownership.gameId,
    });
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
  const { adminSupabase, userId, gameId } = ownership;

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

  const saveResult = await saveForUserId(userId);
  if (saveResult.ok) {
    return NextResponse.json({
      ok: true,
      gameData,
      fallbackUsed,
    });
  }

  console.error("[game-data] save failed", {
    slug,
    gameId,
    userId,
    error: { code: saveResult.error.code ?? null, message: saveResult.error.message },
  });

  return NextResponse.json(
    {
      ok: false,
      error: "Failed to save game data.",
      details: saveResult.error.message,
      code: saveResult.error.code ?? null,
    },
    { status: 500 }
  );
}