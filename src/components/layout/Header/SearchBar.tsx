'use client';
import { useTranslations } from 'next-intl';
import { TextInput } from "@mantine/core";

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTranslations('nav');
  return (
    <TextInput
      placeholder={t('searchPlaceholder')}
      value={value}
      onChange={onChange}
      radius="xl"
      size="md"
      rightSection={<img src="/images/search.svg" alt="" aria-hidden width={20} height={20} style={{ filter: "var(--icon-filter)" }} />}
      flex={1}
      maw={580}
      miw={0}
      ml="auto"
      styles={{
        input: {
          background: "var(--overlay-bg)",
          border: "1px solid var(--overlay-border)",
          color: "white",
        },
      }}
    />
  );
}
