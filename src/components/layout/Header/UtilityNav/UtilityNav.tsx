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
import FlagIcon from "@/components/FlagIcon";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/routing";


interface UtilityNavProps {
  loginModalOpened: boolean;
  setLoginModalOpened: (opened: boolean) => void;
  user: User | null;
  compact?: boolean;
}

export default function UtilityNav({
  setLoginModalOpened,
  user,
  compact = false,
}: UtilityNavProps) {
  const [profileOpened, setProfileOpened] = useState(false);
  const [langOpened, setLangOpened] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/bobcat.png");
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const router = useRouter();
  const t = useTranslations('nav');

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((profile) => {
        setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || "/images/bobcat.png");
      });
    }
  }, [user]);

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
    const raw = match?.[1];
    if (raw && locales.includes(raw as Locale)) {
      setCurrentLocale(raw as Locale);
    }
  }, []);

  return (
    <Group gap="sm" wrap={compact ? "wrap" : "nowrap"} ml={compact ? 0 : "auto"} justify={compact ? "center" : undefined}>
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
            <FlagIcon locale={currentLocale} style={{ width: 24, borderRadius: 2, flexShrink: 0 }} />
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
          fullWidth={compact}
        >
          {t('logIn')}
        </Button>
      )}
    </Group>
  );
}
