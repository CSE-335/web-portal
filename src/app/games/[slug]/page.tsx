import { notFound } from "next/navigation";
import GameEmbed from "@/components/GameEmbed";
import SaveProgressBanner from "@/components/SaveProgressBanner";
import GameToolbar from "@/components/game-page/GameToolbar";
import GameDetails from "@/components/game-page/GameDetails";
import GameDescription from "@/components/game-page/GameDescription";
import { getGameBySlug, games } from "@/data/games";

type GamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return games.map((game) => ({
    slug: game.slug,
  }));
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <main
      id="top"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(92,100,170,0.14),_transparent_18%),linear-gradient(180deg,#23233A_0%,#1D1C28_52%,#2E335F_100%)] text-white"
    >
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#22263F]/95 shadow-[0_18px_45px_rgba(0,0,0,0.30)]">
        <SaveProgressBanner />

        <div className="p-3">
          <div className="overflow-hidden bg-[linear-gradient(180deg,#2A2F56_0%,#202542_100%)]">
            <GameEmbed
              src={game.iframeSrc}
              title={game.title}
              height={game.embedHeight ?? "760px"}
            />
          </div>
        </div>
          <GameToolbar
            title={game.title}
            subject={game.subject}
            iframeSrc={game.iframeSrc}
          />
        </section>

        <section className="mt-5 space-y-5">
          <GameDetails
            subject={game.subject}
            description={game.description}
          />
          <GameDescription longDescription={game.longDescription} />
        </section>

        <section className="my-10 flex justify-center">
          <a
            href="#top"
            className="inline-flex rounded-full bg-[#176BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae0]"
          >
            ↑ Back to the top
          </a>
        </section>
      </div>
    </main>
  );
}
