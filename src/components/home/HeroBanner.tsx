import Image from "next/image";

const CARD_GRADIENT =
  "linear-gradient(90deg, #2A2F4E 0%, #2A305B 12.98%, #222748 100%)";

export default function HeroBanner() {
  return (
    <section className="mt-5 px-4 md:mx-6 md:px-0">
      <div
        className="flex flex-col items-center gap-6 rounded-[20px] px-6 py-7 md:flex-row md:gap-8 md:px-10"
        style={{ background: CARD_GRADIENT }}
      >
        <div className="flex shrink-0 items-center gap-4">
          <Image
            src="/images/llnl-stem-logo.png"
            alt="LLNL STEM Games Logo"
            width={139}
            height={139}
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
