import Link from "next/link";
import Image from "next/image";
import { Group, ActionIcon, Button } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";

interface UtilityNavProps {
  loginModalOpened: boolean;
  setLoginModalOpened: (opened: boolean) => void;
}

export default function UtilityNav({ loginModalOpened, setLoginModalOpened }: UtilityNavProps) {
  return (
    <Group gap="sm" wrap="nowrap" ml="auto">
      <ActionIcon
        variant="filled"
        color="#585D92"
        radius="xl"
        size="xl"
        aria-label="Favorites"
      >
        <Image src="/images/like.svg" alt="" width={20} height={20} aria-hidden />
      </ActionIcon>

      <Button
        onClick={() => setLoginModalOpened(true)}
        size="md"
        style={{ background: BLUE_RADIAL_GRADIENT }}
      >
        Log in
      </Button>
    </Group>
  );
}
