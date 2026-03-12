import Link from "next/link";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import GameCard from "@/components/home/GameCard";
import PlaceholderCard from "@/components/home/PlaceholderCard";
import StemSectionLeft from "@/components/home/StemSectionLeft";
import StemSectionRight from "@/components/home/StemSectionRight";
import { games } from "@/data/games";

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
