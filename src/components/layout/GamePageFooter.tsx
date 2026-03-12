import Image from "next/image";
import Link from "next/link";

export default function GamePageFooter() {
  return (
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
  );
}
