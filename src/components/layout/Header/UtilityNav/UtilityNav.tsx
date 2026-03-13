import Link from "next/link";
import { Group, ActionIcon, Button } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";

export default function UtilityNav() {
  return (
    <Group gap="sm" wrap="nowrap" ml="auto">
      <ActionIcon
        variant="filled"
        color="#585D92"
        radius="xl"
        size="xl"
        aria-label="Favorites"
      >
        ♡
      </ActionIcon>

      <Button
        component={Link}
        href="/login"
        size="md"
        style={{ background: BLUE_RADIAL_GRADIENT }}
      >
        Log in
      </Button>
    </Group>
  );
}
