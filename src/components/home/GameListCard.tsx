'use client';
import { useTranslations } from 'next-intl';
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
  const tCard = useTranslations('gameCard');
  const tCommon = useTranslations('common');

  return (
    <article className="rounded-[20px] p-4" style={{ background: "var(--surface-card-game)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-card)" }}>
      <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
        <div className="relative h-[210px] w-full overflow-hidden rounded-[20px] md:h-[260px]" style={{ background: "var(--card-img-bg)" }}>
          <Image
            src={thumbnailSrc}
            alt={`${title} cover`}
            width={640}
            height={360}
            sizes="(min-width: 768px) 640px, 100vw"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between px-1 py-1">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--title-color)", textShadow: "var(--title-glow)" }}>{title}</h2>
            <p className="mt-3 max-w-xl text-lg leading-relaxed" style={{ color: "var(--text-body)" }}>
              {description}
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-label)" }}>
                {tCard('tags')}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[20px] px-3 py-1 text-xs font-medium" style={{ background: "var(--tag-bg)", border: "1px solid var(--tag-border)", color: "var(--text-tag)" }}>
                  {tCard.has(subject) ? tCard(subject) : subject}
                </span>
              </div>
            </div>

            <Link
              href={`/games/${slug}`}
              className="play-btn inline-flex rounded-[20px] bg-[#176BFF] px-6 py-2.5 text-base font-semibold text-white transition hover:bg-[#0f5ae0]"
            >
              {tCommon('play')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
