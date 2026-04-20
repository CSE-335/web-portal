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
        <div className="overflow-hidden rounded-[20px]" style={{ background: "var(--card-img-bg)" }}>
          <Image
            src={thumbnailSrc}
            alt={`${title} cover`}
            width={900}
            height={520}
            className="h-full min-h-55 w-full object-cover"
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
                <span className="rounded-[20px] px-3 py-1 text-xs font-medium" style={{ background: "var(--tag-bg)", border: "1px solid var(--tag-border)", color: "var(--text-tag)" }}>
                  {tCommon('educational')}
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
