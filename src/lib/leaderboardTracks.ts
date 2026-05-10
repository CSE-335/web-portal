/**
 * Shared leaderboard track ids and JSON paths for games with multiple score columns.
 */

/**
 * Circuit Breaker campaign charges: level ids 1–5 only (`campaignBests` keys are sparse).
 * Keep in sync with the embedded game's campaign length, not an arbitrary cap.
 */
export const CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT = 5;

function circuitBreakerLevelPathCandidates(levelKey: string): string[] {
  const k = levelKey;
  return [
    // Hub-native / explicit level objects
    `circuitBreaker.levels.${k}.highScore`,
    `circuitBreaker.levels.${k}.score`,
    `circuitBreaker.levelScores.${k}`,
    // Game-repo shape: campaignBests map (speedScore = higher-is-better; see README)
    `campaignBests.${k}.speedScore`,
    `campaignBests.${k}.highScore`,
    `campaignBests.${k}.score`,
    `campaignBests.${k}.diffusalScore`,
    `circuitBreaker.campaignBests.${k}.speedScore`,
    `circuitBreaker.campaignBests.${k}.highScore`,
    `circuitBreaker.campaignBests.${k}.score`,
    `circuitBreaker.campaignBests.${k}.diffusalScore`,
  ];
}

const CIRCUIT_ENDLESS_TRACK = "circuit-endless";

const circuitEndlessPathCandidates = [
  "endlessBest.score",
  "endlessBest.highScore",
  "circuitBreaker.endless.highScore",
  "circuitBreaker.endless.score",
  "circuitBreaker.endlessBest.score",
  "circuitBreaker.endlessBest.highScore",
];

export function buildCircuitBreakerTrackedPaths(): Record<string, string[]> {
  const overall = [
    "highScore",
    "score",
    "circuitBreaker.highScore",
    "circuitBreaker.score",
  ];
  const out: Record<string, string[]> = {
    overall,
    [CIRCUIT_ENDLESS_TRACK]: circuitEndlessPathCandidates,
  };
  for (let i = 1; i <= CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT; i++) {
    const k = String(i);
    out[`circuit-level-${i}`] = circuitBreakerLevelPathCandidates(k);
  }
  return out;
}

export function circuitBreakerScoreTrackSelectOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [
    { value: "overall", label: "Overall" },
    { value: CIRCUIT_ENDLESS_TRACK, label: "Endless" },
  ];
  for (let i = 1; i <= CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT; i++) {
    opts.push({ value: `circuit-level-${i}`, label: `Level ${i}` });
  }
  return opts;
}

/**
 * Resolves `?track=` for GET /api/leaderboards. Unknown values fall back to `overall`.
 */
export function parseLeaderboardTrack(slug: string, requested: string | null): string {
  const t = (requested ?? "").trim() || "overall";
  if (t === "overall") return "overall";

  if (slug === "matrix-meadow") {
    if (t === "multiplication-drill" || t === "vocabulary-quiz") return t;
  }

  if (slug === "circuit-breaker") {
    if (t === CIRCUIT_ENDLESS_TRACK) return t;
    const m = /^circuit-level-(\d+)$/.exec(t);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT) return t;
    }
  }

  return "overall";
}
