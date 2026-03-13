import { Paper, Title, Stack, Text } from "@mantine/core";
import { CARD_PANEL_STYLE } from "@/constants/layout";

type GameDescriptionProps = {
  longDescription: string[];
};

export default function GameDescription({
  longDescription,
}: GameDescriptionProps) {
  return (
    <Paper radius={24} p="lg" style={CARD_PANEL_STYLE}>
      <Title order={2} fz="h3">
        Game Description
      </Title>

      <Stack gap="md" mt="md">
        {longDescription.map((paragraph) => (
          <Text key={paragraph} fz="md" lh={1.6} c="rgba(255,255,255,0.82)">
            {paragraph}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
