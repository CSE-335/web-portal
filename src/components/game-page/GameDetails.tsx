type GameDetailsProps = {
  subject: string;
  description: string;
};

export default function GameDetails({
  subject,
  description,
}: GameDetailsProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#273267]/92 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
      <h2 className="text-2xl font-extrabold">Game Details</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            Subject
          </p>
          <p className="mt-2 text-base font-semibold text-white">{subject}</p>
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
        {description}
      </p>
    </div>
  );
}
