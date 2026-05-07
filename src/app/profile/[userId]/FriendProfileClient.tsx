"use client";

import { Box, Group, SimpleGrid, Stack, Tabs, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getGameBySlug } from "@/data/games";

type FriendProfileClientProps = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string | null;
  locationLabel: string;
  likedGames: { game_slug: string; created_at: string }[];
  friends: { userId: string; displayName: string; avatarUrl: string | null }[];
};

const font = { fontFamily: "var(--font-alexandria), sans-serif" };

export default function FriendProfileClient(props: FriendProfileClientProps) {
  const t = useTranslations("profilePage");

  const liked = props.likedGames.map((row) => ({
    game: getGameBySlug(row.game_slug),
    created_at: row.created_at,
  }));

  return (
    <Box
      style={{
        maxWidth: 1100,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(27, 65, 255, 0.15), 0 12px 48px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Banner */}
      <Box style={{ position: "relative", height: 240, borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
        {props.bannerUrl ? (
          <Image src={props.bannerUrl} alt="Banner" fill style={{ objectFit: "cover" }} />
        ) : (
          <Box style={{ width: "100%", height: "100%", background: "var(--profile-banner-bg)" }} />
        )}
      </Box>

      {/* Identity bar */}
      <Box style={{ backgroundColor: "var(--surface-primary)", padding: "0 28px 16px" }}>
        <Group align="flex-end" gap="lg" style={{ marginTop: -60 }}>
          <Box style={{ position: "relative", cursor: "default", flexShrink: 0 }}>
            <Box
              style={{
                width: 120,
                height: 120,
                borderRadius: 14,
                overflow: "hidden",
                border: "4px solid var(--surface-primary)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <Image
                src={props.avatarUrl}
                alt="Avatar"
                width={120}
                height={120}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
            </Box>
          </Box>

          <Stack gap={4} pb={2} style={{ minWidth: 0, flex: "1 1 auto" }}>
            <Title order={2} style={{ ...font, color: "var(--text-primary)", fontWeight: 700, fontSize: 26, lineHeight: 1.1 }}>
              {props.displayName}
            </Title>
            <Group gap={5} wrap="nowrap" style={{ color: "var(--text-secondary)", minWidth: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 6.1 12.26 6.36 12.56a.86.86 0 0 0 1.28 0C12.9 21.26 19 14.25 19 9c0-3.86-3.14-7-7-7Zm0 9.8A2.8 2.8 0 1 1 12 6.2a2.8 2.8 0 0 1 0 5.6Z" />
              </svg>
              <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }} lineClamp={1}>
                {props.locationLabel}
              </Text>
            </Group>
          </Stack>
        </Group>
      </Box>

      {/* Tabs */}
      <Box style={{ backgroundColor: "var(--surface-primary)", borderRadius: "0 0 14px 14px" }}>
        <Box style={{ padding: "24px 28px" }}>
          <Tabs
            defaultValue="liked"
            color="#1b41ff"
            styles={{
              root: { ...font } as React.CSSProperties,
              tab: { ...font, color: "var(--text-secondary)", fontWeight: 500, fontSize: 14, padding: "10px 22px", border: "none", borderRadius: "8px 8px 0 0" },
              list: { borderBottom: "none", gap: 8 },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="liked">{t("tabLiked")}</Tabs.Tab>
              <Tabs.Tab value="friends">{t("tabFriends")}</Tabs.Tab>
              <Tabs.Tab value="leaderboards">{t("tabLeaderboards")}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="liked" pt="lg">
              {liked.length === 0 ? (
                <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "48px 0" }}>
                  {t("noLikedGames")}
                </Text>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {liked.map(({ game, created_at }) => {
                    if (!game) return null;
                    return (
                      <Link key={`${game.slug}-${created_at}`} href={`/games/${game.slug}`} style={{ textDecoration: "none" }}>
                        <Box style={{ borderRadius: 10, overflow: "hidden", background: "var(--card-panel-bg)", border: "1px solid var(--border-color)", cursor: "pointer" }}>
                          <Box style={{ position: "relative", height: 130, overflow: "hidden" }}>
                            <Image src={game.thumbnailSrc} alt={game.title} fill style={{ objectFit: "cover" }} />
                          </Box>
                          <Box style={{ padding: "12px 14px" }}>
                            <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>{game.title}</Text>
                            <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }} lineClamp={2}>
                              {game.description}
                            </Text>
                          </Box>
                        </Box>
                      </Link>
                    );
                  })}
                </SimpleGrid>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="friends" pt="lg">
              {props.friends.length > 0 ? (
                <Stack gap="sm">
                  {props.friends.map((fp) => (
                    <Link key={fp.userId} href={`/profile/${fp.userId}`} style={{ textDecoration: "none" }}>
                      <Group gap="sm" wrap="nowrap" style={{ borderRadius: 10, border: "1px solid var(--border-color)", padding: "8px 10px", background: "var(--card-panel-bg)" }}>
                        <Box style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                          <Image
                            src={fp.avatarUrl || "/images/bobcat.png"}
                            alt=""
                            width={36}
                            height={36}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                        <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>
                          {fp.displayName || "Player"}
                        </Text>
                      </Group>
                    </Link>
                  ))}
                </Stack>
              ) : (
                <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "32px 0" }}>
                  {t("noFriendsYet")}
                </Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="leaderboards" pt="lg">
              <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "48px 0" }}>
                {t("leaderboardsSoon")}
              </Text>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}

