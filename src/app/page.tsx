import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import GameListCard from "@/components/home/GameListCard";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";

export default function HomePage() {
  return (
    <main>
      <WelcomeBanner />

      <Stack gap="lg" className="flex-1">
        {games.map((game) => (
          <GameListCard key={game.slug} {...game} />
        ))}
      </Stack>

      <BottomButtons />
    </main>
  );
}
