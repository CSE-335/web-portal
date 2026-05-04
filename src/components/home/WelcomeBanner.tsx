'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function WelcomeBanner() {
  const t = useTranslations('home');
  const title = `${t('welcome1')} ${t('welcome2')}`;

  return (
    <section
      className="relative mb-6 overflow-hidden rounded-[20px]"
      style={{
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-card)',
      }}
      aria-labelledby="welcome-banner-heading"
    >
      {/* Taller min height + left-weighted crop on phones keeps headline over the light area of the art */}
      <div className="relative min-h-[220px] w-full sm:min-h-[200px] md:min-h-[240px] md:aspect-[2400/800] lg:aspect-[2400/720]">
        <Image
          src="/images/welcome-stem-banner.png"
          alt=""
          fill
          className="object-cover object-[15%_center] sm:object-[65%_center] md:object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1200px"
          priority
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 flex flex-col justify-start px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-center sm:justify-start sm:px-8 sm:pb-5 sm:pt-5 md:px-12"
        style={{ paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}
      >
        <div className="pointer-events-auto w-full max-w-full rounded-xl bg-white/[0.93] px-3 py-3 shadow-sm backdrop-blur-[2px] sm:ml-4 sm:max-w-[min(28rem,calc(52%-2rem))] sm:bg-transparent sm:px-2 sm:py-2 sm:shadow-none sm:backdrop-blur-none md:ml-7 md:py-4 lg:ml-10">
          <h1
            id="welcome-banner-heading"
            className="text-balance font-extrabold leading-[1.15] tracking-tight sm:leading-tight"
            style={{
              color: '#0f2847',
              fontSize: 'clamp(1.15rem, 4.2vw + 0.4rem, 2.45rem)',
              textShadow: '0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            {title}
          </h1>
          <Link
            href="/tutorial"
            className="mt-3 inline-flex min-h-11 max-w-full items-center break-words py-2 text-[0.95rem] font-semibold underline decoration-[#1565af] underline-offset-[3px] transition-colors hover:text-[#0b5294] [touch-action:manipulation] active:opacity-90 sm:min-h-0 sm:py-0 sm:text-[clamp(0.8rem,1.85vw,1rem)]"
            style={{ color: '#1157a8', lineHeight: 1.4 }}
          >
            {t('tutorialSubtitle')}
          </Link>
        </div>
      </div>
    </section>
  );
}
