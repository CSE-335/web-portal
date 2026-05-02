import WelcomeBanner from "@/components/home/WelcomeBanner";
import FilterableGameList from "@/components/home/FilterableGameList";
import BottomButtons from "@/components/layout/BottomButtons";
import { games } from "@/data/games";

export default async function HomePage() {
  return (
    <main>
      <WelcomeBanner />
      <FilterableGameList games={games} />
      <BottomButtons />
    </main>
  );
}
