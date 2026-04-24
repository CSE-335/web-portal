import { NextRequest, NextResponse } from "next/server";
import { sanitizeForSpeech } from "@/lib/sanitizeForSpeech";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "tts-1";

const ALLOWED_SPEAKERS = new Set(["Laurie", "Livvy", "You"]);
const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_CHARS = 1_500;

function voiceForSpeaker(speaker: string): string {
  const laurie = process.env.OPENAI_TTS_VOICE_LAURIE || "nova";
  const livvy = process.env.OPENAI_TTS_VOICE_LIVVY || "shimmer";
  const you = process.env.OPENAI_TTS_VOICE_YOU || "alloy";

  if (speaker === "Livvy") return livvy;
  if (speaker === "You") return you;
  return laurie;
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { text, speaker } = parsed as { text?: unknown; speaker?: unknown };

  if (typeof text !== "string" || typeof speaker !== "string") {
    return NextResponse.json({ error: "Missing text or speaker" }, { status: 400 });
  }
  if (text.length === 0 || text.length > MAX_TEXT_CHARS) {
    return NextResponse.json(
      { error: `text must be 1..${MAX_TEXT_CHARS} characters` },
      { status: 400 }
    );
  }
  if (!ALLOWED_SPEAKERS.has(speaker)) {
    return NextResponse.json({ error: "Unknown speaker" }, { status: 400 });
  }

  const spokenText = sanitizeForSpeech(text);
  const voice = voiceForSpeaker(speaker);

  try {
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
      const err = await res.text().catch(() => "");
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
        { error: "Upstream TTS request failed" },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, no-store",
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
