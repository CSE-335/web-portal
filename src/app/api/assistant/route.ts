// AI tutor API — prefers OpenAI (ASSISTANT_OPENAI_MODEL / gpt-4o-mini), then Anthropic; static fallback if all fail
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { AssistantAPIRequest, AssistantAPIResponse } from "@/features/assistant/types";
import { buildSystemPrompt, buildUserPrompt } from "./lib/prompts";
import { AssistantResponseSchema } from "./lib/schema";
import { getStaticFallback } from "./lib/fallbacks";
import { getAssistantGameIntegration } from "@/features/assistant/gameIntegration";

const DEFAULT_MAX_LINES = 6;

async function generateAssistantReply(systemPrompt: string, userPrompt: string) {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const openaiModel = process.env.ASSISTANT_OPENAI_MODEL || "gpt-4o-mini";

  const withAnthropic = () =>
    generateObject({
      model: anthropic("claude-sonnet-4-6"),
      schema: AssistantResponseSchema,
      system: systemPrompt,
      prompt: userPrompt,
    }).then((r) => r.object);

  const withOpenAI = () =>
    generateObject({
      model: openai(openaiModel),
      schema: AssistantResponseSchema,
      system: systemPrompt,
      prompt: userPrompt,
    }).then((r) => r.object);

  const errors: unknown[] = [];

  if (hasOpenAI) {
    try {
      return await withOpenAI();
    } catch (e) {
      errors.push(e);
      console.error("[Assistant] OpenAI request failed:", e);
    }
  }

  if (hasAnthropic) {
    try {
      return await withAnthropic();
    } catch (e) {
      errors.push(e);
      console.error("[Assistant] Anthropic request failed:", e);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, "All configured LLM providers failed");
  }

  throw new Error("No LLM provider configured");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssistantAPIRequest;
    const { event, conversationHistory, maxLines } = body;

    if (!event || !event.gameId || !event.eventType) {
      return NextResponse.json(
        { success: false, error: "Missing required event fields" } satisfies AssistantAPIResponse,
        { status: 400 },
      );
    }

    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

    if (!hasAnthropic && !hasOpenAI) {
      console.warn(
        "[Assistant] No provider key configured (OPENAI_API_KEY or ANTHROPIC_API_KEY). Using static fallback.",
      );
      return NextResponse.json({
        success: true,
        data: getStaticFallback(event),
      } satisfies AssistantAPIResponse);
    }

    const lineLimit = Math.min(maxLines || DEFAULT_MAX_LINES, 8);
    const gameProfile = getAssistantGameIntegration(event.gameId);
    const systemPrompt = buildSystemPrompt(lineLimit, gameProfile);
    const userPrompt = buildUserPrompt(event, conversationHistory, gameProfile);

    try {
      const data = await generateAssistantReply(systemPrompt, userPrompt);
      return NextResponse.json({
        success: true,
        data,
      } satisfies AssistantAPIResponse);
    } catch (llmError) {
      console.error("[Assistant] LLM call failed, using fallback:", llmError);
      return NextResponse.json({
        success: true,
        data: getStaticFallback(event),
      } satisfies AssistantAPIResponse);
    }
  } catch (err) {
    console.error("[Assistant] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal assistant error" } satisfies AssistantAPIResponse,
      { status: 500 },
    );
  }
}
