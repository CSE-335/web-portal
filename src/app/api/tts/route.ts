import { NextRequest, NextResponse } from "next/server";

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

function sanitizeForSpeech(text: string): string {
  let s = text;

  // Matrices: [[1,0],[0,1]] → "the matrix: 1, 0, 0, 1"
  s = s.replace(/\[\[(.+?)\]\]/g, (_match, inner: string) => {
    const entries = inner.replace(/\]\s*,\s*\[/g, ", ").replace(/,/g, ", ");
    return `the matrix: ${entries}`;
  });

  // Remaining brackets: [1, 2, 3] → "1, 2, 3"
  s = s.replace(/\[([^\]]+)\]/g, "$1");

  // Exponents: x^2 → "x to the power of 2", 3^n → "3 to the power of n"
  s = s.replace(/(\w+)\^(\w+)/g, "$1 to the power of $2");

  // Multiplication: 3*4 or 3×4 → "3 times 4"
  s = s.replace(/(\d+)\s*[*×]\s*(\d+)/g, "$1 times $2");

  // Division: 6/2 → "6 divided by 2" (only digit/digit to avoid breaking words)
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, "$1 divided by $2");

  // Plus/minus between numbers: 3+4 → "3 plus 4", 5-2 → "5 minus 2"
  s = s.replace(/(\d+)\s*\+\s*(\d+)/g, "$1 plus $2");
  s = s.replace(/(\d+)\s*-\s*(\d+)/g, "$1 minus $2");

  // Equals sign: = → "equals"
  s = s.replace(/\s*=\s*/g, " equals ");

  // ≠ → "is not equal to"
  s = s.replace(/≠/g, "is not equal to");

  // ≤ ≥ → spoken form
  s = s.replace(/≤/g, "is less than or equal to");
  s = s.replace(/≥/g, "is greater than or equal to");

  // sqrt or √ → "the square root of"
  s = s.replace(/√(\w+)/g, "the square root of $1");
  s = s.replace(/sqrt\(([^)]+)\)/gi, "the square root of $1");

  // Collapse extra whitespace
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

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
