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
      <div className="relative min-h-[200px] w-full md:min-h-[240px] md:aspect-[2400/800] lg:aspect-[2400/720]">
        <Image
          src="/images/welcome-stem-banner.png"
          alt=""
          fill
          className="object-cover object-[75%_center] md:object-[center]"
          sizes="100vw"
          priority
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center px-5 py-5 sm:px-8 md:px-12">
        <div className="pointer-events-auto max-w-full rounded-xl px-4 py-3 sm:max-w-[min(28rem,calc(52%-2rem))] sm:bg-transparent sm:px-2 sm:py-2 md:py-4 bg-white/[0.92] backdrop-blur-[3px] sm:backdrop-blur-0 md:rounded-none md:bg-transparent md:backdrop-blur-none">
          <h1
            id="welcome-banner-heading"
            className="text-balance font-extrabold leading-tight tracking-tight"
            style={{
              color: '#0f2847',
              fontSize: 'clamp(1.35rem, 3vw, 2.45rem)',
              textShadow: '0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            {title}
          </h1>
          <Link
            href="/tutorial"
            className="mt-3 inline-block font-semibold underline decoration-[#1565af] underline-offset-[3px] transition-colors hover:text-[#0b5294]"
            style={{ color: '#1157a8', fontSize: 'clamp(0.8rem, 1.85vw, 1rem)', lineHeight: 1.4 }}
          >
            {t('tutorialSubtitle')}
          </Link>
        </div>
      </div>
    </section>
  );
}
