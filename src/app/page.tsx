import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import GameListCard from "@/components/home/GameListCard";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";
import { getLocale } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { getLocalizedGames } from "@/lib/supabase/game-translations";

export default async function HomePage() {
  const rawLocale = await getLocale();
  const locale: Locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale;
  const localizedGames = await getLocalizedGames(
    locale,
    games.map((game) => game.slug)
  );

  return (
    <main>
      <WelcomeBanner />

      <Stack gap="lg" className="flex-1">
        {localizedGames.map((game) => (
          <GameListCard key={game.slug} {...game} />
        ))}
      </Stack>

      <BottomButtons />
    </main>
  );
}
