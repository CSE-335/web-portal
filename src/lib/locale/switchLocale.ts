'use client';
import { LOCALE_COOKIE, type Locale } from '@/i18n/routing';

export function switchLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}
