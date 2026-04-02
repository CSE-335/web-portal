import Image from "next/image";
import { Group, ActionIcon, Button } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";
import type { User } from "@supabase/supabase-js";
import { signOutUser } from "@/lib/supabase/auth";

interface UtilityNavProps {
  loginModalOpened: boolean;
  setLoginModalOpened: (opened: boolean) => void;
  user: User | null;
}

export default function UtilityNav({
  loginModalOpened,
  setLoginModalOpened,
  user,
}: UtilityNavProps) {
  const handleSignOut = async () => {
    await signOutUser();
  };

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

      {user ? (
        <ActionIcon
          variant="filled"
          color="#585D92"
          radius="xl"
          size="xl"
          aria-label="Account"
          onClick={handleSignOut}
        >
          <Image
            src="/images/bobcat.png"
            alt="Profile" // TODO: replace with user-selected avatar when profile pictures are implemented
            width={50}
            height={50}
              style={{ borderRadius: "50%"}}
          />
        </ActionIcon>
      ) : (
        <Button
          onClick={() => setLoginModalOpened(true)}
          size="md"
          style={{ background: BLUE_RADIAL_GRADIENT }}
        >
          Log in
        </Button>
      )}
    </Group>
  );
}
