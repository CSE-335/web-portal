/** @jest-environment node */
import {
  CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT,
  buildCircuitBreakerTrackedPaths,
  parseLeaderboardTrack,
} from "./leaderboardTracks";

describe("parseLeaderboardTrack", () => {
  it("accepts circuit-endless for circuit-breaker", () => {
    expect(parseLeaderboardTrack("circuit-breaker", "circuit-endless")).toBe("circuit-endless");
  });

  it("accepts circuit-level-N for circuit-breaker within range", () => {
    expect(parseLeaderboardTrack("circuit-breaker", "circuit-level-1")).toBe("circuit-level-1");
    expect(parseLeaderboardTrack("circuit-breaker", "circuit-level-5")).toBe("circuit-level-5");
  });

  it("rejects out-of-range circuit levels", () => {
    expect(parseLeaderboardTrack("circuit-breaker", "circuit-level-0")).toBe("overall");
    expect(
      parseLeaderboardTrack(
        "circuit-breaker",
        `circuit-level-${CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT + 1}`,
      ),
    ).toBe("overall");
  });

  it("keeps matrix-meadow drill tracks", () => {
    expect(parseLeaderboardTrack("matrix-meadow", "multiplication-drill")).toBe(
      "multiplication-drill",
    );
  });
});

describe("buildCircuitBreakerTrackedPaths", () => {
  it("includes overall, endless, and per-level keys", () => {
    const paths = buildCircuitBreakerTrackedPaths();
    expect(paths.overall?.length).toBeGreaterThan(0);
    expect(paths["circuit-endless"]).toContain("endlessBest.score");
    expect(paths["circuit-level-1"]).toContain("circuitBreaker.levels.1.highScore");
    expect(paths["circuit-level-1"]).toContain("campaignBests.1.speedScore");
    expect(paths[`circuit-level-${CIRCUIT_BREAKER_LEADERBOARD_LEVEL_COUNT}`]).toBeDefined();
  });
});
