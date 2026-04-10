/**
 * @jest-environment jsdom
 */
import {
  initStemAssistantBridge,
  sendStemAssistantEvent,
  stemAssistant,
  setStemAssistantLevel,
} from "./index";

describe("stem-assistant-bridge", () => {
  const postMessage = jest.fn();
  const originalParent = window.parent;

  beforeEach(() => {
    postMessage.mockClear();
    Object.defineProperty(window, "parent", {
      configurable: true,
      value: { postMessage } as unknown as Window,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "parent", {
      configurable: true,
      value: originalParent,
    });
  });

  it("sends ASSISTANT_GAME_EVENT with merged payload", () => {
    initStemAssistantBridge({
      gameId: "demo-game",
      defaultLevelId: "L1",
      defaultTargetConcept: "demo_topic",
    });

    stemAssistant.incorrect({
      playerAnswer: "x",
      correctAnswer: "y",
    });

    expect(postMessage).toHaveBeenCalledTimes(2);

    const levelStart = postMessage.mock.calls[0];
    expect(levelStart[0]).toMatchObject({
      type: "ASSISTANT_GAME_EVENT",
      payload: expect.objectContaining({
        gameId: "demo-game",
        levelId: "L1",
        eventType: "level_start",
        targetConcept: "demo_topic",
      }),
    });

    const wrong = postMessage.mock.calls[1];
    expect(wrong[0]).toMatchObject({
      type: "ASSISTANT_GAME_EVENT",
      payload: expect.objectContaining({
        eventType: "incorrect_submission",
        playerAnswer: "x",
        correctAnswer: "y",
      }),
    });
  });

  it("increments hint count on hintRequest", () => {
    initStemAssistantBridge({ gameId: "g" });
    stemAssistant.hintRequest();
    stemAssistant.hintRequest();

    const last = postMessage.mock.calls[postMessage.mock.calls.length - 1];
    expect(last[0].payload.hintCount).toBe(2);
  });

  it("updates level via setStemAssistantLevel", () => {
    initStemAssistantBridge({ gameId: "g" });
    setStemAssistantLevel("L9", "fractions");

    sendStemAssistantEvent({ eventType: "correct_submission" });
    const last = postMessage.mock.calls[postMessage.mock.calls.length - 1];
    expect(last[0].payload.levelId).toBe("L9");
    expect(last[0].payload.targetConcept).toBe("fractions");
  });
});
