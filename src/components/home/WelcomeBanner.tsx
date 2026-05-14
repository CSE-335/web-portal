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
      <div className="relative h-[210px] w-full max-sm:landscape:h-[150px] sm:min-h-[200px] sm:h-auto md:min-h-[240px] md:aspect-[2400/800] lg:aspect-[2400/720]">
        <Image
          src="/images/welcome-stem-banner-mobile.png"
          alt=""
          fill
          className="block object-cover object-center sm:hidden [@media(orientation:landscape)_and_(max-height:500px)]:block"
          sizes="100vw"
          priority
        />
        <Image
          src="/images/welcome-stem-banner.png"
          alt=""
          fill
          className="hidden object-cover sm:block sm:object-[65%_center] md:object-center [@media(orientation:landscape)_and_(max-height:500px)]:hidden"
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1200px"
          priority
        />
      </div>

      <div className="pointer-events-auto p-3 pt-2 sm:hidden max-sm:landscape:pl-1 max-sm:landscape:pr-2">
        <div
          className="w-full min-w-0 max-w-full rounded-2xl px-4 py-4 shadow-sm backdrop-blur-[3px] max-sm:landscape:px-3"
          style={{ background: "var(--welcome-overlay-mobile-bg)" }}
        >
          <h1
            id="welcome-banner-heading"
            className="max-sm:break-words text-balance font-extrabold leading-[1.2] tracking-tight text-[clamp(1rem,3.7vw+0.45rem,2rem)]"
            style={{
              color: "var(--welcome-banner-title-color)",
              textShadow: 'var(--welcome-banner-heading-shadow)',
            }}
          >
            {title}
          </h1>
          <Link
            href="/tutorial"
            className="mt-3 inline-flex min-h-11 max-w-full items-center break-words py-2 text-[0.95rem] font-semibold underline decoration-[#1565af] underline-offset-[3px] transition-colors [touch-action:manipulation] active:opacity-90"
            style={{ color: "var(--link-color)", lineHeight: 1.4 }}
          >
            {t('tutorialSubtitle')}
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 hidden flex-col justify-center px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:flex sm:flex-row sm:items-center sm:justify-start sm:pl-2 sm:pr-1 sm:pb-3 sm:pt-3 md:hidden"
        style={{ paddingLeft: 'max(0.5rem, env(safe-area-inset-left))', paddingRight: 'max(0.5rem, env(safe-area-inset-right))' }}
      >
        <div
          className="pointer-events-auto w-full min-w-0 max-w-[min(34rem,calc(64%-0.25rem))] rounded-2xl px-5 py-5 shadow-sm backdrop-blur-[3px]"
          style={{ background: "var(--welcome-overlay-mobile-bg)" }}
        >
          <h1
            className="text-balance font-extrabold leading-tight tracking-tight text-[clamp(1.05rem,2.4vw,1.6rem)]"
            style={{
              color: "var(--welcome-banner-title-color)",
              textShadow: 'var(--welcome-banner-heading-shadow)',
            }}
          >
            {title}
          </h1>
          <Link
            href="/tutorial"
            className="mt-2 inline-flex max-w-full items-center break-words py-0 text-[clamp(0.8rem,1.6vw,0.95rem)] font-semibold underline decoration-[#1565af] underline-offset-[3px] transition-colors [touch-action:manipulation] active:opacity-90 hover:opacity-90"
            style={{ color: "var(--link-color)", lineHeight: 1.35 }}
          >
            {t('tutorialSubtitle')}
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 hidden flex-col justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] md:flex md:flex-row md:items-center md:justify-start md:px-12"
        style={{ paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}
      >
        <div
          className="pointer-events-auto w-full min-w-0 max-w-full rounded-2xl px-4 py-4 shadow-sm backdrop-blur-[3px] md:ml-6 md:max-w-[min(38rem,calc(60%-1rem))] md:bg-transparent md:px-10 md:py-9 md:shadow-none md:backdrop-blur-none lg:ml-10 lg:px-11 lg:py-10"
          style={{ background: "var(--welcome-overlay-mobile-bg)" }}
        >
          <h1
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
