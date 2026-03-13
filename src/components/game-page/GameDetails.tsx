import { Paper, Title, SimpleGrid, Text } from "@mantine/core";
import { CARD_PANEL_STYLE } from "@/constants/layout";
import DetailCard from "./DetailCard";

type GameDetailsProps = {
  subject: string;
  description: string;
};

export default function GameDetails({ subject, description }: GameDetailsProps) {
  return (
    <Paper radius={24} p="lg" style={CARD_PANEL_STYLE}>
      <Title order={2} fz="h3">
        Game Details
      </Title>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mt="md">
        <DetailCard label="Subject" value={subject} />
        <DetailCard label="Play Style" value="Interactive web game" />
        <DetailCard label="Access" value="Browser-based, no download required" />
      </SimpleGrid>

      <Text fz="md" lh={1.6} c="rgba(255,255,255,0.85)" mt="lg">
        {description}
      </Text>
    </Paper>
  );
}
