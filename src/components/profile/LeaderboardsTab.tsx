"use client";

import { useEffect, useMemo, useState } from "react";
import { Group, Loader, Select, SegmentedControl, Stack, Text, Avatar, Badge } from "@mantine/core";
import { useTranslations } from "next-intl";
import { games } from "@/data/games";
import { circuitBreakerScoreTrackSelectOptions } from "@/lib/leaderboardTracks";

type Scope = "global" | "friends";

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bestScore: number;
};

type LeaderboardResponse = {
  ok: true;
  scope: Scope;
  mode: "per-game";
  slug?: string;
  track?: string;
  entries: LeaderboardEntry[];
};

type LeaderboardsTabProps = {
  initialGameSlug?: string | null;
};

const font = { fontFamily: "var(--font-alexandria), sans-serif" };

export default function LeaderboardsTab({ initialGameSlug }: LeaderboardsTabProps) {
  const t = useTranslations("profilePage");
  const [scope, setScope] = useState<Scope>("global");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialGameSlug ?? games[0]?.slug ?? null);
  const [track, setTrack] = useState<string>("overall");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const gameOptions = useMemo(
    () =>
      games.map((g) => ({
        value: g.slug,
        label: g.title,
      })),
    []
  );

  const scoreTrackOptionsBySlug: Partial<Record<string, { value: string; label: string }[]>> = useMemo(
    () => ({
      "matrix-meadow": [
        { value: "overall", label: "Overall" },
        { value: "multiplication-drill", label: "Multiplication Drill" },
        { value: "vocabulary-quiz", label: "Vocabulary Quiz" },
      ],
      "circuit-breaker": circuitBreakerScoreTrackSelectOptions(),
    }),
    []
  );

  const scoreTrackOptions = useMemo(
    () => (selectedSlug ? scoreTrackOptionsBySlug[selectedSlug] ?? [{ value: "overall", label: "Overall" }] : []),
    [scoreTrackOptionsBySlug, selectedSlug]
  );

  useEffect(() => {
    if (scoreTrackOptions.length === 0) return;
    if (!scoreTrackOptions.some((option) => option.value === track)) {
      setTrack(scoreTrackOptions[0].value);
    }
  }, [scoreTrackOptions, track]);

  useEffect(() => {
    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("scope", scope);
        if (selectedSlug) params.set("slug", selectedSlug);
        params.set("track", track);
        const res = await fetch(`/api/leaderboards?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to load leaderboards.");
        }
        const json = (await res.json()) as LeaderboardResponse | { ok?: false; error?: string };
        if (!("ok" in json) || !json.ok) {
          throw new Error(json && "error" in json && typeof json.error === "string" ? json.error : "Failed to load leaderboards.");
        }
        if (!aborted) {
          setEntries(json.entries);
        }
      } catch (err) {
        if (!aborted) {
          setError(err instanceof Error ? err.message : String(err));
          setEntries([]);
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    }

    if (!selectedSlug) {
      // No game selected yet – don't fire a request.
      setEntries([]);
      setLoading(false);
      return;
    }

    void load();
    return () => {
      aborted = true;
    };
  }, [scope, selectedSlug, track]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="xs" wrap="wrap">
          <SegmentedControl
            value={scope}
            onChange={(value) => setScope(value as Scope)}
            data={[
              { value: "global", label: t("leaderboardsGlobal") },
              { value: "friends", label: t("leaderboardsFriends") },
            ]}
          />
        </Group>

        <Select
          value={selectedSlug}
          onChange={setSelectedSlug}
          placeholder={t("leaderboardsSelectGame")}
          data={gameOptions}
          searchable
          style={{ minWidth: 220 }}
        />
      </Group>

      {scoreTrackOptions.length > 1 && scoreTrackOptions.length <= 6 && (
        <Group>
          <SegmentedControl
            value={track}
            onChange={(value) => setTrack(value)}
            data={scoreTrackOptions}
          />
        </Group>
      )}

      {scoreTrackOptions.length > 6 && (
        <Select
          label={t("leaderboardsScoreTrack")}
          value={track}
          onChange={(value) => value && setTrack(value)}
          data={scoreTrackOptions}
          searchable
          style={{ maxWidth: 360 }}
        />
      )}

      {loading && (
        <Group justify="center" py="xl">
          <Loader color="#1b41ff" />
        </Group>
      )}

      {!loading && error && (
        <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center" }}>
          {t("leaderboardsError")}
        </Text>
      )}

      {!loading && !error && entries.length === 0 && (
        <Text style={{ ...font, color: "var(--text-secondary)", fontSize: 14, textAlign: "center" }}>
          {t("leaderboardsEmpty")}
        </Text>
      )}

      {!loading && !error && entries.length > 0 && (
        <Stack gap="xs">
          {entries.map((entry, index) => (
            <Group
              key={entry.userId}
              justify="space-between"
              wrap="nowrap"
              style={{
                border: "1px solid var(--border-color)",
                background: "var(--card-panel-bg)",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Badge
                  variant="filled"
                  color={index === 0 ? "yellow" : index === 1 ? "gray" : index === 2 ? "orange" : "blue"}
                  radius="xl"
                >
                  #{index + 1}
                </Badge>
                <Avatar src={entry.avatarUrl ?? "/images/bobcat.png"} radius="xl" size="sm" />
                <Stack gap={0}>
                  <Text
                    style={{
                      ...font,
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {entry.displayName}
                  </Text>
                  <Text
                    style={{
                      ...font,
                      color: "var(--text-secondary)",
                      fontSize: 12,
                    }}
                  >
                    {t("leaderboardsScore", { score: entry.bestScore })}
                  </Text>
                </Stack>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

