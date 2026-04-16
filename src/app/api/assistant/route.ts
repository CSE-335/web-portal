// AI tutor API — uses Anthropic claude-sonnet-4-6, falls back to static responses if no key
import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { AssistantAPIRequest, AssistantAPIResponse } from "@/features/assistant/types";
import { buildSystemPrompt, buildUserPrompt } from "./lib/prompts";
import { AssistantResponseSchema } from "./lib/schema";
import { getStaticFallback } from "./lib/fallbacks";

const DEFAULT_MAX_LINES = 6;

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

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("[Assistant] ANTHROPIC_API_KEY not configured. Using static fallback.");
      return NextResponse.json({
        success: true,
        data: getStaticFallback(event),
      } satisfies AssistantAPIResponse);
    }

    const lineLimit = Math.min(maxLines || DEFAULT_MAX_LINES, 8);
    const systemPrompt = buildSystemPrompt(lineLimit);
    const userPrompt = buildUserPrompt(event, conversationHistory);

    try {
      const result = streamObject({
        model: anthropic("claude-sonnet-4-6"),
        schema: AssistantResponseSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      return result.toTextStreamResponse();
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
