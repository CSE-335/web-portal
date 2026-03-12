import Image from "next/image";
import Link from "next/link";

type GameListCardProps = {
  slug: string;
  title: string;
  description: string;
  subject: string;
  thumbnailSrc: string;
};

export default function GameListCard({
  slug,
  title,
  description,
  subject,
  thumbnailSrc,
}: GameListCardProps) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-[#3C4579]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
      <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
        <div className="overflow-hidden rounded-[20px] bg-white/10">
          <Image
            src={thumbnailSrc}
            alt={`${title} cover`}
            width={900}
            height={520}
            className="h-full min-h-[220px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between px-1 py-1">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85">
              {description}
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[20px] border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75">
                  {subject}
                </span>
                <span className="rounded-[20px] border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75">
                  Educational
                </span>
              </div>
            </div>

            <Link
              href={`/games/${slug}`}
              className="inline-flex rounded-[20px] bg-[#176BFF] px-6 py-2.5 text-base font-semibold text-white transition hover:bg-[#0f5ae0]"
            >
              Play
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
