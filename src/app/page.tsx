import { Stack } from "@mantine/core";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import GameListCard from "@/components/home/GameListCard";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";
import { createClient } from "../../utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('games').select('*').limit(1)
console.log('Data:', data, 'Error:', error)

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
