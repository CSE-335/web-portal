'use client';
import { useTranslations } from 'next-intl';
import { Paper, Title, SimpleGrid, Text } from "@mantine/core";
import { CARD_PANEL_STYLE } from "@/constants/layout";
import DetailCard from "./DetailCard";

type GameDetailsProps = {
  subject: string;
  description: string;
};

export default function GameDetails({ subject, description }: GameDetailsProps) {
  const t = useTranslations('gameDetails');
  const tCard = useTranslations('gameCard');

  return (
    <Paper radius={24} p="lg" style={CARD_PANEL_STYLE}>
      <Title order={2} fz="h3">
        {t('title')}
      </Title>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mt="md">
        <DetailCard label={t('subject')} value={tCard.has(subject) ? tCard(subject) : subject} />
        <DetailCard label={t('playStyle')} value={t('playStyleValue')} />
        <DetailCard label={t('access')} value={t('accessValue')} />
      </SimpleGrid>

      <Text fz="md" lh={1.6} c="var(--text-body)" mt="lg">
        {description}
      </Text>
    </Paper>
  );
}
