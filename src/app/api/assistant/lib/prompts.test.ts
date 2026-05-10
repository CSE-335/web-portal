/** @jest-environment node */
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import type { AssistantGameIntegration } from "@/features/assistant/gameIntegration";
import type { GameEvent } from "@/features/assistant/types";

const sampleGame: AssistantGameIntegration = {
  slug: "demo-game",
  title: "Demo Game",
  subject: "Mathematics — STEM / educational game",
  tutorBrief: "Players solve ratio puzzles by dragging tiles.",
  defaultTargetConcept: "ratios",
};

describe("buildSystemPrompt", () => {
  it("injects mistake guide when provided", () => {
    const prompt = buildSystemPrompt(4, {
      ...sampleGame,
      mistakeGuide: "- Mixing up part-to-part vs part-to-whole\n- Forgetting to simplify",
    });
    expect(prompt).toContain("Common slips in this game");
    expect(prompt).toContain("part-to-part");
    expect(prompt).toContain("Mistake-first tutoring");
  });

  it("omits mistake section when no guide", () => {
    const prompt = buildSystemPrompt(4, sampleGame);
    expect(prompt).not.toContain("Common slips in this game");
  });
});

describe("buildUserPrompt", () => {
  const baseEvent: GameEvent = {
    gameId: "demo-game",
    levelId: "level_3",
    eventType: "incorrect_submission",
    targetConcept: "equivalent ratios",
    hintCount: 0,
    timeSpentSeconds: 42,
  };

  it("requires concrete diagnosis when answers are present", () => {
    const event: GameEvent = {
      ...baseEvent,
      playerAnswer: "3:4",
      correctAnswer: "6:8",
      mistakeCategory: "not_scaled",
    };
    const out = buildUserPrompt(event, [], sampleGame);
    expect(out).toContain("Player's answer: 3:4");
    expect(out).toContain("Correct answer: 6:8");
    expect(out).toContain("Mistake category: not_scaled");
    expect(out).toContain("Diagnose the specific slip");
  });

  it("uses inference instructions when telemetry is thin", () => {
    const out = buildUserPrompt(baseEvent, [], sampleGame);
    expect(out).toContain("Limited telemetry");
  });

  it("pretty-prints additionalContext", () => {
    const event: GameEvent = {
      ...baseEvent,
      additionalContext: { questionStem: "If 2 apples cost $1…", optionChosen: "B" },
    };
    const out = buildUserPrompt(event, [], sampleGame);
    expect(out).toContain('"questionStem": "If 2 apples cost $1…"');
    expect(out).toContain("Structured context from the game");
  });

  it("escalates hint specificity after multiple hints", () => {
    const event: GameEvent = {
      ...baseEvent,
      eventType: "hint_request",
      hintCount: 3,
    };
    const out = buildUserPrompt(event, [], sampleGame);
    expect(out).toContain("Later hint (3 hints used)");
  });

  it("includes mistake guide for freeform messages when embedded in a game", () => {
    const event: GameEvent = {
      gameId: "demo-game",
      levelId: "level_1",
      eventType: "user_message",
      targetConcept: "ratios",
      hintCount: 0,
      timeSpentSeconds: 0,
      additionalContext: { userMessage: "Why is my ratio wrong?" },
    };
    const gameWithGuide = {
      ...sampleGame,
      mistakeGuide: "Check whether both parts were scaled by the same factor.",
    };
    const out = buildUserPrompt(event, [], gameWithGuide);
    expect(out).toContain("Typical misconceptions in this game");
    expect(out).toContain("same factor");
  });
});
