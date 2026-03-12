import { Button, Group } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";

export default function BottomButtons() {
  return (
    <Group justify="center" gap="md" mt={48} px="md">
      <Button
        size="lg"
        radius="xl"
        fw={700}
        color="#525B86"
        miw={178}
      >
        Random Game
      </Button>

      <Button
        component="a"
        href="#top"
        size="lg"
        radius="xl"
        fw={700}
        miw={185}
        style={{ background: BLUE_RADIAL_GRADIENT }}
      >
        ↑ Back to the top
      </Button>
    </Group>
  );
}
