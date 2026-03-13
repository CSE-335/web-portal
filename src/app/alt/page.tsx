import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/alt-home/WelcomeBanner";
import GameListCard from "@/components/alt-home/GameListCard";
import { games } from "@/data/games";
import BottomButtons from "@/components/home/BottomButtons";

export default function AltHomePage() {
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
