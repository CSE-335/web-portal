import Link from "next/link";
import WelcomeBanner from "@/components/alt-home/WelcomeBanner";
import GameListCard from "@/components/alt-home/GameListCard";
import { games } from "@/data/games";

export default function AltHomePage() {
  const randomGame = games[Math.floor(Math.random() * games.length)];

  return (
    <main
      id="top"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(92,100,170,0.16),_transparent_18%),linear-gradient(180deg,#23233A_0%,#1D1C28_52%,#2E335F_100%)] text-white"
    >
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-4 py-6 md:px-6">
        <WelcomeBanner />

        <section className="flex-1 space-y-6">
          {games.map((game) => (
            <GameListCard
              key={game.slug}
              slug={game.slug}
              title={game.title}
              description={game.description}
              subject={game.subject}
              thumbnailSrc={game.thumbnailSrc}
            />
          ))}
        </section>

        <section className="my-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/games/${randomGame.slug}`}
            className="inline-flex rounded-[20px] border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/15"
          >
            ⇄ Random Game
          </Link>

          <a
            href="#top"
            className="inline-flex rounded-[20px] bg-[#176BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae0]"
          >
            ↑ Back to the top
          </a>
        </section>
      </div>
    </main>
  );
}
