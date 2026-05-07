import { NextRequest, NextResponse } from "next/server";
import { sanitizeForSpeech } from "@/lib/sanitizeForSpeech";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_LAURIE =
  process.env.ELEVENLABS_VOICE_LAURIE || "Xb7hH8MSUJpSbSDYk0k2";
const ELEVENLABS_VOICE_LIVVY =
  process.env.ELEVENLABS_VOICE_LIVVY || "cgSgspJ2msm6clMCkdW9";

const VOICE_MAP: Record<string, string> = {
  Laurie: ELEVENLABS_VOICE_LAURIE,
  Livvy: ELEVENLABS_VOICE_LIVVY,
};

const VOICE_SETTINGS: Record<string, object> = {
  Laurie: { stability: 0.55, similarity_boost: 0.8, style: 0.3, speed: 0.95 },
  Livvy: { stability: 0.4, similarity_boost: 0.8, style: 0.55, speed: 1.05 },
};

const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_CHARS = 1_500;

export async function POST(request: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
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
  if (!Object.prototype.hasOwnProperty.call(VOICE_MAP, speaker)) {
    return NextResponse.json({ error: "Unknown speaker" }, { status: 400 });
  }

  const voiceId = VOICE_MAP[speaker];
  const voiceSettings = VOICE_SETTINGS[speaker];
  const spokenText = sanitizeForSpeech(text);

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: spokenText,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`[TTS] ElevenLabs error ${res.status}:`, err);
      if (res.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded for ElevenLabs TTS",
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
        // Don't allow shared caches (CDN, proxies) to store responses keyed
        // only by URL — request bodies are user-supplied text and could be
        // served back to a different user.
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[TTS] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal TTS error" },
      { status: 500 }
    );
  }
}
