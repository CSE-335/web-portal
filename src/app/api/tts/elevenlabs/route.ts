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

export async function POST(request: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
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

    const voiceId = VOICE_MAP[speaker] || VOICE_MAP.Laurie;
    const voiceSettings = VOICE_SETTINGS[speaker] || VOICE_SETTINGS.Laurie;
    const spokenText = sanitizeForSpeech(text);

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
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
      const err = await res.text();
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
        { error: `ElevenLabs API error: ${res.status}` },
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
    console.error("[TTS] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal TTS error" },
      { status: 500 }
    );
  }
}
