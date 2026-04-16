/** @jest-environment node */
import {
  AssistantRequestError,
  buildFollowUpEvent,
  streamEvent,
} from "./assistantApi";
import type { DialogueLine, GameEvent } from "../types";

function makeEvent(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    gameId: "general",
    levelId: "level-1",
    eventType: "hint_request",
    targetConcept: "fractions",
    hintCount: 1,
    timeSpentSeconds: 10,
    additionalContext: {},
    ...overrides,
  };
}

describe("streamEvent", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("throws AssistantRequestError with a cooldown when the API returns 429", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1_000);
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": "5",
        },
      }),
    );

    const callbacks = {
      onLines: jest.fn(),
      onFinish: jest.fn(),
      onError: jest.fn(),
    };

    await expect(
      streamEvent("/api/assistant", makeEvent(), [], 4, callbacks),
    ).rejects.toMatchObject<Partial<AssistantRequestError>>({
      name: "AssistantRequestError",
      message: "Too many requests",
      cooldownUntilMs: 6_000,
    });
  });

  it("emits lines and finishes for a JSON assistant response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            lines: [
              { speaker: "Livvy", text: "First line", emotion: "encouraging" },
              { speaker: "Laurie", text: "Second line", emotion: "speaking" },
            ],
            summary: "Assistant summary",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const callbacks = {
      onLines: jest.fn(),
      onFinish: jest.fn(),
      onError: jest.fn(),
    };

    await streamEvent("/api/assistant", makeEvent(), [], 4, callbacks);

    expect(callbacks.onLines).toHaveBeenCalledWith([
      { speaker: "Livvy", text: "First line", emotion: "encouraging" },
      { speaker: "Laurie", text: "Second line", emotion: "speaking" },
    ]);
    expect(callbacks.onFinish).toHaveBeenCalledWith("Assistant summary", [
      { speaker: "Livvy", text: "First line", emotion: "encouraging" },
      { speaker: "Laurie", text: "Second line", emotion: "speaking" },
    ]);
  });

  it("throws the API error message for an unsuccessful JSON response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: "Assistant failed" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    const callbacks = {
      onLines: jest.fn(),
      onFinish: jest.fn(),
      onError: jest.fn(),
    };

    await expect(
      streamEvent("/api/assistant", makeEvent(), [], 4, callbacks),
    ).rejects.toThrow("Assistant failed");
  });
});

describe("buildFollowUpEvent", () => {
  const recentHistory: DialogueLine[] = [
    { speaker: "Livvy", text: "Line 1", emotion: "thinking" },
    { speaker: "Laurie", text: "Line 2", emotion: "speaking" },
  ];

  it("changes the event type to hint_request for hint follow-ups", () => {
    const result = buildFollowUpEvent(makeEvent({ eventType: "level_start" }), "hint", recentHistory);

    expect(result.eventType).toBe("hint_request");
    expect(result.additionalContext).toEqual({
      followUpType: "hint",
      priorDialogue: recentHistory,
    });
  });

  it("changes the event type to recap_request for summarize follow-ups", () => {
    const result = buildFollowUpEvent(
      makeEvent({ eventType: "correct_submission", additionalContext: { source: "game" } }),
      "summarize",
      recentHistory,
    );

    expect(result.eventType).toBe("recap_request");
    expect(result.additionalContext).toEqual({
      source: "game",
      followUpType: "summarize",
      priorDialogue: recentHistory,
    });
  });
});
