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
import { getFriendsDashboard } from "@/lib/supabase/friends";


export type UtilityNavDensity = "desktop" | "mobile";

interface UtilityNavProps {
  loginModalOpened: boolean;
  setLoginModalOpened: (opened: boolean) => void;
  user: User | null;
  /** Mobile top bar: tighter controls; desktop uses full-size controls */
  density?: UtilityNavDensity;
}

export default function UtilityNav({
  setLoginModalOpened,
  user,
  density = "desktop",
}: UtilityNavProps) {
  const isMobile = density === "mobile";
  const [profileOpened, setProfileOpened] = useState(false);
  const [langOpened, setLangOpened] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/bobcat.png");
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [lastSeenFriendRequestCount, setLastSeenFriendRequestCount] = useState(0);
  const router = useRouter();
  const t = useTranslations('nav');

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((profile) => {
        setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || "/images/bobcat.png");
      }).catch(() => {
        setAvatarUrl(user.user_metadata?.avatar_url || "/images/bobcat.png");
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

  useEffect(() => {
    const onMarkSeen = () => {
      setLastSeenFriendRequestCount((prev) =>
        pendingFriendRequests > prev ? pendingFriendRequests : prev
      );
    };

    window.addEventListener("friends:markSeen", onMarkSeen);
    return () => {
      window.removeEventListener("friends:markSeen", onMarkSeen);
    };
  }, [pendingFriendRequests]);

  useEffect(() => {
    if (!user) {
      setPendingFriendRequests(0);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const dashboard = await getFriendsDashboard();
        if (!active) return;
        setPendingFriendRequests(dashboard.incomingRequests.length);
      } catch {
        if (!active) return;
        setPendingFriendRequests(0);
      }
    };

    void load();
    const intervalId = window.setInterval(load, 60000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  const languageLabel = t('language');
  const favoritesLabel = t('favorites');
  const accountLabel = t('account');

  return (
    <Group
      gap={isMobile ? "xs" : "sm"}
      wrap="nowrap"
      ml={isMobile ? 0 : "auto"}
      justify={isMobile ? "flex-end" : undefined}
      align="center"
      style={isMobile ? { flexShrink: 0 } : undefined}
    >
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
          <span className="nav-tooltip" data-tooltip={languageLabel}>
            <ActionIcon
              variant="filled"
              color="#585D92"
              radius="xl"
              size={isMobile ? "md" : "xl"}
              className="btn-theme"
              aria-label={languageLabel}
              onClick={() => setLangOpened((o) => !o)}
            >
              <FlagIcon
                locale={currentLocale}
                style={{ width: isMobile ? 20 : 24, borderRadius: 2, flexShrink: 0 }}
              />
            </ActionIcon>
          </span>
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

      <span className="nav-tooltip" data-tooltip={favoritesLabel}>
        <ActionIcon
          variant="filled"
          color="#585D92"
          radius="xl"
          size={isMobile ? "md" : "xl"}
          className="btn-theme"
          aria-label={favoritesLabel}
          onClick={() => router.push("/profile?tab=liked")}
        >
          <Image src="/images/like.svg" alt="" width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} aria-hidden />
        </ActionIcon>
      </span>

      {user ? (
        <>
          <span
            className="nav-tooltip"
            data-tooltip={accountLabel}
            style={{ position: "relative", display: "inline-flex" }}
          >
            <ActionIcon
              variant="filled"
              color="#585D92"
              radius="xl"
              size={isMobile ? "md" : "xl"}
              className="btn-theme"
              aria-label={accountLabel}
              onClick={() => setProfileOpened(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
                onError={(e) => { e.currentTarget.src = "/images/bobcat.png"; }}
              />
            </ActionIcon>
            {pendingFriendRequests > lastSeenFriendRequestCount && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: 999,
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--surface-header)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                }}
              >
                {pendingFriendRequests > 9 ? "9+" : pendingFriendRequests}
              </span>
            )}
          </span>
          <ProfilePopup
            opened={profileOpened}
            onClose={() => setProfileOpened(false)}
            user={user}
          />
        </>
      ) : (
        <span className="nav-tooltip" data-tooltip={t('logIn')}>
          <Button
            onClick={() => setLoginModalOpened(true)}
            size={isMobile ? "xs" : "md"}
            className="nav-login-btn"
            style={{ background: BLUE_RADIAL_GRADIENT }}
            px={isMobile ? 10 : undefined}
          >
            {t('logIn')}
          </Button>
        </span>
      )}
    </Group>
  );
}
