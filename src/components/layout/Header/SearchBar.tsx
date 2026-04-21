'use client';
import { useTranslations } from 'next-intl';
import { TextInput } from "@mantine/core";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { games } from '@/data/games';

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: () => void;
};

export default function SearchBar({ value, onChange, onSelect }: SearchBarProps) {
  const t = useTranslations('nav');
  const router = useRouter();

  const results = value.trim().length > 0
    ? games.filter(g => g.title.toLowerCase().includes(value.trim().toLowerCase()))
    : [];

  function handleSelect(slug: string) {
    router.push(`/games/${slug}`);
    onSelect?.();
  }

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 580, marginLeft: 'auto', minWidth: 0 }}>
      <TextInput
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={onChange}
        radius="xl"
        size="md"
        rightSection={<img src="/images/search.svg" alt="" aria-hidden width={20} height={20} style={{ filter: "var(--icon-filter)" }} />}
        styles={{
          input: {
            background: "var(--overlay-bg)",
            border: "1px solid var(--overlay-border)",
            color: "white",
          },
        }}
      />
      {results.length > 0 && (
        <div className="search-popup" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'var(--search-popup-bg)',
          border: "1px solid var(--overlay-border)",
          borderRadius: 12,
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {results.map(game => (
            <button
              key={game.slug}
              className="search-popup-btn"
              onClick={() => handleSelect(game.slug)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                padding: '14px 20px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: 'var(--search-popup-text)',
                cursor: 'pointer',
                fontSize: 18,
              }}
            >
              <Image
                src={game.thumbnailSrc}
                alt={game.title}
                width={80}
                height={52}
                style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />
              {game.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
