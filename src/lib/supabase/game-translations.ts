import "server-only";
import { createAdminClient, getGameIdBySlug } from "./game-data";
import type { Locale } from "@/i18n/routing";
import { getGameBySlug, type GameMeta } from "@/data/games";
import { createHash } from "crypto";

export function buildGameSourceHash(game: Pick<GameMeta, "title" | "description" | "longDescription">) {
  return createHash("sha256")
    .update(JSON.stringify([game.title, game.description, game.longDescription]))
    .digest("hex");
}

export async function getLocalizedGameBySlug(slug: string, locale: Locale) {
  const game = getGameBySlug(slug);
  if (!game) return null;

  if (locale === "en") {
    return { game, localeUsed: "en" as const, isFallback: false };
  }

  const adminResult = createAdminClient();
  if (!adminResult.ok) {
    return { game, localeUsed: "en" as const, isFallback: true };
  }

  const sourceHash = buildGameSourceHash(game);
  const gameIdResult = await getGameIdBySlug(adminResult.supabase, slug);
  if (!gameIdResult.ok) {
    return { game, localeUsed: "en" as const, isFallback: true };
  }

  const { data, error } = await adminResult.supabase
    .from("game_translations")
    .select("title, description, long_description, source_hash")
    .eq("game_id", gameIdResult.gameId)
    .eq("locale", locale)
    .eq("source_hash", sourceHash)
    .maybeSingle();

  if (error || !data) {
    return { game, localeUsed: "en" as const, isFallback: true };
  }

  return {
    game: {
      ...game,
      title: data.title ?? game.title,
      description: data.description ?? game.description,
      longDescription: data.long_description?.length ? data.long_description : game.longDescription,
    },
    localeUsed: locale,
    isFallback: false,
  };
}
