export const locales = ['en','es','zh','hi','ar','fr','pt','ru','de','ja','ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const languageNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिन्दी',
  ar: 'العربية',
  fr: 'Français',
  pt: 'Português',
  ru: 'Русский',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
};
