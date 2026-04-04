'use client';
import { useTranslations } from 'next-intl';
import Image from "next/image";

export default function WelcomeBanner() {
  const t = useTranslations('home');
  return (
    <section className="llnl-banner mb-8 rounded-[20px] px-6 py-6" style={{ background: "var(--surface-banner)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/llnl-stem-logo.png"
            alt="LLNL STEM Games logo"
            width={120}
            height={120}
            className="h-auto w-20 md:w-24"
            priority
          />
          <div>
            <h1 className="text-2xl font-extrabold leading-tight md:text-4xl" style={{ color: "white" }}>
              {t('welcome1')}
              <br />
              {t('welcome2')}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm font-semibold md:flex-row md:flex-wrap md:gap-6" style={{ color: "white" }}>
          <div className="flex items-center gap-2">
            <Image src="/images/ai.svg" alt="" width={18} height={18} aria-hidden className="shrink-0 -translate-y-1" style={{ filter: "none" }} />
            {t('interactiveLearning')}
          </div>
          <div className="flex items-center gap-2">
            <Image src="/images/save.svg" alt="" width={21} height={21} aria-hidden className="shrink-0" style={{ filter: "none" }} />
            {t('saveProgress')}
          </div>
          <div className="flex items-center gap-2">
            <Image src="/images/devices.svg" alt="" width={30} height={26} aria-hidden className="shrink-0 translate-y-1" style={{ filter: "none" }} />
            {t('playAnyDevice')}
          </div>
        </div>
      </div>
    </section>
  );
}
