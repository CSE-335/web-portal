'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { Group, ActionIcon, Button, Popover } from "@mantine/core";
import { BLUE_RADIAL_GRADIENT } from "@/constants/layout";
import type { User } from "@supabase/supabase-js";
import ProfilePopup from "@/components/ProfilePopup";
import { getUserProfile } from "@/lib/supabase/user-profile";
import ThemeToggle from "@/components/layout/Header/ThemeToggle";
import LocaleSwitcher from "@/components/LocaleSwitcher";


interface UtilityNavProps {
  loginModalOpened: boolean;
  setLoginModalOpened: (opened: boolean) => void;
  user: User | null;
}

export default function UtilityNav({
  setLoginModalOpened,
  user,
}: UtilityNavProps) {
  const [profileOpened, setProfileOpened] = useState(false);
  const [langOpened, setLangOpened] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/bobcat.png");
  const router = useRouter();
  const t = useTranslations('nav');

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((profile) => {
        setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || "/images/bobcat.png");
      });
    }
  }, [user]);

  return (
    <Group gap="sm" wrap="nowrap" ml="auto">
      <ThemeToggle />

      <Popover
        opened={langOpened}
        onChange={setLangOpened}
        position="bottom-end"
        offset={8}
        shadow="xl"
        radius="md"
        width={220}
      >
        <Popover.Target>
          <ActionIcon
            variant="filled"
            color="#585D92"
            radius="xl"
            size="xl"
            className="btn-theme"
            aria-label="Language"
            onClick={() => setLangOpened((o) => !o)}
          >
            <Image src="/images/language.svg" alt="" width={24} height={24} aria-hidden style={{ filter: 'brightness(0) invert(1)' }} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown
          style={{
            background: 'var(--locale-dropdown-bg)',
            border: '1px solid var(--locale-dropdown-border)',
            boxShadow: 'var(--locale-dropdown-shadow)',
            padding: '8px 4px',
          }}
        >
          <LocaleSwitcher onClose={() => setLangOpened(false)} />
        </Popover.Dropdown>
      </Popover>

      <ActionIcon
        variant="filled"
        color="#585D92"
        radius="xl"
        size="xl"
        className="btn-theme"
        aria-label="Favorites"
        onClick={() => router.push("/profile?tab=liked")}
      >
        <Image src="/images/like.svg" alt="" width={20} height={20} aria-hidden />
      </ActionIcon>

      {user ? (
        <>
          <ActionIcon
            variant="filled"
            color="#585D92"
            radius="xl"
            size="xl"
            className="btn-theme"
            aria-label="Account"
            onClick={() => setProfileOpened(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="Profile"
              width={50}
              height={50}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </ActionIcon>
          <ProfilePopup
            opened={profileOpened}
            onClose={() => setProfileOpened(false)}
            user={user}
          />
        </>
      ) : (
        <Button
          onClick={() => setLoginModalOpened(true)}
          size="md"
          style={{ background: BLUE_RADIAL_GRADIENT }}
        >
          {t('logIn')}
        </Button>
      )}
    </Group>
  );
}
