import Link from "next/link";
import { notFound } from "next/navigation";
import GameEmbed from "@/components/GameEmbed";
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#1C1B26_0%,#282736_99.99%,#69658C_100%)] px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-white/80 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            {game.subject}
          </p>
          <h1 className="text-3xl font-extrabold md:text-4xl">{game.title}</h1>
          <p className="mt-2 max-w-3xl text-white/80">{game.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[20px] border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold">Game Info</h2>

            <div className="mt-4 space-y-3 text-sm text-white/85">
              <div>
                <p className="font-semibold text-white">Subject</p>
                <p>{game.subject}</p>
              </div>

              <div>
                <p className="font-semibold text-white">Description</p>
                <p>{game.description}</p>
              </div>
            </div>

            <a
              href={game.iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-[16px] bg-[#176BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f5ae0]"
            >
              Open in new tab
            </a>
          </aside>

          <GameEmbed
            src={game.iframeSrc}
            title={game.title}
            height={game.embedHeight ?? "800px"}
          />
        </div>
      </div>
    </main>
  );
}