import Image from "next/image";
import Link from "next/link";
import { games } from "@/data/games";

export default function AltHomePage() {
  const randomGame = games[Math.floor(Math.random() * games.length)];

  return (
    <main
      id="top"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(92,100,170,0.16),_transparent_18%),linear-gradient(180deg,#23233A_0%,#1D1C28_52%,#2E335F_100%)] text-white"
    >
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-4 py-5 md:px-6">
        <header className="mb-6 rounded-[24px] border border-white/10 bg-[#4A5287]/90 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/llnl-stem-logo.png"
                alt="LLNL STEM Games logo"
                width={140}
                height={48}
                className="h-auto w-[120px] md:w-[140px]"
                priority
              />
              <span className="text-lg font-extrabold tracking-tight">
                LLNL STEM Games
              </span>
            </Link>

            <div className="flex flex-1 items-center justify-center lg:px-6">
              <div className="relative w-full max-w-[520px]">
                <input
                  type="text"
                  placeholder="Search STEM games..."
                  className="w-full rounded-full border border-white/10 bg-white/10 px-5 py-3 pr-12 text-sm text-white outline-none placeholder:text-white/60 transition focus:border-white/25 focus:bg-white/15"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
                  🔍
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                aria-label="Favorites"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg text-white/85 transition hover:bg-white/15"
              >
                ♡
              </button>
              <button
                type="button"
                aria-label="Profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg text-white/85 transition hover:bg-white/15"
              >
                ◌
              </button>
              <Link
                href="/login"
                className="inline-flex rounded-full bg-[#176BFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5ae0]"
              >
                Log in
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-[#36407A]/90 px-6 py-6 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/llnl-stem-logo.png"
                alt="LLNL STEM Games logo"
                width={120}
                height={120}
                className="h-auto w-[80px] md:w-[96px]"
                priority
              />
              <div>
                <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">
                  Welcome to LLNL
                  <br />
                  STEM Games
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm font-semibold text-white/90 md:flex-row md:flex-wrap md:gap-6">
              <div className="flex items-center gap-2">🧠 Interactive learning</div>
              <div className="flex items-center gap-2">💾 Save your progress</div>
              <div className="flex items-center gap-2">📱 Play on any device</div>
            </div>
          </div>
        </section>

        <section className="flex-1 space-y-6">
          {games.map((game) => (
            <article
              key={game.slug}
              className="rounded-[28px] border border-white/10 bg-[#3C4579]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
            >
              <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
                <div className="overflow-hidden rounded-[22px] bg-white/10">
                  <Image
                    src={game.thumbnailSrc}
                    alt={`${game.title} cover`}
                    width={900}
                    height={520}
                    className="h-full min-h-[220px] w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between px-1 py-1">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                      {game.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85">
                      {game.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75">
                          {game.subject}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75">
                          Educational
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/games/${game.slug}`}
                      className="inline-flex rounded-full bg-[#176BFF] px-6 py-2.5 text-base font-semibold text-white transition hover:bg-[#0f5ae0]"
                    >
                      Play
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="my-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/games/${randomGame.slug}`}
            className="inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/15"
          >
            ⇄ Random Game
          </Link>

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