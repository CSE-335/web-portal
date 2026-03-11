import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import GameEmbed from "@/components/GameEmbed";
import SaveProgressBanner from "@/components/SaveProgressBanner";
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
      <Header />

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
          <div className="flex flex-col gap-4 border-t border-white/10 bg-[#434B7F]/90 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/llnl-stem-logo.png"
                alt="LLNL STEM Games logo"
                width={42}
                height={42}
                className="h-auto w-9"
              />
              <div>
                <h1 className="text-xl font-extrabold md:text-2xl">
                  {game.title}
                </h1>
                <p className="text-sm text-white/70">{game.subject}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15"
                aria-label="Favorite game"
              >
                ♡
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15"
                aria-label="Notes"
              >
                🗒
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15"
                aria-label="Mute"
              >
                🔇
              </button>
              <a
                href={game.iframeSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15"
                aria-label="Open in fullscreen tab"
              >
                ⛶
              </a>
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-5">
          <div className="rounded-[24px] border border-white/10 bg-[#273267]/92 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-extrabold">Game Details</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Subject
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {game.subject}
                </p>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Play Style
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Interactive web game
                </p>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Access
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Browser-based, no download required
                </p>
              </div>
            </div>

            <p className="mt-5 text-base leading-relaxed text-white/85">
              {game.description}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#273267]/92 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-extrabold">Game Description</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-white/82">
              {game.longDescription.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
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

      <footer className="border-t border-white/10 bg-[#4A5287]/95 px-4 py-10 text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex justify-center">
            <Image
              src="/images/llnl-stem-logo.png"
              alt="LLNL STEM Games logo"
              width={110}
              height={110}
              className="h-auto w-[84px] md:w-[100px]"
            />
          </div>

          <nav className="mb-4 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-white/85">
            <Link href="/alt-home" className="transition hover:text-white">
              ALL GAMES
            </Link>
            <Link href="/about" className="transition hover:text-white">
              ABOUT US
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              CONTACT US
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              PRIVACY
            </Link>
            <Link href="/partner" className="transition hover:text-white">
              PARTNER
            </Link>
          </nav>

          <p className="mx-auto max-w-4xl text-sm leading-relaxed text-white/75">
            Welcome to Lawrence Livermore National Laboratory STEM game web
            portal. Enjoy our library of educational STEM games which could be
            played on phones, tablets, and PC with no downloads necessary. If
            you&apos;re struggling with the concepts, ensure to use the AI
            features for assistance.
          </p>
        </div>
      </footer>
    </main>
  );
}