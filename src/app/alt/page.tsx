import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import StemSection from "@/components/home/alt/StemSection";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";
import { getLocalizedGames } from "@/lib/supabase/game-translations";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function AltHomePage() {
  const rawLocale = await getLocale();
  const locale: Locale = locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : defaultLocale;
  const localizedGames = await getLocalizedGames(
    locale,
    games.map((g) => g.slug)
  );

  return (
    <main>
      <WelcomeBanner />

      <Stack gap={0}>
        <StemSection games={localizedGames} subject="Science" />
        <StemSection games={localizedGames} subject="Technology" titlePosition="right" />
        <StemSection games={localizedGames} subject="Engineering" />
        <StemSection games={localizedGames} subject="Mathematics" titlePosition="right" />
      </Stack>

      <BottomButtons />
    </main>
  );
}
