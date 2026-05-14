import WelcomeBanner from "@/components/home/WelcomeBanner";
import HomeAssistantIntro from "@/components/home/HomeAssistantIntro";
import QuickPlaySearch from "@/components/home/QuickPlaySearch";
import FilterableGameList from "@/components/home/FilterableGameList";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";
import { getLocalizedGames } from "@/lib/supabase/game-translations";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function HomePage() {
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
      <HomeAssistantIntro />
      <WelcomeBanner />
      <QuickPlaySearch games={localizedGames} />
      <FilterableGameList games={localizedGames} />
      <BottomButtons />
    </main>
  );
}
