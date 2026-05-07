import type { CSSProperties } from 'react';
import US from 'country-flag-icons/react/3x2/US';
import ES from 'country-flag-icons/react/3x2/ES';
import CN from 'country-flag-icons/react/3x2/CN';
import IN from 'country-flag-icons/react/3x2/IN';
import SA from 'country-flag-icons/react/3x2/SA';
import FR from 'country-flag-icons/react/3x2/FR';
import PT from 'country-flag-icons/react/3x2/PT';
import RU from 'country-flag-icons/react/3x2/RU';
import DE from 'country-flag-icons/react/3x2/DE';
import JP from 'country-flag-icons/react/3x2/JP';
import KR from 'country-flag-icons/react/3x2/KR';
import type { Locale } from '@/i18n/routing';

const FLAGS_BY_LOCALE = {
  en: US,
  es: ES,
  zh: CN,
  hi: IN,
  ar: SA,
  fr: FR,
  pt: PT,
  ru: RU,
  de: DE,
  ja: JP,
  ko: KR,
} as const;

type FlagIconProps = {
  locale: Locale;
  style?: CSSProperties;
  title?: string;
};

export default function FlagIcon({ locale, style, title }: FlagIconProps) {
  const Flag = FLAGS_BY_LOCALE[locale];
  return <Flag title={title} style={style} />;
}
