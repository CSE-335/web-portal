import { notFound } from "next/navigation";
import GamePlayer from "@/components/game-page/player/GamePlayer";
import GameDetails from "@/components/game-page/GameDetails";
import GameDescription from "@/components/game-page/GameDescription";
import GameTokenProvider from "@/components/game-page/GameTokenProvider";
import { Stack } from "@mantine/core";
import { getGameBySlug, games } from "@/data/games";
import BottomButtons from "@/components/layout/BottomButtons";
import TutorToggle from "@/components/game-page/TutorToggle";

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
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

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
        embedHeight="clamp(360px, 68dvh, 800px)"
      />

      <Stack component="section" gap="lg" mt="lg">
        <GameDetails
          slug={game.slug}
          subject={game.subject}
          description={game.description}
        />
        <GameDescription slug={game.slug} longDescription={game.longDescription} />
      </Stack>

      <BottomButtons random={false} />
    </main>
  );
}
