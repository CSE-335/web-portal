import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/upstashRateLimit";
import { sanitizeForSpeech } from "@/lib/sanitizeForSpeech";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "tts-1";

function voiceForSpeaker(speaker: string): string {
  const laurie = process.env.OPENAI_TTS_VOICE_LAURIE || "nova";
  const livvy = process.env.OPENAI_TTS_VOICE_LIVVY || "shimmer";
  const you = process.env.OPENAI_TTS_VOICE_YOU || "alloy";

  if (speaker === "Livvy") return livvy;
  if (speaker === "You") return you;
  return laurie;
}

const DEFAULT_TTS_RATE_LIMIT = 10;
type TtsRateLimitWindow = `${number} ${"s" | "m" | "h" | "d"}`;
const DEFAULT_TTS_RATE_WINDOW: TtsRateLimitWindow = "1 m";

function getTtsRateLimitConfig(): { limit: number; window: TtsRateLimitWindow } {
  const parsed = Number.parseInt(process.env.TTS_RATE_LIMIT ?? "", 10);
  const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTS_RATE_LIMIT;
  const rawWindow = process.env.TTS_RATE_LIMIT_WINDOW?.trim();
  const window = (rawWindow || DEFAULT_TTS_RATE_WINDOW) as TtsRateLimitWindow;
  return { limit, window };
}

export async function POST(request: NextRequest) {
  const { limit: ttsRateLimit, window: ttsRateWindow } = getTtsRateLimitConfig();
  const rateLimitResult = await enforceRateLimit({
    request,
    prefix: "@upstash/ratelimit",
    limit: ttsRateLimit,
    window: ttsRateWindow,
    identifierSuffix: "ai:tts",
  });
  if (rateLimitResult) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded for TTS",
        code: "tts_rate_limit",
      },
      {
        status: rateLimitResult.status,
        headers: {
          ...rateLimitResult.headers,
          "X-TTS-Limited-By": "upstash",
        },
      },
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const { text, speaker } = (await request.json()) as {
      text: string;
      speaker: string;
    };

    if (!text || !speaker) {
      return NextResponse.json(
        { error: "Missing text or speaker" },
        { status: 400 }
      );
    }

    const spokenText = sanitizeForSpeech(text);
    const voice = voiceForSpeaker(speaker);

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        voice,
        input: spokenText,
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[TTS/OpenAI] error ${res.status}:`, err);
      if (res.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded for OpenAI TTS",
            code: "tts_rate_limit",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `OpenAI TTS error: ${res.status}` },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[TTS/OpenAI] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal TTS error" },
      { status: 500 }
    );
  }
}
