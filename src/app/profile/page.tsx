"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import {
  Container,
  Stack,
  Group,
  Text,
  Title,
  Box,
  Tabs,
  Loader,
  SimpleGrid,
  UnstyledButton,
} from "@mantine/core";
import { supabase } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { getUserLikedGames, getUserLikesCount } from "@/lib/supabase/game-likes";
import { getPlayStreak, getRecentActivity } from "@/lib/supabase/play-sessions";
import { generateUsername } from "@/lib/utils/generateUsername";
import { getGameBySlug } from "@/data/games";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import ProfilePopup from "@/components/ProfilePopup";
import { pageTheme } from "@/lib/theme/pageTheme";
import classes from "./profile.module.css";

type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

const font = { fontFamily: "var(--font-alexandria), sans-serif" };

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "liked";
  const t = useTranslations('profilePage');

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [playStreak, setPlayStreak] = useState(0);
  const [likedGames, setLikedGames] = useState<{ game_slug: string; created_at: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ game_slug: string; started_at: string; duration_seconds: number | null }[]>([]);
  const [bannerHovered, setBannerHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [editDrawerOpened, setEditDrawerOpened] = useState(false);
  const [now] = useState(() => Date.now());

  const loadProfileData = useCallback(async (userId: string) => {
    const [profileData, likes, streak, liked, activity] = await Promise.all([
      getUserProfile(userId),
      getUserLikesCount(userId),
      getPlayStreak(userId),
      getUserLikedGames(userId),
      getRecentActivity(userId),
    ]);
    setProfile(profileData);
    setLikesCount(likes);
    setPlayStreak(streak);
    setLikedGames(liked);
    setRecentActivity(activity);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/"); return; }
      setUser(data.user);
      loadProfileData(data.user.id).then(() => setLoading(false));
    });
  }, [router, loadProfileData]);

  if (loading || !user) {
    return (
      <Container size="lg" py={80}>
        <Stack align="center"><Loader color="#1b41ff" /></Stack>
      </Container>
    );
  }

  const displayName = profile?.display_name || user.user_metadata?.display_name || generateUsername(user.id);
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || "/images/bobcat.png";
  const bannerUrl = profile?.banner_url || null;
  const locale = profile?.locale?.trim() || null;
  const locationLabel = locale || t('locationUnknown');
  const memberSince = user.created_at ? new Date(user.created_at) : new Date();
  const memberDays = Math.floor((now - memberSince.getTime()) / 86400000);
  const lastPlayed = recentActivity.length > 0 ? getGameBySlug(recentActivity[0].game_slug) : null;

  const memberDaysLabel = memberDays === 0 ? t('today') : t('days', { count: memberDays });
  const playStreakLabel = t('days', { count: playStreak });

  return (
    <Container size="xl" py={0} px={0} style={{ maxWidth: 1100, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 24px rgba(27, 65, 255, 0.15), 0 12px 48px rgba(0, 0, 0, 0.2)" }}>

      {/* Banner */}
      <Box
        style={{ position: "relative", height: 240, borderRadius: "14px 14px 0 0", overflow: "hidden", cursor: "pointer" }}
        onMouseEnter={() => setBannerHovered(true)}
        onMouseLeave={() => setBannerHovered(false)}
      >
        {bannerUrl
          ? <Image src={bannerUrl} alt="Banner" fill style={{ objectFit: "cover" }} />
          : <Box style={{ width: "100%", height: "100%", background: "var(--profile-banner-bg)" }} />
        }
        {bannerHovered && (
          <Box style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Group gap={8}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 500, fontSize: 14 }}>{t('editProfile')}</Text>
            </Group>
          </Box>
        )}
      </Box>

      {/* Identity bar */}
      <Box style={{ backgroundColor: "var(--surface-primary)", padding: "0 28px 16px" }}>
        <Group align="flex-end" gap="lg" style={{ marginTop: -60 }}>
          {/* Avatar*/}
          <Box
            style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
          >
            <Box style={{ width: 120, height: 120, borderRadius: 14, overflow: "hidden", border: "4px solid var(--surface-primary)", boxShadow: "var(--shadow-card)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="Avatar" width={120} height={120} style={{ objectFit: "cover", display: "block" }} />
            </Box>
            {avatarHovered && (
              <Box style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </Box>
            )}
          </Box>

          {/* User info */}
          <Stack gap={4} pb={2} style={{ minWidth: 0, flex: "1 1 auto" }}>
            <Title order={2} style={{ ...font, color: "var(--text-primary)", fontWeight: 700, fontSize: 26, lineHeight: 1.1 }}>
              {displayName}
            </Title>
            <Group gap={5} wrap="nowrap" style={{ color: "var(--text-secondary)", minWidth: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 6.1 12.26 6.36 12.56a.86.86 0 0 0 1.28 0C12.9 21.26 19 14.25 19 9c0-3.86-3.14-7-7-7Zm0 9.8A2.8 2.8 0 1 1 12 6.2a2.8 2.8 0 0 1 0 5.6Z" />
              </svg>
              <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }} lineClamp={1}>
                {locationLabel}
              </Text>
            </Group>
          </Stack>

          {/* Edit button */}
          <Box ml="auto" pb={8}>
            <UnstyledButton
              onClick={() => setEditDrawerOpened(true)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", ...pageTheme.primaryButton, boxShadow: "0 2px 8px rgba(27, 65, 255, 0.35)", ...font, fontWeight: 500, fontSize: 13, transition: "transform 0.1s ease" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              {t('editProfile')}
            </UnstyledButton>
          </Box>
        </Group>
      </Box>

      {/* Body */}
      <Box style={{ backgroundColor: "var(--surface-primary)", borderRadius: "0 0 14px 14px" }}>
        <Group align="flex-start" gap={0} wrap="nowrap">

          {/* Sidebar */}
          <Box style={{ width: 220, flexShrink: 0, padding: "24px 20px", borderRight: "1px solid var(--border-color)" }}>
            <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{t('stats')}</Text>
            <Stack gap={20}>
              <StatRow
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: "var(--text-secondary)" }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                label={t('memberFor')}
                value={memberDaysLabel}
              />
              <StatRow
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: "var(--text-secondary)" }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                label={t('gamesLiked')}
                value={String(likesCount)}
              />
              <StatRow
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: "var(--text-secondary)" }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                label={t('playstreak')}
                value={playStreakLabel}
              />
            </Stack>

            {lastPlayed && (
              <>
                <Box style={{ borderTop: "1px solid var(--border-color)", margin: "24px 0" }} />
                <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>{t('recentlyPlayed')}</Text>
                <Link href={`/games/${lastPlayed.slug}`} style={{ textDecoration: "none" }}>
                  <Group gap={10}>
                    <Box style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      <Image src={lastPlayed.thumbnailSrc} alt={lastPlayed.title} width={44} height={44} style={{ objectFit: "cover" }} />
                    </Box>
                    <Stack gap={2}>
                      <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{lastPlayed.title}</Text>
                      <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 11 }}>{formatTimeAgo(recentActivity[0].started_at, t)}</Text>
                    </Stack>
                  </Group>
                </Link>
              </>
            )}
          </Box>

          {/* Tabs */}
          <Box style={{ flex: 1, minWidth: 0, padding: "24px 28px" }}>
            <Tabs defaultValue={initialTab} color="#1b41ff" classNames={{ tab: classes.tab }} styles={{
              root: { ...font, '--tab-border-color': 'transparent' } as React.CSSProperties,
              tab: { ...font, color: "var(--text-secondary)", fontWeight: 500, fontSize: 14, padding: "10px 22px", border: "none", borderRadius: "8px 8px 0 0", transition: "color 0.15s, background 0.15s" },
              list: { borderBottom: "none", gap: 8 },
            }}>
              <Tabs.List>
                <Tabs.Tab value="liked">{t('tabLiked')}</Tabs.Tab>
                <Tabs.Tab value="leaderboards">{t('tabLeaderboards')}</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="liked" pt="lg">
                {likedGames.length === 0 ? (
                  <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "48px 0" }}>
                    {t('noLikedGames')}
                  </Text>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {likedGames.map((like) => {
                      const game = getGameBySlug(like.game_slug);
                      if (!game) return null;
                      return (
                        <Link key={like.game_slug} href={`/games/${game.slug}`} style={{ textDecoration: "none" }}>
                          <Box style={{ borderRadius: 10, overflow: "hidden", background: "var(--card-panel-bg)", border: "1px solid var(--border-color)", cursor: "pointer" }}>
                            <Box style={{ position: "relative", height: 130, overflow: "hidden" }}>
                              <Image src={game.thumbnailSrc} alt={game.title} fill style={{ objectFit: "cover" }} />
                            </Box>
                            <Box style={{ padding: "12px 14px" }}>
                              <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>{game.title}</Text>
                              <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }} lineClamp={2}>{game.description}</Text>
                            </Box>
                          </Box>
                        </Link>
                      );
                    })}
                  </SimpleGrid>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="leaderboards" pt="lg">
                <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "48px 0" }}>
                  {t('leaderboardsSoon')}
                </Text>
              </Tabs.Panel>
            </Tabs>
          </Box>
        </Group>
      </Box>

      {user && (
        <ProfilePopup
          opened={editDrawerOpened}
          onClose={() => { setEditDrawerOpened(false); loadProfileData(user.id); }}
          user={user}
          initialView="edit"
        />
      )}
    </Container>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Group gap={12} align="flex-start">
      <Box style={{ marginTop: 14, flexShrink: 0 }}>{icon}</Box>
      <Stack gap={1}>
        <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", color: "var(--text-secondary)", fontSize: 12 }}>{label}</Text>
        <Text style={{ fontFamily: "var(--font-alexandria), sans-serif", color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>{value}</Text>
      </Stack>
    </Group>
  );
}

function formatTimeAgo(dateStr: string, t: ReturnType<typeof useTranslations<'profilePage'>>): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { m: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('hoursAgo', { h: hours });
  return t('daysAgo', { d: Math.floor(hours / 24) });
}
