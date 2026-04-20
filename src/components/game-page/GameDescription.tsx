'use client';
import { useTranslations } from 'next-intl';
import { Paper, Title, Stack, Text } from "@mantine/core";
import { CARD_PANEL_STYLE } from "@/constants/layout";

type GameDescriptionProps = {
  longDescription: string[];
};

export default function GameDescription({
  longDescription,
}: GameDescriptionProps) {
  const t = useTranslations('gameDescription');

  return (
    <Paper radius={24} p="lg" style={CARD_PANEL_STYLE}>
      <Title order={2} fz="h3">
        {t('title')}
      </Title>

      <Stack gap="md" mt="md">
        {longDescription.map((paragraph, i) => (
          <Text key={i} fz="md" lh={1.6} c="var(--text-body)">
            {paragraph}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
