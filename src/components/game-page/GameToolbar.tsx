import Image from "next/image";

type GameToolbarProps = {
  title: string;
  subject: string;
  iframeSrc: string;
};

export default function GameToolbar({
  title,
  subject,
  iframeSrc,
}: GameToolbarProps) {
  return (
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
          <h1 className="text-xl font-extrabold md:text-2xl">{title}</h1>
          <p className="text-sm text-white/70">{subject}</p>
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
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15"
          aria-label="Open in fullscreen tab"
        >
          ⛶
        </a>
      </div>
    </div>
  );
}
