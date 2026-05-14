import { notFound } from "next/navigation";
import GamePlayer from "@/components/game-page/player/GamePlayer";
import GameDetails from "@/components/game-page/GameDetails";
import GameDescription from "@/components/game-page/GameDescription";
import GameTokenProvider from "@/components/game-page/GameTokenProvider";
import { Stack } from "@mantine/core";
import { games } from "@/data/games";
import BottomButtons from "@/components/layout/BottomButtons";
import TutorToggle from "@/components/game-page/TutorToggle";
import { getLocale } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { getLocalizedGameBySlug } from "@/lib/supabase/game-translations";
import { resolveEmbedHeights } from "@/lib/games/embed-height";

export async function generateStaticParams() {
  return games.map((game) => ({
    slug: game.slug,
  }));
}

type GamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const rawLocale = await getLocale();
  const locale: Locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale;
  const localized = await getLocalizedGameBySlug(slug, locale);
  const game = localized?.game;

  if (!game) {
    notFound();
  }

  const { desktop: embedHeight, mobile: embedHeightMobile } = resolveEmbedHeights(game);

  return (
    <main>
      <GameTokenProvider />
      {/* Bridge listens for postMessage events from the game iframe */}
      <TutorToggle gameSlug={game.slug} />
      <GamePlayer
        slug={game.slug}
        title={game.title}
        subject={game.subject}
        iframeSrc={game.iframeSrc}
        embedHeight={embedHeight}
        embedHeightMobile={embedHeightMobile}
      />

      <Stack component="section" gap="lg" mt="lg">
        <GameDetails subject={game.subject} description={game.description} />
        <GameDescription longDescription={game.longDescription} />
      </Stack>

      <BottomButtons random={false} />
    </main>
  );
}
