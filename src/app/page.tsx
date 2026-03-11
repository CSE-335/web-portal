import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer";

const CARD_GRADIENT =
  "linear-gradient(90deg, #2A2F4E 0%, #2A305B 12.98%, #222748 100%)";

function PlaceholderCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full rounded-[20px] ${className}`}
      style={{ background: CARD_GRADIENT }}
    />
  );
}

import { games } from "@/data/games";
import Link from "next/link";

function GameCard({
  title,
  description,
  href,
  imageSrc,
  className = "",
}: {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative block w-full overflow-hidden rounded-[20px] border border-white/10 ${className}`}
      style={{ background: CARD_GRADIENT }}
    >
      <img
        src={imageSrc}
        alt={title}
        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-90"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
        <h3 className="text-lg font-extrabold text-white md:text-xl">
          {title}
        </h3>
        <p className="mt-1 text-sm text-white/85">{description}</p>
      </div>
    </Link>
  );
}

function HeroBanner() {
  return (
    <section className="mt-5 px-4 md:mx-6 md:px-0">
      <div
        className="flex flex-col items-center gap-6 rounded-[20px] px-6 py-7 md:flex-row md:gap-8 md:px-10"
        style={{ background: CARD_GRADIENT }}
      >
        <div className="flex shrink-0 items-center gap-4">
          <img
            src="/images/llnl-stem-logo.png"
            alt="LLNL STEM Games Logo"
            className="h-auto w-[90px] object-contain md:w-[139px]"
          />
          <h1
            className="text-center text-xl font-extrabold leading-tight text-white md:text-[24px]"
            style={{ textShadow: "0 2px 2px rgba(37, 61, 107, 0.72)" }}
          >
            Welcome to LLNL
            <br />
            STEM Games
          </h1>
        </div>

        <div className="hidden h-12 w-px self-center bg-white/20 md:block" />

        <div className="flex flex-1 flex-wrap justify-center gap-6 md:justify-start md:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-lg text-white">🎮</span>
            <span
              className="text-sm font-extrabold text-white md:text-[20px]"
              style={{ textShadow: "0 2px 2px rgba(37, 61, 107, 0.72)" }}
            >
              Interactive learning
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg text-white">💾</span>
            <span
              className="text-sm font-extrabold text-white md:text-[20px]"
              style={{ textShadow: "0 2px 2px rgba(37, 61, 107, 0.72)" }}
            >
              Save your progress
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg text-white">💻</span>
            <span
              className="text-sm font-extrabold text-white md:text-[20px]"
              style={{ textShadow: "0 2px 2px rgba(37, 61, 107, 0.72)" }}
            >
              Play on any device
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StemSectionLeft({ title }: { title: string }) {
  return (
    <section className="mt-8 px-4 md:mt-10 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        <div className="flex flex-col gap-4 lg:w-[42%]">
          <h2 className="text-4xl leading-none font-extrabold text-white md:text-[48px]">
            {title}
          </h2>
          <PlaceholderCard className="h-[200px] md:h-[280px] lg:h-[309px]" />
        </div>

        <div className="lg:flex-1">
          <PlaceholderCard className="h-[250px] md:h-[340px] lg:h-[406px]" />
        </div>
      </div>
    </section>
  );
}

function StemSectionRight({ title }: { title: string }) {
  return (
    <section className="mt-8 px-4 md:mt-10 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        <div className="lg:flex-1">
          <PlaceholderCard className="h-[250px] md:h-[340px] lg:h-[406px]" />
        </div>

        <div className="flex flex-col gap-4 lg:w-[42%]">
          <h2 className="text-4xl leading-none font-extrabold text-white md:text-[48px]">
            {title}
          </h2>
          <PlaceholderCard className="h-[200px] md:h-[280px] lg:h-[309px]" />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {

  const sonicGame = games.find(
    (game) => game.slug === "sonic-fingerprint-lab"
  );
  const matrixGame = games.find(
    (game) => game.slug === "matrix-meadow"
  );
  return (
    <div
      id="top"
      className="flex min-h-screen flex-col"
      style={{
        background:
          "linear-gradient(180deg, #1C1B26 0%, #282736 99.99%, #69658C 100%)",
      }}
      >
      <Header />

      <main className="flex-1 pb-10">
        <HeroBanner />

        <div className="mt-4 flex justify-center px-4 md:px-6">
          <Link
            href="/alt-home"
            className="inline-flex rounded-full bg-[#176BFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5ae0]"
          >
            View Alternate Homepage
          </Link>
        </div>

        {/* Science */}
        <section className="mt-8 px-4 md:mt-10 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
            <div className="flex flex-col gap-4 lg:w-[42%]">
              <h2 className="text-4xl leading-none font-extrabold text-white md:text-[48px]">
                Science
              </h2>

              <PlaceholderCard className="h-[200px] md:h-[280px] lg:h-[309px]" />
            </div>

            <div className="lg:flex-1">
              {sonicGame ? (
                <GameCard
                  title={sonicGame.title}
                  description={sonicGame.description}
                  href={`/games/${sonicGame.slug}`}
                  imageSrc={sonicGame.thumbnailSrc}
                  className="h-[250px] md:h-[340px] lg:h-[406px]"
                />
              ) : (
                <PlaceholderCard className="h-[250px] md:h-[340px] lg:h-[406px]" />
              )}
            </div>
          </div>
        </section>

        {/* BLANK for now */} 
        <StemSectionRight title="Technology" />
        <StemSectionLeft title="Engineering" />



        {/* Math */} 
        <section className="mt-8 px-4 md:mt-10 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
            <div className="lg:flex-1">
              {matrixGame ? (
                <GameCard
                  title={matrixGame.title}
                  description={matrixGame.description}
                  href={`/games/${matrixGame.slug}`}
                  imageSrc={matrixGame.thumbnailSrc}
                  className="h-[250px] md:h-[340px] lg:h-[406px]"
                />
              ) : (
                <PlaceholderCard className="h-[250px] md:h-[340px] lg:h-[406px]" />
              )}
            </div>

            <div className="flex flex-col gap-4 lg:w-[42%]">
              <h2 className="text-4xl leading-none font-extrabold text-white md:text-[48px]">
                Mathematics
              </h2>
              <PlaceholderCard className="h-[200px] md:h-[280px] lg:h-[309px]" />
            </div>
          </div>
        </section>



        <div className="mt-12 flex flex-wrap justify-center gap-4 px-4 md:mt-16">
          <button
            className="flex h-[56px] min-w-[178px] items-center justify-center rounded-[20px] px-8 text-base font-bold text-[#FBE7E7] transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(180deg, #525B86 0%, #525B86 99.98%)",
            }}
          >
            Random Game
          </button>

          <a
            href="#top"
            className="flex h-[56px] min-w-[185px] items-center justify-center gap-2 rounded-[20px] px-8 text-base font-bold text-[#FBE7E7] transition-opacity hover:opacity-90"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, #1B41FF 0%, #217AFF 14%, #0054F0 99.99%)",
            }}
          >
            <span className="text-lg">↑</span>
            Back to the top
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}