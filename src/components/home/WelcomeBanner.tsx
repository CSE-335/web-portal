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
      {/* Phones only: taller min-height so wrapped headings + link are not clipped (section is overflow-hidden) */}
      <div className="relative min-h-[280px] w-full sm:min-h-[200px] md:min-h-[240px] md:aspect-[2400/800] lg:aspect-[2400/720]">
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
        className="pointer-events-none absolute inset-0 flex flex-col justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-center sm:justify-start sm:px-8 sm:pb-5 sm:pt-5 md:px-12"
        style={{ paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}
      >
        <div
          className="pointer-events-auto w-full min-w-0 max-w-full rounded-2xl px-4 py-4 shadow-sm backdrop-blur-[3px] sm:ml-3 sm:max-w-[min(38rem,calc(60%-1rem))] sm:bg-transparent sm:px-8 sm:py-8 sm:shadow-none sm:backdrop-blur-none md:ml-6 md:px-10 md:py-9 lg:ml-10 lg:px-11 lg:py-10"
          style={{ background: "var(--welcome-overlay-mobile-bg)" }}
        >
          <h1
            id="welcome-banner-heading"
            className="max-sm:break-words text-balance font-extrabold leading-[1.2] tracking-tight text-[clamp(1rem,3.7vw+0.45rem,2rem)] sm:leading-tight sm:text-[clamp(1.15rem,4.2vw+0.4rem,2.45rem)]"
            style={{
              color: "var(--welcome-banner-title-color)",
              textShadow: 'var(--welcome-banner-heading-shadow)',
            }}
          >
            {title}
          </h1>
          <Link
            href="/tutorial"
            className="mt-3 inline-flex min-h-11 max-w-full items-center break-words py-2 text-[0.95rem] font-semibold underline decoration-[#1565af] underline-offset-[3px] transition-colors [touch-action:manipulation] active:opacity-90 sm:min-h-0 sm:py-0 sm:text-[clamp(0.8rem,1.85vw,1rem)] sm:hover:opacity-90"
            style={{ color: "var(--link-color)", lineHeight: 1.4 }}
          >
            {t('tutorialSubtitle')}
          </Link>
        </div>
      </div>
    </section>
  );
}
