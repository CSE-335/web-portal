/** @jest-environment node */
import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { buildSystemPrompt, buildUserPrompt } from "./lib/prompts";
import { getStaticFallback } from "./lib/fallbacks";
import { getAssistantGameIntegration } from "@/features/assistant/gameIntegration";
import { POST } from "./route";

jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn((model: string) => `openai:${model}`),
}));

jest.mock("./lib/prompts", () => ({
  buildSystemPrompt: jest.fn(() => "system prompt"),
  buildUserPrompt: jest.fn(() => "user prompt"),
}));

jest.mock("./lib/fallbacks", () => ({
  getStaticFallback: jest.fn(),
}));

jest.mock("@/features/assistant/gameIntegration", () => ({
  getAssistantGameIntegration: jest.fn(),
}));

const mockedGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>;
const mockedBuildSystemPrompt = buildSystemPrompt as jest.MockedFunction<typeof buildSystemPrompt>;
const mockedBuildUserPrompt = buildUserPrompt as jest.MockedFunction<typeof buildUserPrompt>;
const mockedGetStaticFallback = getStaticFallback as jest.MockedFunction<typeof getStaticFallback>;
const mockedGetAssistantGameIntegration = getAssistantGameIntegration as jest.MockedFunction<
  typeof getAssistantGameIntegration
>;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/assistant", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

/** Body is not valid JSON — triggers the outer catch and 500. */
function makeMalformedJsonRequest() {
  return new NextRequest("http://localhost/api/assistant", {
    method: "POST",
    body: "not-json{{{",
    headers: {
      "content-type": "application/json",
    },
  });
}

function validEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    gameId: "general",
    levelId: "level-1",
    eventType: "hint_request",
    targetConcept: "fractions",
    hintCount: 0,
    timeSpentSeconds: 12,
    ...overrides,
  };
}

