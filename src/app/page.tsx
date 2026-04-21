import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import GameListCard from "@/components/home/GameListCard";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";
import { getLocale } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { getLocalizedGames } from "@/lib/supabase/game-translations";

const LEGACY_HOME_ORDER = [
  "pythongame",
  "human-motion",
  "matrix-meadow",
  "sonic-lab",
  "circuit-breaker",
] as const;

export default async function HomePage() {
  const rawLocale = await getLocale();
  const locale: Locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale;
  const localizedGames = await getLocalizedGames(
    locale,
    games.map((game) => game.slug)
  );
  const legacyOrderIndex = new Map(LEGACY_HOME_ORDER.map((slug, index) => [slug, index]));
  const orderedGames = [...localizedGames].sort((a, b) => {
    const aIndex = legacyOrderIndex.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = legacyOrderIndex.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.title.localeCompare(b.title);
  });

  return (
    <main>
      <WelcomeBanner />

      <Stack gap="lg" className="flex-1">
        {orderedGames.map((game) => (
          <GameListCard key={game.slug} {...game} />
        ))}
      </Stack>

      <BottomButtons />
    </main>
  );
}
