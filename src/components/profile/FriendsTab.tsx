"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  getFriendsDashboard,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequestByUsername,
  type FriendsDashboard,
} from "@/lib/supabase/friends";
import { getGameBySlug } from "@/data/games";
import { useTranslations } from "next-intl";

const font = { fontFamily: "var(--font-alexandria), sans-serif" };

type FriendsTabProps = {
  dashboard: FriendsDashboard;
  onRefresh: () => Promise<void>;
};

export default function FriendsTab({ dashboard, onRefresh }: FriendsTabProps) {
  const t = useTranslations("profilePage");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Mark current batch of requests as "seen" for header badge purposes.
    window.dispatchEvent(new CustomEvent("friends:markSeen"));
  }, []);

  useEffect(() => {
    // Re-render every minute so "last seen" labels stay accurate.
    const ticker = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    // Keep presence/game badges reasonably fresh while the friends tab is open.
    const poller = window.setInterval(() => {
      void onRefresh();
    }, 60000);
    return () => window.clearInterval(poller);
  }, [onRefresh]);

  const sortedFriends = useMemo(
    () =>
      [...dashboard.friends].sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return a.displayName.localeCompare(b.displayName);
      }),
    [dashboard.friends]
  );

  const sendRequest = async () => {
    if (sending) return;
    setSending(true);
    setMessage(null);
    const result = await sendFriendRequestByUsername(username);
    setSending(false);
    if (!result.success) {
      setMessage(result.error ?? t("friendRequestFailed"));
      return;
    }
    setUsername("");
    setMessage(t("friendRequestSent"));
    await onRefresh();
  };

  return (
    <Stack gap="md">
      <Group align="end" wrap="nowrap">
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            void sendRequest();
          }}
          placeholder={t("friendUsernamePlaceholder")}
          label={t("addFriend")}
          style={{ flex: 1 }}
        />
        <Button loading={sending} onClick={sendRequest}>
          {t("sendRequest")}
        </Button>
      </Group>

      {message && (
        <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 13 }}>{message}</Text>
      )}

      <SectionTitle>{t("incomingRequests")}</SectionTitle>
      {dashboard.incomingRequests.length === 0 ? (
        <EmptyLine>{t("noIncomingRequests")}</EmptyLine>
      ) : (
        <Stack gap="xs">
          {dashboard.incomingRequests.map((item) => (
            <RowCard key={item.friendshipId}>
              <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 600 }}>
                {item.displayName}
              </Text>
              <Group gap="xs">
                <Button
                  size="xs"
                  loading={busyId === item.friendshipId}
                  onClick={async () => {
                    setBusyId(item.friendshipId);
                    await respondToFriendRequest(item.friendshipId, true);
                    setBusyId(null);
                    await onRefresh();
                  }}
                >
                  {t("accept")}
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  loading={busyId === `${item.friendshipId}-decline`}
                  onClick={async () => {
                    setBusyId(`${item.friendshipId}-decline`);
                    await respondToFriendRequest(item.friendshipId, false);
                    setBusyId(null);
                    await onRefresh();
                  }}
                >
                  {t("decline")}
                </Button>
              </Group>
            </RowCard>
          ))}
        </Stack>
      )}

      <SectionTitle>{t("friends")}</SectionTitle>
      {sortedFriends.length === 0 ? (
        <EmptyLine>{t("noFriendsYet")}</EmptyLine>
      ) : (
        <Stack gap="xs">
          {sortedFriends.map((friend) => {
            const game = friend.currentGameSlug ? getGameBySlug(friend.currentGameSlug) : null;
            return (
              <RowCard
                key={friend.friendshipId}
                onClick={() => router.push(`/profile/${friend.userId}`)}
              >
                <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                    <Box
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid var(--border-color)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={friend.avatarUrl || "/images/bobcat.png"}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/images/bobcat.png";
                        }}
                      />
                    </Box>
                    {friend.isOnline && (
                      <Box
                        aria-label={t("friendOnline")}
                        title={t("friendOnline")}
                        style={{
                          position: "absolute",
                          right: -1,
                          bottom: -1,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#22c55e",
                          border: "2px solid var(--surface-primary)",
                          boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                        }}
                      />
                    )}
                  </Box>
                  <Stack gap={2} style={{ marginLeft: 10 }}>
                    <Text
                      style={{
                        ...font,
                        color: "var(--text-primary)",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {friend.displayName}
                    </Text>
                    <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 12 }}>
                      {friend.isOnline
                        ? game
                          ? t("friendPlaying", { game: game.title })
                          : t("friendOnline")
                        : t("friendLastSeen", { when: formatLastSeen(friend.lastSeen, t) })}
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    size="xs"
                    variant="default"
                    loading={busyId === `remove-${friend.friendshipId}`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setBusyId(`remove-${friend.friendshipId}`);
                      await removeFriend(friend.friendshipId);
                      setBusyId(null);
                      await onRefresh();
                    }}
                  >
                    {t("removeFriend")}
                  </Button>
                </Group>
              </RowCard>
            );
          })}
        </Stack>
      )}

      <SectionTitle>{t("outgoingRequests")}</SectionTitle>
      {dashboard.outgoingRequests.length === 0 ? (
        <EmptyLine>{t("noOutgoingRequests")}</EmptyLine>
      ) : (
        <Stack gap="xs">
          {dashboard.outgoingRequests.map((item) => (
            <RowCard key={item.friendshipId}>
              <Stack gap={2}>
                <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 600 }}>
                  {item.displayName}
                </Text>
                <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 12 }}>
                  {t("pending")}
                </Text>
              </Stack>
              <Button
                size="xs"
                variant="default"
                loading={busyId === `cancel-${item.friendshipId}`}
                onClick={async () => {
                  setBusyId(`cancel-${item.friendshipId}`);
                  await removeFriend(item.friendshipId);
                  setBusyId(null);
                  await onRefresh();
                }}
              >
                {t("cancelRequest")}
              </Button>
            </RowCard>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ ...font, color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>
      {children}
    </Text>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 13 }}>{children}</Text>
  );
}

function RowCard({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Group
      onClick={onClick}
      justify="space-between"
      wrap="nowrap"
      style={{
        border: "1px solid var(--border-color)",
        background: "var(--card-panel-bg)",
        borderRadius: 10,
        padding: "10px 12px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </Group>
  );
}

function formatLastSeen(
  lastSeen: string | null,
  t: ReturnType<typeof useTranslations<"profilePage">>
): string {
  if (!lastSeen) return t("minutesAgo", { m: 1 });
  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return t("minutesAgo", { m: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hoursAgo", { h: hours });
  return t("daysAgo", { d: Math.floor(hours / 24) });
}