describe("POST /api/assistant", () => {
  const originalOpenAIKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.OPENAI_API_KEY;

    mockedGetStaticFallback.mockReturnValue({
      lines: [
        { speaker: "Livvy", text: "Fallback line", emotion: "encouraging" },
      ],
      summary: "Fallback summary",
    });

    mockedGetAssistantGameIntegration.mockReturnValue({
      slug: "general",
      title: "General",
      subject: "STEM",
      tutorBrief: "Help with STEM",
      defaultTargetConcept: "general",
    });
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = originalOpenAIKey;
  });

  it("returns 400 when required event fields are missing", async () => {
    const response = await POST(makeRequest({ event: null }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: "Missing required event fields",
    });
  });

  it("returns 400 when event is omitted from the body", async () => {
    const response = await POST(makeRequest({}));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Missing required event fields");
  });

  it("returns 400 when gameId is missing", async () => {
    const response = await POST(
      makeRequest({
        event: {
          levelId: "level-1",
          eventType: "hint_request",
          targetConcept: "fractions",
          hintCount: 0,
          timeSpentSeconds: 12,
        },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Missing required event fields");
  });

  it("returns 400 when eventType is missing", async () => {
    const response = await POST(
      makeRequest({
        event: {
          gameId: "general",
          levelId: "level-1",
          targetConcept: "fractions",
          hintCount: 0,
          timeSpentSeconds: 12,
        },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Missing required event fields");
  });

  it("returns 400 when gameId or eventType is an empty string", async () => {
    const missingGameId = await POST(
      makeRequest({ event: validEvent({ gameId: "" }) }),
    );
    expect(missingGameId.status).toBe(400);

    const missingEventType = await POST(
      makeRequest({ event: validEvent({ eventType: "" }) }),
    );
    expect(missingEventType.status).toBe(400);
  });

  it("returns 500 when the request body is not valid JSON", async () => {
    const response = await POST(makeMalformedJsonRequest());
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: "Internal assistant error",
    });
  });

  it("returns the static fallback when no LLM keys are configured", async () => {
    const response = await POST(
      makeRequest({
        event: {
          gameId: "general",
          levelId: "level-1",
          eventType: "hint_request",
          targetConcept: "fractions",
          hintCount: 0,
          timeSpentSeconds: 12,
        },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: {
        lines: [{ speaker: "Livvy", text: "Fallback line", emotion: "encouraging" }],
        summary: "Fallback summary",
      },
    });
    expect(mockedGenerateObject).not.toHaveBeenCalled();
    expect(mockedGetStaticFallback).toHaveBeenCalledTimes(1);
  });

  it("returns generated assistant data when the LLM call succeeds", async () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    mockedGenerateObject.mockResolvedValue({
      object: {
        lines: [{ speaker: "Laurie", text: "Generated line", emotion: "speaking" }],
        summary: "Generated summary",
      },
    } as Awaited<ReturnType<typeof generateObject>>);

    const response = await POST(
      makeRequest({
        event: {
          gameId: "general",
          levelId: "level-1",
          eventType: "hint_request",
          targetConcept: "fractions",
          hintCount: 1,
          timeSpentSeconds: 20,
        },
        conversationHistory: [{ speaker: "You", text: "Help me", emotion: "thinking" }],
        maxLines: 99,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: {
        lines: [{ speaker: "Laurie", text: "Generated line", emotion: "speaking" }],
        summary: "Generated summary",
      },
    });
    expect(mockedBuildSystemPrompt).toHaveBeenCalledWith(
      8,
      expect.objectContaining({ slug: "general" }),
    );
    expect(mockedBuildUserPrompt).toHaveBeenCalled();
    expect(mockedGetStaticFallback).not.toHaveBeenCalled();
  });

  it("defaults maxLines to 6 and passes it to buildSystemPrompt", async () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    mockedGenerateObject.mockResolvedValue({
      object: {
        lines: [{ speaker: "Laurie", text: "Line", emotion: "speaking" }],
        summary: "S",
      },
    } as Awaited<ReturnType<typeof generateObject>>);

    await POST(
      makeRequest({
        event: validEvent(),
        // omit maxLines — route should use DEFAULT_MAX_LINES (6)
      }),
    );

    expect(mockedBuildSystemPrompt).toHaveBeenCalledWith(
      6,
      expect.objectContaining({ slug: "general" }),
    );
  });

  it("uses static fallback when OpenAI key is absent even if Anthropic key exists", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.ANTHROPIC_API_KEY = "anthropic-only";

    const response = await POST(makeRequest({ event: validEvent() }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.summary).toBe("Fallback summary");
    expect(mockedGenerateObject).not.toHaveBeenCalled();
  });

  it("falls back when OpenAI fails even if Anthropic key is configured", async () => {
    process.env.OPENAI_API_KEY = "openai";
    process.env.ANTHROPIC_API_KEY = "anthropic";
    mockedGenerateObject.mockRejectedValueOnce(new Error("OpenAI down"));

    const response = await POST(makeRequest({ event: validEvent() }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.summary).toBe("Fallback summary");
    expect(mockedGenerateObject).toHaveBeenCalledTimes(1);
  });

  it("falls back when OpenAI call fails", async () => {
    process.env.OPENAI_API_KEY = "o";
    process.env.ANTHROPIC_API_KEY = "a";
    mockedGenerateObject.mockRejectedValueOnce(new Error("openai failed"));

    const response = await POST(makeRequest({ event: validEvent() }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.summary).toBe("Fallback summary");
    expect(mockedGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockedGetStaticFallback).toHaveBeenCalledTimes(1);
  });

  it("falls back when the LLM request fails", async () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    mockedGenerateObject.mockRejectedValue(new Error("LLM failed"));

    const response = await POST(
      makeRequest({
        event: {
          gameId: "general",
          levelId: "level-1",
          eventType: "correct_submission",
          targetConcept: "fractions",
          hintCount: 0,
          timeSpentSeconds: 8,
        },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: {
        lines: [{ speaker: "Livvy", text: "Fallback line", emotion: "encouraging" }],
        summary: "Fallback summary",
      },
    });
    expect(mockedGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockedGetStaticFallback).toHaveBeenCalledTimes(1);
  });
});
