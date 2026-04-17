'use client';
import { useTranslations } from 'next-intl';
import { Paper, Title, Stack, Text } from "@mantine/core";
import { CARD_PANEL_STYLE } from "@/constants/layout";

type GameDescriptionProps = {
  slug: string;
  longDescription: string[];
};

export default function GameDescription({
  slug,
  longDescription,
}: GameDescriptionProps) {
  const t = useTranslations('gameDescription');
  const tGames = useTranslations('games');

  const paragraphs = tGames.has(`${slug}.long1`)
    ? [tGames(`${slug}.long1`), tGames(`${slug}.long2`), tGames(`${slug}.long3`)]
    : longDescription;

  return (
    <Paper radius={24} p="lg" style={CARD_PANEL_STYLE}>
      <Title order={2} fz="h3">
        {t('title')}
      </Title>

      <Stack gap="md" mt="md">
        {paragraphs.map((paragraph, i) => (
          <Text key={i} fz="md" lh={1.6} c="var(--text-body)">
            {paragraph}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
