'use client';
import { useState } from 'react';
import { Group, Stack, UnstyledButton, Text, ScrollArea } from '@mantine/core';
import { locales, languageNames, LOCALE_COOKIE, type Locale } from '@/i18n/routing';
import { switchLocale } from '@/lib/locale/switchLocale';
import FlagIcon from '@/components/FlagIcon';

function readLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const raw = match?.[1];
  if (raw && locales.includes(raw as Locale)) return raw as Locale;
  return 'en';
}

export default function LocaleSwitcher({ onClose }: { onClose?: () => void }) {
  const [current] = useState<Locale>(() => readLocaleFromCookie());

  function handleSelect(locale: Locale) {
    onClose?.();
    switchLocale(locale);
  }

  return (
    <ScrollArea
      h={280}
      type="scroll"
      scrollbarSize={6}
      styles={{
        scrollbar: { background: 'transparent' },
        thumb: { background: 'rgba(255,255,255,0.25)' },
      }}
    >
      <Stack gap={2} p={4}>
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <UnstyledButton
              key={locale}
              onClick={() => handleSelect(locale)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                background: active ? 'var(--locale-active-bg)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--locale-hover-bg)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Group gap={8}>
                <FlagIcon locale={locale} style={{ width: 20, borderRadius: 2, flexShrink: 0 }} />
                <Text size="sm" style={{ color: active ? '#6e90b6' : '#cdd5e0' }} fw={active ? 600 : 400}>
                  {languageNames[locale]}
                </Text>
              </Group>
              {active && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6e90b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </UnstyledButton>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
